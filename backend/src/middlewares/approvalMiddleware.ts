// src/middleware/approvalMiddleware.ts
import type { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { UserRole } from '../generated/prisma/enums.js';
import type { AuthRequest } from './authMiddleware.js';

export interface ApprovalConfig {
  entityType: string;
  requireApproval: boolean;
  makerRoles: UserRole[];
  approverRoles: UserRole[];
  sameSubCityOnly?: boolean;
  adminOversight?: boolean; // Whether admins can view/override
}

export const APPROVAL_CONFIGS: Record<string, ApprovalConfig> = {
  // Land Parcels - Sub-city level
  LAND_PARCELS: {
    entityType: 'LAND_PARCELS',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'],
    approverRoles: ['SUBCITY_APPROVER'],
    sameSubCityOnly: true,
    adminOversight: true
  },
  
  // Owners - Sub-city level
  OWNERS: {
    entityType: 'OWNERS',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'],
    approverRoles: ['SUBCITY_APPROVER'],
    sameSubCityOnly: true,
    adminOversight: true
  },
  
  // Lease Agreements - Sub-city level (revenue related)
  LEASE_AGREEMENTS: {
    entityType: 'LEASE_AGREEMENTS',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL'],
    approverRoles: ['SUBCITY_APPROVER'],
    sameSubCityOnly: true,
    adminOversight: true
  },
  
  // Wizard Sessions - Sub-city level
  WIZARD_SESSION: {
    entityType: 'WIZARD_SESSION',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'],
    approverRoles: ['SUBCITY_APPROVER'],
    sameSubCityOnly: true,
    adminOversight: true
  },
  
  // Encumbrances - Sub-city level
  ENCUMBRANCES: {
    entityType: 'ENCUMBRANCES',
    requireApproval: true,
    makerRoles: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'],
    approverRoles: ['SUBCITY_APPROVER'],
    sameSubCityOnly: true,
    adminOversight: true
  },
  
  // Users - Multi-level approval based on role
  USERS: {
    entityType: 'USERS',
    requireApproval: true,
    makerRoles: ['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'],
    approverRoles: ['CITY_APPROVER', 'SUBCITY_APPROVER', 'REVENUE_APPROVER'],
    sameSubCityOnly: false, // Handled by role logic
    adminOversight: true
  },
  
  // Revenue - Revenue level
  REVENUE: {
    entityType: 'REVENUE',
    requireApproval: true,
    makerRoles: ['REVENUE_USER'],
    approverRoles: ['REVENUE_APPROVER'],
    sameSubCityOnly: false,
    adminOversight: true
  },
  
  // Configurations - City level
  CONFIGURATIONS: {
    entityType: 'CONFIGURATIONS',
    requireApproval: true,
    makerRoles: ['CITY_ADMIN'],
    approverRoles: ['CITY_APPROVER'],
    sameSubCityOnly: false,
    adminOversight: true
  },
  
  // Rate Configurations - City level (revenue related)
  RATE_CONFIGURATION: {
    entityType: 'RATE_CONFIGURATION',
    requireApproval: true,
    makerRoles: ['REVENUE_ADMIN'],
    approverRoles: ['REVENUE_APPROVER'],
    sameSubCityOnly: false,
    adminOversight: true
  },
  
  // Sub-cities - City level
  SUBCITY: {
    entityType: 'SUBCITY',
    requireApproval: true,
    makerRoles: ['CITY_ADMIN'],
    approverRoles: ['CITY_APPROVER'],
    sameSubCityOnly: false,
    adminOversight: true
  },
  
  // Approval Requests themselves - Admin oversight only
  APPROVAL_REQUEST: {
    entityType: 'APPROVAL_REQUEST',
    requireApproval: false, // Approval requests don't need approval
    makerRoles: [], // Not created by users directly
    approverRoles: ['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'], // Admins can manage
    sameSubCityOnly: true,
    adminOversight: true
  }
};

// Helper to determine if a user can approve a specific request based on role and context
const canUserApproveRequest = (user: any, request: any, config: ApprovalConfig): boolean => {
  // Check if user role is in approver roles
  if (!config.approverRoles.includes(user.role)) {
    return false;
  }

  // For USERS entity, need to match the approver role with the request's approver_role
  if (request.entity_type === 'USERS') {
    return request.approver_role === user.role;
  }

  // For sub-city level approvals, check sub-city match
  if (config.sameSubCityOnly) {
    return request.sub_city_id === user.sub_city_id;
  }

  return true;
};

// Helper to determine if a user can make a request for a specific entity
const canUserMakeRequest = (user: any, entityType: string, config: ApprovalConfig): boolean => {
  // Check if user role is in maker roles
  if (!config.makerRoles.includes(user.role)) {
    return false;
  }

  // For USERS entity, need specific checks based on what they're creating
  if (entityType === 'USERS') {
    // Approvers cannot create users
    if (['CITY_APPROVER', 'SUBCITY_APPROVER', 'REVENUE_APPROVER'].includes(user.role)) {
      return false;
    }
  }

  // For sub-city level, check they have sub-city
  if (config.sameSubCityOnly && !user.sub_city_id) {
    return false;
  }

  return true;
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
        maker: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
            role: true
          }
        },
        sub_city: {
          select: {
            sub_city_id: true,
            name: true
          }
        }
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
    console.log('Entity type:', approvalRequest.entity_type);
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'No approval configuration found for this entity type'
      });
    }

    // Check if user can approve this request
    if (!canUserApproveRequest(user, approvalRequest, config)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to approve this request'
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

// Middleware to check if user can make requests for a specific entity type
export const canMakeRequest = (entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const config = APPROVAL_CONFIGS[entityType];

      if (!config) {
        return next(); // No config, proceed
      }

      // Check if user is a maker for this entity
      if (!canUserMakeRequest(user, entityType, config)) {
        return res.status(403).json({
          success: false,
          message: `User role ${user.role} cannot create ${entityType} requests`
        });
      }

      // For requests that need sub-city, validate the sub_city_id in body
      if (config.sameSubCityOnly) {
        const { sub_city_id } = req.body;
        
        // If sub_city_id provided, ensure it matches user's sub-city
        if (sub_city_id && sub_city_id !== user.sub_city_id) {
          return res.status(403).json({
            success: false,
            message: 'Cannot create requests for other sub-cities'
          });
        }
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

// Middleware to check if user can view requests (for admins/approvers)
export const canViewRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    
    // Check if user has any approval-related role
    const canView = [
      'CITY_ADMIN',
      'CITY_APPROVER',
      'SUBCITY_ADMIN',
      'SUBCITY_APPROVER',
      'REVENUE_ADMIN',
      'REVENUE_APPROVER'
    ].includes(user.role);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view approval requests'
      });
    }

    next();
  } catch (error) {
    console.error('Can view requests middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate view permissions'
    });
  }
};

