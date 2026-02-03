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
        // effective_from: { lte: now },
      
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

  // Input validation
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return res
      .status(400)
      .json({ 
        success: false,
        message: "Value must be a finite number" 
      });
  }

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

// Validate effective_from is not in the past (including today)
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Set to start of today

if (fromDate < today) {
  return res
    .status(400)
    .json({ 
      success: false,
      message: "effective_from must be today or a future date" 
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
    
    // Validate effective_until is after effective_from
    if (d <= fromDate) {
      return res.status(400).json({
        success: false,
        message: "effective_until must be after effective_from",
      });
    }
    
    untilDate = d;
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      // Check for duplicate effective_from date
      const existingRateWithSameFrom = await tx.rate_configurations.findFirst({
        where: {
          rate_type: type,
          effective_from: fromDate,
        },
      });

      if (existingRateWithSameFrom) {
        throw new Error("DUPLICATE_EFFECTIVE_FROM");
      }

      // Find the currently active rate (if any)
      const currentActive = await tx.rate_configurations.findFirst({
        where: {
          rate_type: type,
          is_active: true,
        },
        orderBy: { effective_from: "desc" },
      });

      // Find the previous rate (most recent one before the new effective_from)
      const previousRate = await tx.rate_configurations.findFirst({
        where: {
          rate_type: type,
          effective_from: { lt: fromDate },
          NOT: currentActive ? { id: currentActive.id } : undefined,
        },
        orderBy: { effective_from: "desc" },
      });

      // If there's a previous rate, check if we need to adjust its effective_until
      if (previousRate && previousRate.effective_until) {
        const previousUntil = previousRate.effective_until.getTime();
        const newFrom = fromDate.getTime();
        
        if (previousUntil > newFrom) {
          // Adjust previous rate's effective_until to be exactly before the new fromDate
          await tx.rate_configurations.update({
            where: { id: previousRate.id },
            data: {
              effective_until: new Date(fromDate.getTime() - 1), // Set to 1ms before new fromDate
              updated_at: new Date(),
            },
          });
        }
      }

      // Find the next rate (earliest one after the new effective_from)
      const nextRate = await tx.rate_configurations.findFirst({
        where: {
          rate_type: type,
          effective_from: { gt: fromDate },
        },
        orderBy: { effective_from: "asc" },
      });

      // If there's a next rate and we're setting an effective_until, check for overlap
      if (nextRate && untilDate) {
        const nextFrom = nextRate.effective_from.getTime();
        const newUntil = untilDate.getTime();
        
        if (newUntil > nextFrom) {
          // Adjust our effective_until to be exactly before the next rate's effective_from
          untilDate = new Date(nextFrom - 1);
        }
      }

      // If there's a current active rate, deactivate it and set its effective_until
      if (currentActive) {
        // Set current active rate's effective_until to be exactly before the new rate's effective_from
        const adjustedEffectiveUntil = new Date(fromDate.getTime() - 1);
        
        await tx.rate_configurations.update({
          where: { id: currentActive.id },
          data: {
            effective_until: adjustedEffectiveUntil,
            is_active: false,
            updated_at: new Date(),
          },
        });

        // Also update the current active rate in audit logs
        currentActive.effective_until = adjustedEffectiveUntil;
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

      // Create audit logs
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
            previous_active_rate: currentActive ? {
              id: currentActive.id,
              value: currentActive.value,
              effective_from: currentActive.effective_from,
              effective_until: currentActive.effective_until,
              updated_to: {
                effective_until: new Date(fromDate.getTime() - 1),
                is_active: false,
              }
            } : null,
            previous_rate_adjusted: previousRate && previousRate.effective_until && 
              previousRate.effective_until.getTime() > fromDate.getTime() ? {
                id: previousRate.id,
                previous_effective_until: previousRate.effective_until,
                new_effective_until: new Date(fromDate.getTime() - 1),
              } : null,
            next_rate_adjusted: nextRate && untilDate && 
              untilDate.getTime() > nextRate.effective_from.getTime() ? {
                id: nextRate.id,
                original_new_effective_until: new Date(effective_until || ''),
                adjusted_effective_until: new Date(nextRate.effective_from.getTime() - 1),
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
            previous_active_deactivated: currentActive ? {
              id: currentActive.id,
              effective_until_set_to: new Date(fromDate.getTime() - 1),
            } : null,
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
    
    if (error.message === "DUPLICATE_EFFECTIVE_FROM") {
      return res.status(409).json({
        success: false,
        message: "Rate with this type and effective_from already exists",
      });
    }
    
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
  const user = req.user!;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return res
      .status(400)
      .json({ 
        success: false,
        message: "Value must be a finite number" 
      });
  }

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
    
    // Validate effective_until is after effective_from
    if (d <= fromDate) {
      return res.status(400).json({
        success: false,
        message: "effective_until must be after effective_from",
      });
    }
    
    untilDate = d;
  }

  try {
    // Find the active rate for this type
    const existing = await prisma.rate_configurations.findFirst({
      where: {
        rate_type: type,
        is_active: true,
      },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ 
          success: false,
          message: "No active rate found for this type" 
        });
    }

    const isEffectiveFromChanging = fromDate.getTime() !== existing.effective_from.getTime();

    // Check for duplicate effective_from date if changing
    if (isEffectiveFromChanging) {
      const duplicateCheck = await prisma.rate_configurations.findFirst({
        where: {
          rate_type: type,
          effective_from: fromDate,
          NOT: {
            id: existing.id,
          },
        },
      });

      if (duplicateCheck) {
        return res.status(409).json({
          success: false,
          message: "A rate with this effective_from date already exists for this type",
        });
      }
    }

    // Find the previous rate (most recent one before the new effective_from)
    const previousRate = await prisma.rate_configurations.findFirst({
      where: {
        rate_type: type,
        effective_from: { lt: fromDate },
        NOT: {
          id: existing.id,
        },
      },
      orderBy: {
        effective_from: 'desc',
      },
    });

    // Validate new effective_from is greater than previous rate's effective_until
    if (previousRate && previousRate.effective_until) {
      const previousUntil = previousRate.effective_until.getTime();
      const newFrom = fromDate.getTime();
      
      if (newFrom <= previousUntil) {
        return res.status(400).json({
          success: false,
          message: `New effective_from must be greater than previous rate's effective_until (${previousRate.effective_until.toISOString()})`,
        });
      }
    }

    // Find the next rate (earliest one after the new effective_from)
    const nextRate = await prisma.rate_configurations.findFirst({
      where: {
        rate_type: type,
        effective_from: { gt: fromDate },
        NOT: {
          id: existing.id,
        },
      },
      orderBy: {
        effective_from: 'asc',
      },
    });

    // Validate no overlap with next rate
    if (nextRate && untilDate) {
      const nextFrom = nextRate.effective_from.getTime();
      const newUntil = untilDate.getTime();
      
      if (newUntil > nextFrom) {
        return res.status(400).json({
          success: false,
          message: "New effective_until creates overlap with next rate period",
        });
      }
    } else if (nextRate && !untilDate) {
      // If we're not setting an effective_until but there's a next rate,
      // we need to set effective_until to be before the next rate's effective_from
      untilDate = new Date(nextRate.effective_from.getTime() - 1);
    }

    // If we're updating effective_until, validate it's not in the past
    // (only check this for effective_until, not effective_from)
    const now = new Date();
    if (untilDate && untilDate <= now) {
      return res.status(400).json({
        success: false,
        message: "effective_until must be greater than current date",
      });
    }

    // Update the rate
    const updated = await prisma.rate_configurations.update({
      where: {
        id: existing.id,
      },
      data: {
        value,
        source: source?.trim() || null,
        effective_from: fromDate,
        effective_until: untilDate,
        updated_at: new Date(),
      },
    });

    // Create audit log for the update
    await prisma.audit_logs.create({
      data: {
        user_id: user.user_id,
        action_type: AuditAction.UPDATE,
        entity_type: 'rate_configurations',
        entity_id: existing.id,
        changes: {
          action: 'update_rate',
          rate_type: type,
          previous_value: existing.value,
          new_value: value,
          previous_source: existing.source,
          new_source: source?.trim() || null,
          previous_effective_from: existing.effective_from,
          new_effective_from: fromDate,
          previous_effective_until: existing.effective_until,
          new_effective_until: untilDate,
          previous_rate_info: previousRate ? {
            id: previousRate.id,
            effective_until: previousRate.effective_until,
          } : null,
          next_rate_info: nextRate ? {
            id: nextRate.id,
            effective_from: nextRate.effective_from,
          } : null,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: req.ip || req.socket.remoteAddress,
      },
    });

    return res.json({
      success: true,
      message: "Rate updated successfully",
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
        created_by: updated.created_by,
      },
    });
  } catch (error: any) {
    console.error("Update rate error:", error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Rate not found",
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Failed to update rate",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
