// src/controllers/rateController.ts
import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { MakerCheckerService } from '../services/makerCheckerService.js';
import { AuditService } from '../services/auditService.js';
import { 
  ActionType,
  EntityType,
} from '../generated/prisma/enums.js';

// Initialize services
const auditService = new AuditService();
const makerCheckerService = new MakerCheckerService(auditService);

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
 * GET /api/rates/:type/current
 * Returns only the rate that is active *now* for this type.
 */
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
 * Create NEW rate row through maker-checker
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

  // Validation
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return res.status(400).json({ 
      success: false,
      message: "Value must be a finite number" 
    });
  }

  if (value < 0 || value > 1) {
    return res.status(400).json({ 
      success: false,
      message: "Value must be between 0 and 1 (inclusive)" 
    });
  }

  if (!effective_from) {
    return res.status(400).json({ 
      success: false,
      message: "effective_from is required" 
    });
  }

  const fromDate = new Date(effective_from);
  if (Number.isNaN(fromDate.getTime())) {
    return res.status(400).json({ 
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
    // Check for duplicate
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
        message: "Rate with this type and effective_from already exists.",
      });
    }

    // Prepare request data
    const requestData = {
      rate_type: type,
      value,
      source: source?.trim() || null,
      effective_from: fromDate,
      effective_until: untilDate,
      created_by: actor.user_id,
      is_active: true,
    };

    // Create approval request
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.RATE_CONFIGURATION,
      entityId: 'pending',
      actionType: ActionType.CREATE,
      requestData,
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: null, // Rates are city-level
      comments: `Create new ${type} rate: ${value} effective from ${effective_from}`
    });

    return res.status(202).json({
      success: true,
      message: 'Rate creation request submitted for approval',
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.RATE_CONFIGURATION,
        action: ActionType.CREATE,
        approver_role: result.approvalRequest?.approver_role,
      }
    });
  } catch (error: any) {
    console.error("Create rate error:", error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message,
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
 * Update existing rate through maker-checker
 */
export const updateRate = async (req: AuthRequest, res: Response) => {
  const { type } = req.params as { type: RateType };
  const { value, source, effective_from, effective_until } = req.body as {
    value: number;
    source?: string;
    effective_from: string;
    effective_until?: string | null;
  };

  const actor = req.user!;

  // Validation
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return res.status(400).json({ 
      success: false,
      message: "Value must be a finite number" 
    });
  }

  if (value < 0 || value > 1) {
    return res.status(400).json({ 
      success: false,
      message: "Value must be between 0 and 1 (inclusive)" 
    });
  }

  if (!effective_from) {
    return res.status(400).json({ 
      success: false,
      message: "effective_from is required" 
    });
  }

  const fromDate = new Date(effective_from);
  if (Number.isNaN(fromDate.getTime())) {
    return res.status(400).json({ 
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
    // Find the rate to update
    const existing = await prisma.rate_configurations.findFirst({
      where: {
        rate_type: type,
        effective_from: fromDate,
      },
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false,
        message: "Rate not found for this type and effective_from" 
      });
    }

    // Prepare request data
    const requestData = {
      rate_id: existing.id,
      rate_type: type,
      value,
      source: source?.trim() || null,
      effective_from: fromDate,
      effective_until: untilDate,
      previous_values: {
        value: existing.value,
        source: existing.source,
        effective_until: existing.effective_until,
      }
    };

    // Create approval request
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.RATE_CONFIGURATION,
      entityId: existing.id,
      actionType: ActionType.UPDATE,
      requestData,
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: null, // Rates are city-level
      comments: `Update ${type} rate from ${existing.value} to ${value}`
    });

    return res.status(202).json({
      success: true,
      message: 'Rate update request submitted for approval',
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.RATE_CONFIGURATION,
        action: ActionType.UPDATE,
        approver_role: result.approvalRequest?.approver_role,
      }
    });
  } catch (error: any) {
    console.error("Update rate error:", error);
    
    return res.status(500).json({ 
      success: false,
      message: "Failed to update rate",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PATCH /api/rates/:type/deactivate
 * Deactivate a rate through maker-checker
 */
export const deactivateRate = async (req: AuthRequest, res: Response) => {
  const { type } = req.params as { type: RateType };
  const { effective_from, reason } = req.body as { 
    effective_from: string;
    reason?: string;
  };

  const actor = req.user!;

  if (!effective_from) {
    return res.status(400).json({ 
      success: false,
      message: "effective_from is required" 
    });
  }

  const fromDate = new Date(effective_from);
  if (Number.isNaN(fromDate.getTime())) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid effective_from; must be ISO date string" 
    });
  }

  try {
    // Find the rate to deactivate
    const existing = await prisma.rate_configurations.findUnique({
      where: {
        rate_type_effective_from: {
          rate_type: type,
          effective_from: fromDate,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false,
        message: "Rate not found for this type and effective_from" 
      });
    }

    if (!existing.is_active) {
      return res.status(400).json({ 
        success: false,
        message: "Rate is already inactive" 
      });
    }

    // Prepare request data
    const requestData = {
      rate_id: existing.id,
      rate_type: type,
      value: existing.value,
      effective_from: existing.effective_from,
      effective_until: existing.effective_until,
      reason: reason || 'Rate deactivation requested'
    };

    // Create approval request
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.RATE_CONFIGURATION,
      entityId: existing.id,
      actionType: ActionType.DELETE, // Using DELETE action for deactivation
      requestData,
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: null, // Rates are city-level
      comments: reason || `Deactivate ${type} rate effective ${effective_from}`
    });

    return res.status(202).json({
      success: true,
      message: 'Rate deactivation request submitted for approval',
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.RATE_CONFIGURATION,
        action: ActionType.DELETE,
        approver_role: result.approvalRequest?.approver_role,
      }
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