// Middleware to check if user can manage (suspend/delete) a user
// export const canManageUser = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const user = req.user!;
//     const { id } = req.params;

//     const targetUser = await prisma.users.findUnique({
//       where: { user_id: id }
//     });

//     if (!targetUser) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Cannot manage yourself
//     if (targetUser.user_id === user.user_id) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot manage your own account'
//       });
//     }

//     // Approvers cannot manage users
//     if (['CITY_APPROVER', 'SUBCITY_APPROVER', 'REVENUE_APPROVER'].includes(user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Approvers cannot manage users'
//       });
//     }

//     // City Admin can manage Sub-city Admin only
//     if (user.role === 'CITY_ADMIN' && targetUser.role !== 'SUBCITY_ADMIN') {
//       return res.status(403).json({
//         success: false,
//         message: 'City Admin can only manage Sub-city Admins'
//       });
//     }

//     // Sub-city Admin can manage users in their sub-city
//     if (user.role === 'SUBCITY_ADMIN') {
//       if (targetUser.sub_city_id !== user.sub_city_id) {
//         return res.status(403).json({
//           success: false,
//           message: 'Can only manage users in your own sub-city'
//         });
//       }
      
//       if (!['SUBCITY_NORMAL', 'SUBCITY_AUDITOR', 'SUBCITY_APPROVER'].includes(targetUser.role)) {
//         return res.status(403).json({
//           success: false,
//           message: 'Sub-city Admin can only manage sub-city users'
//         });
//       }
//     }

//     // Revenue Admin can manage Revenue users only
//     if (user.role === 'REVENUE_ADMIN' && targetUser.role !== 'REVENUE_USER') {
//       return res.status(403).json({
//         success: false,
//         message: 'Revenue Admin can only manage Revenue Users'
//       });
//     }

//     // Store target user in request
//     req.targetUser = targetUser;

//     next();
//   } catch (error) {
//     console.error('Can manage user middleware error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to validate user management permissions'
//     });
//   }
// };

declare global {
  namespace Express {
    interface Request {
      approvalRequest?: any;
      targetUser?: any;
    }
  }
}