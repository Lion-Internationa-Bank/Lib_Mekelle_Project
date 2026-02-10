// src/middleware/approvalMiddleware.ts
import type { Response, NextFunction } from 'express';
import prisma from '../config/prisma.ts';
import { UserRole } from '../generated/prisma/enums.ts';
import type { AuthRequest } from './authMiddleware.ts';

export interface ApprovalConfig {
  entityType: string;
  requireApproval: boolean;
  makerRoles: UserRole[];
  approverRoles: UserRole[];
  sameSubCityOnly?: boolean;
}

export const APPROVAL_CONFIGS: Record<string, ApprovalConfig> = {
  LAND_PARCELS: {
    entityType: 'LAND_PARCEL',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'],
    approverRoles: ['SUBCITY_ADMIN'],
    sameSubCityOnly: true
  },
  OWNERS: {
    entityType: 'OWNERS',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'],
    approverRoles: ['SUBCITY_ADMIN'],
    sameSubCityOnly: true
  },
  LEASE_AGREEMENTS: {
    entityType: 'LEASE',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL'],
    approverRoles: ['SUBCITY_ADMIN'],
    sameSubCityOnly: true
  },
  WIZARD_SESSION: {
    entityType: 'WIZARD_SESSION',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'],
    approverRoles: ['SUBCITY_ADMIN'],
    sameSubCityOnly: true
  },
  REVENUES: {
    entityType: 'REVENUE',
    requireApproval: true,
    makerRoles: ['REVENUE_USER'],
    approverRoles: ['REVENUE_ADMIN'],
    sameSubCityOnly: false
  },
    ENCUMBRANCES: {
    entityType: 'LAND_PARCEL',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'],
    approverRoles: ['SUBCITY_ADMIN'],
    sameSubCityOnly: true
  },
};

// Middleware to check if user can approve a specific request
export const canApproveRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    const { request_id } = req.params;

    // Get the approval request
    const approvalRequest = await prisma.approval_requests.findUnique({
      where: { request_id },
      include: {
        maker: true,
        sub_city: true
      }
    });

    if (!approvalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    // Check if request is pending
    if (approvalRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${approvalRequest.status.toLowerCase()}`
      });
    }

    // Get config for this entity type
    const config = APPROVAL_CONFIGS[approvalRequest.entity_type];
    console.log(approvalRequest.entity_type)
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'No approval configuration found for this entity type'
      });
    }

    // Check if user has approver role
    if (!config.approverRoles.includes(user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to approve requests'
      });
    }

    // For subcity-level approvals, check same subcity
    if (config.sameSubCityOnly && approvalRequest.sub_city_id !== user.sub_city_id) {
      return res.status(403).json({
        success: false,
        message: 'Can only approve requests from your sub-city'
      });
    }

    // Store approval request in request object for controller
    req.approvalRequest = approvalRequest;

    next();
  } catch (error) {
    console.error('Can approve middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate approval permissions'
    });
  }
};

// Middleware to check if user can make requests
export const canMakeRequest = (entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const config = APPROVAL_CONFIGS[entityType];

      if (!config) {
        return next(); // No config, proceed
      }

      // Check if user is a maker for this entity
      if (!config.makerRoles.includes(user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message: `User role ${user.role} cannot create ${entityType} requests`
        });
      }

      // For same subcity checks
      if (config.sameSubCityOnly && !user.sub_city_id) {
        return res.status(400).json({
          success: false,
          message: 'Sub-city assignment required for this action'
        });
      }

      next();
    } catch (error) {
      console.error('Can make middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate maker permissions'
      });
    }
  };
};

declare global {
  namespace Express {
    interface Request {
      approvalRequest?: any;
    }
  }
}