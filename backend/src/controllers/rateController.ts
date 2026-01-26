// src/controllers/rateController.ts
import type { Request, Response } from "express";
import prisma from "../config/prisma.ts";
import type { AuthRequest } from "../middlewares/authMiddleware.ts";
import { 
  UserRole, 
  AuditAction, 
  ConfigCategory, 
  PaymentStatus, 
  EncumbranceStatus 
} from '../generated/prisma/enums.ts';

type RateType =
  | "LEASE_INTEREST_RATE"
  | "PENALTY_RATE"
  | "PENALTY_CONSTRUCTION_DELAY"
  | "GRADE_FACTOR_MULTIPLIER"
  | "ANNUAL_ESCALATION_RATE"
  | "DOWN_PAYMENT_INTEREST"
  | "LATE_PAYMENT_GRACE_DAYS"
  | "BANK_REFERENCE_RATE";

/**
 * GET /api/rates/:type/current?at=2026-01-17T00:00:00Z
 */
// GET /api/rates/:type/current
// Returns only the rate that is active *now* for this type.
export const getCurrentRate = async (req: Request, res: Response) => {
  const { type } = req.params as { type: RateType };
  const now = new Date();

  try {
    const rate = await prisma.rate_configurations.findFirst({
      where: {
        rate_type: type,
        is_active: true,
        effective_from: { lte: now },
        OR: [
          { effective_until: null },
          { effective_until: { gte: now } },
        ],
      },
      orderBy: { effective_from: "desc" }, // latest in-range if multiple
    });

    if (!rate) {
      return res
        .status(404)
        .json({ message: "No currently effective active rate for this type" });
    }

    return res.json({
      id: rate.id,
      rate_type: rate.rate_type,
      value: rate.value,
      source: rate.source,
      effective_from: rate.effective_from,
      effective_until: rate.effective_until,
      is_active: rate.is_active,
      created_at: rate.created_at,
      updated_at: rate.updated_at,
      created_by: rate.created_by,
    });
  } catch (error) {
    console.error("Get current rate error:", error);
    return res.status(500).json({ message: "Failed to fetch rate" });
  }
};


/**
 * POST /api/rates/:type
 * Create NEW rate row for (rate_type, effective_from).
 * Fails if that composite key already exists.
 */
