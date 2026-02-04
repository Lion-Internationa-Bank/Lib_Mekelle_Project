// src/utils/approvalHelpers.ts
import { UserRole } from '../generated/prisma/enums.ts';

export interface ApprovalRules {
  requiresApproval: boolean;
  approverRole: UserRole;
  sameSubCity: boolean;
}

export function getApprovalRules(
  userRole: UserRole,
  entityType: string,
  actionType: string
): ApprovalRules {
  const rules: Record<string, ApprovalRules> = {
    'SUBCITY_NORMAL:LAND_PARCEL:CREATE': {
      requiresApproval: true,
      approverRole: 'SUBCITY_ADMIN',
      sameSubCity: true
    },
    'SUBCITY_NORMAL:LAND_PARCEL:UPDATE': {
      requiresApproval: true,
      approverRole: 'SUBCITY_ADMIN',
      sameSubCity: true
    },
    'SUBCITY_NORMAL:LAND_PARCEL:DELETE': {
      requiresApproval: true,
      approverRole: 'CITY_ADMIN',
      sameSubCity: false
    },
    'SUBCITY_ADMIN:LAND_PARCEL:CREATE': {
      requiresApproval: false,
      approverRole: 'SUBCITY_ADMIN',
      sameSubCity: true
    },
    'REVENUE_USER:REVENUE:CREATE': {
      requiresApproval: true,
      approverRole: 'REVENUE_ADMIN',
      sameSubCity: false
    },
    // Add more rules as needed
  };

  const key = `${userRole}:${entityType}:${actionType}`;
  return rules[key] || {
    requiresApproval: true,
    approverRole: 'SUBCITY_ADMIN',
    sameSubCity: true
  };
}

export function formatApprovalMessage(
  entityType: string,
  actionType: string,
  entityId: string
): string {
  const actions: Record<string, string> = {
    'CREATE': 'creation of',
    'UPDATE': 'update to',
    'DELETE': 'deletion of'
  };

  const entities: Record<string, string> = {
    'LAND_PARCEL': 'land parcel',
    'OWNER': 'owner',
    'LEASE': 'lease agreement',
    'WIZARD_SESSION': 'complete parcel registration'
  };

  return `${actions[actionType] || actionType} ${entities[entityType] || entityType} ${entityId}`;
}