export const createRate = async (req: AuthRequest, res: Response) => {
  const { type } = req.params as { type: RateType };
  const { value, source, effective_from, effective_until } = req.body as {
    value: number;
    source?: string;
    effective_from: string;
    effective_until?: string | null;
  };

  const actor = req.user!;
  const userId = actor.user_id;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return res
      .status(400)
      .json({ 
        success: false,
        message: "Value must be a finite number" 
      });
  }

  // enforce 0 <= value <= 1
  if (value < 0 || value > 1) {
    return res
      .status(400)
      .json({ 
        success: false,
        message: "Value must be between 0 and 1 (inclusive)" 
      });
  }

  if (!effective_from) {
    return res
      .status(400)
      .json({ 
        success: false,
        message: "effective_from is required" 
      });
  }

  const fromDate = new Date(effective_from);
  if (Number.isNaN(fromDate.getTime())) {
    return res
      .status(400)
      .json({ 
        success: false,
        message: "Invalid effective_from; must be ISO date string" 
      });
  }

  let untilDate: Date | null = null;
  if (effective_until !== undefined && effective_until !== null) {
    const d = new Date(effective_until);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid effective_until; must be ISO date string or null",
      });
    }
    untilDate = d;
  }

  try {
    const existing = await prisma.rate_configurations.findUnique({
      where: {
        rate_type_effective_from: {
          rate_type: type,
          effective_from: fromDate,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Rate with this type and effective_from already exists. Use UPDATE endpoint instead.",
      });
    }

    const created = await prisma.$transaction(async (tx) => {
      // Find previous active rate
      const previousActive = await tx.rate_configurations.findFirst({
        where: {
          rate_type: type,
          is_active: true,
          effective_from: { lt: fromDate },
        },
        orderBy: { effective_from: "desc" },
      });

      let previousRateUpdate = null;

      // Deactivate previous rate if exists
      if (previousActive) {
        previousRateUpdate = await tx.rate_configurations.update({
          where: { id: previousActive.id },
          data: {
            effective_until: fromDate,
            is_active: false,
            updated_at: new Date(),
          },
        });
      }

      // Create new rate
      const newRate = await tx.rate_configurations.create({
        data: {
          rate_type: type,
          value,
          source: source?.trim() || null,
          effective_from: fromDate,
          effective_until: untilDate,
          created_by: userId,
          is_active: true,
        },
      });

      // Create audit log for rate creation
      await tx.audit_logs.create({
        data: {
          user_id: userId,
          action_type: AuditAction.CREATE,
          entity_type: 'rate_configurations',
          entity_id: newRate.id,
          changes: {
            action: 'create_rate',
            rate_type: type,
            value,
            source: source?.trim() || null,
            effective_from: fromDate,
            effective_until: untilDate,
            previous_active_rate: previousActive ? {
              id: previousActive.id,
              value: previousActive.value,
              effective_from: previousActive.effective_from,
              effective_until: previousActive.effective_until,
            } : null,
            previous_rate_updated: previousRateUpdate ? {
              new_effective_until: previousRateUpdate.effective_until,
              new_is_active: previousRateUpdate.is_active,
            } : null,
            actor_id: actor.user_id,
            actor_role: actor.role,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: req.ip || req.socket.remoteAddress,
        },
      });

      // Create config change audit log
      await tx.audit_logs.create({
        data: {
          user_id: userId,
          action_type: AuditAction.CONFIG_CHANGE,
          entity_type: 'rate_configurations',
          entity_id: newRate.id,
          changes: {
            action: 'rate_configuration_created',
            rate_type: type,
            value,
            effective_from: fromDate,
            actor_id: actor.user_id,
            actor_role: actor.role,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: req.ip || req.socket.remoteAddress,
        },
      });

      return newRate;
    });

    return res.status(201).json({
      success: true,
      message: "Rate created successfully",
      data: {
        id: created.id,
        rate_type: created.rate_type,
        value: created.value,
        source: created.source,
        effective_from: created.effective_from,
        effective_until: created.effective_until,
        is_active: created.is_active,
        created_at: created.created_at,
        updated_at: created.updated_at,
        created_by: created.created_by,
      },
    });
  } catch (error: any) {
    console.error("Create rate error:", error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Rate with this type and effective_from already exists",
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Failed to create rate",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * PUT /api/rates/:type
 * Update existing ACTIVE row for (rate_type, effective_from).
 */
export const updateRate = async (req: AuthRequest, res: Response) => {
  const { type } = req.params as { type: RateType };
  const { value, source, effective_from, effective_until } = req.body as {
    value: number;
    source?: string;
    effective_from: string;
    effective_until?: string | null;
  };

  const userId = req.user?.user_id;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return res
      .status(400)
      .json({ message: "Value must be a finite number" });
  }

  // NEW: enforce 0 <= value <= 1
  if (value < 0 || value > 1) {
    return res
      .status(400)
      .json({ message: "Value must be between 0 and 1 (inclusive)" });
  }

  if (!effective_from) {
    return res
      .status(400)
      .json({ message: "effective_from is required" });
  }

  const fromDate = new Date(effective_from);
  if (Number.isNaN(fromDate.getTime())) {
    return res
      .status(400)
      .json({ message: "Invalid effective_from; must be ISO date string" });
  }

  let untilDate: Date | null = null;
  if (effective_until !== undefined && effective_until !== null) {
    const d = new Date(effective_until);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({
        message: "Invalid effective_until; must be ISO date string or null",
      });
    }
    untilDate = d;
  }

  try {
    const existing = await prisma.rate_configurations.findUnique({
      where: {
        rate_type_effective_from: {
          rate_type: type,
          effective_from: fromDate,
        },
      },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ message: "Rate not found for this type and effective_from" });
    }

    if (!existing.is_active) {
      return res.status(400).json({
        message:
          "Cannot update an inactive rate record. Create a new record instead.",
      });
    }

    const updated = await prisma.rate_configurations.update({
      where: {
        rate_type_effective_from: {
          rate_type: type,
          effective_from: fromDate,
        },
      },
      data: {
        value,
        source: source?.trim() || null,
        effective_until: untilDate,
        updated_at: new Date(),
        created_by: userId ?? existing.created_by,
      },
    });

    return res.json({
      message: "Rate updated successfully",
      rate: {
        id: updated.id,
        rate_type: updated.rate_type,
        value: updated.value,
        source: updated.source,
        effective_from: updated.effective_from,
        effective_until: updated.effective_until,
        is_active: updated.is_active,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
        created_by: updated.created_by,
      },
    });
  } catch (error) {
    console.error("Update rate error:", error);
    return res.status(500).json({ message: "Failed to update rate" });
  }
};


/**
 * PATCH /api/rates/:type/deactivate
 * Body: { effective_from: string }
 * Marks a specific row as inactive (soft deactivation).
 */
export const deactivateRate = async (req: AuthRequest, res: Response) => {
  const { type } = req.params as { type: RateType };
  const { effective_from } = req.body as { effective_from: string };

  const actor = req.user!;

  if (!effective_from) {
    return res
      .status(400)
      .json({ 
        success: false,
        message: "effective_from is required" 
      });
  }

  const fromDate = new Date(effective_from);
  if (Number.isNaN(fromDate.getTime())) {
    return res
      .status(400)
      .json({ 
        success: false,
        message: "Invalid effective_from; must be ISO date string" 
      });
  }

  try {
    const existing = await prisma.rate_configurations.findUnique({
      where: {
        rate_type_effective_from: {
          rate_type: type,
          effective_from: fromDate,
        },
      },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ 
          success: false,
          message: "Rate not found for this type and effective_from" 
        });
    }

    if (!existing.is_active) {
      return res
        .status(400)
        .json({ 
          success: false,
          message: "Rate is already inactive" 
        });
    }

    // Check if there's an active rate after this one
    const nextActiveRate = await prisma.rate_configurations.findFirst({
      where: {
        rate_type: type,
        is_active: true,
        effective_from: { gt: fromDate },
      },
      orderBy: { effective_from: "asc" },
    });

    const updated = await prisma.$transaction(async (tx) => {
      const deactivatedRate = await tx.rate_configurations.update({
        where: {
          rate_type_effective_from: {
            rate_type: type,
            effective_from: fromDate,
          },
        },
        data: {
          is_active: false,
          updated_at: new Date(),
        },
      });

      // Create audit log for rate deactivation
      await tx.audit_logs.create({
        data: {
          user_id: actor.user_id,
          action_type: AuditAction.UPDATE,
          entity_type: 'rate_configurations',
          entity_id: existing.id,
          changes: {
            action: 'deactivate_rate',
            rate_type: type,
            value: existing.value,
            effective_from: existing.effective_from,
            effective_until: existing.effective_until,
            previous_status: 'ACTIVE',
            new_status: 'INACTIVE',
            next_active_rate_exists: !!nextActiveRate,
            next_active_rate: nextActiveRate ? {
              effective_from: nextActiveRate.effective_from,
              value: nextActiveRate.value,
            } : null,
            actor_id: actor.user_id,
            actor_role: actor.role,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: req.ip || req.socket.remoteAddress,
        },
      });

      // Create config change audit log
      await tx.audit_logs.create({
        data: {
          user_id: actor.user_id,
          action_type: AuditAction.CONFIG_CHANGE,
          entity_type: 'rate_configurations',
          entity_id: existing.id,
          changes: {
            action: 'rate_configuration_deactivated',
            rate_type: type,
            actor_id: actor.user_id,
            actor_role: actor.role,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: req.ip || req.socket.remoteAddress,
        },
      });

      return deactivatedRate;
    });

    return res.json({
      success: true,
      message: "Rate deactivated successfully",
      data: {
        id: updated.id,
        rate_type: updated.rate_type,
        value: updated.value,
        source: updated.source,
        effective_from: updated.effective_from,
        effective_until: updated.effective_until,
        is_active: updated.is_active,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      },
    });
  } catch (error: any) {
    console.error("Deactivate rate error:", error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Rate not found",
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Failed to deactivate rate",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/rates/history?type=...&limit=...
 */
export const getRateHistory = async (req: Request, res: Response) => {
  const typeParam = req.query.type as RateType | undefined;
  const limitParam = req.query.limit as string | undefined;

  let limit: number | undefined;

  if (limitParam !== undefined) {
    const parsed = Number(limitParam);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return res
        .status(400)
        .json({ message: "limit must be a positive number" });
    }
    limit = parsed;
  }

  try {
    const rates = await prisma.rate_configurations.findMany({
      where: typeParam ? { rate_type: typeParam } : undefined,
      orderBy: [{ rate_type: "asc" }, { effective_from: "desc" }],
      ...(limit !== undefined ? { take: limit } : {}),
    });

    if (!rates.length) {
      return res
        .status(404)
        .json({ message: "No rate history found" });
    }

    return res.json({
      count: rates.length,
      history: rates.map((r) => ({
        id: r.id,
        rate_type: r.rate_type,
        value: r.value,
        source: r.source,
        effective_from: r.effective_from,
        effective_until: r.effective_until,
        is_active: r.is_active,
        created_at: r.created_at,
        updated_at: r.updated_at,
        created_by: r.created_by,
      })),
    });
  } catch (error) {
    console.error("Get rate history error:", error);
    return res.status(500).json({ message: "Failed to fetch rate history" });
  }
};

/**
 * GET /api/rates/:type/history?limit=10
 */
export const getRateHistoryByType = async (req: Request, res: Response) => {
  const { type } = req.params as { type: RateType };
  const limitParam = req.query.limit as string | undefined;

  let limit: number | undefined;

  if (limitParam !== undefined) {
    const parsed = Number(limitParam);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return res
        .status(400)
        .json({ message: "limit must be a positive number" });
    }
    limit = parsed;
  }

  try {
    const rates = await prisma.rate_configurations.findMany({
      where: { rate_type: type },
      orderBy: { effective_from: "desc" },
      ...(limit !== undefined ? { take: limit } : {}),
    });

    if (!rates.length) {
      return res
        .status(404)
        .json({ message: "No rate history found for this type" });
    }

    return res.json({
      rate_type: type,
      count: rates.length,
      history: rates.map((r) => ({
        id: r.id,
        value: r.value,
        source: r.source,
        effective_from: r.effective_from,
        effective_until: r.effective_until,
        is_active: r.is_active,
        created_at: r.created_at,
        updated_at: r.updated_at,
        created_by: r.created_by,
      })),
    });
  } catch (error) {
    console.error("Get rate history by type error:", error);
    return res.status(500).json({ message: "Failed to fetch rate history" });
  }
};
