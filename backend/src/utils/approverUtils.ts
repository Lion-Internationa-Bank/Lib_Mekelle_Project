// src/utils/approverUtils.ts
import { EntityType, UserRole } from '../generated/prisma/enums.js';

/**
 * Get the approver role for a given entity type
 * @param entityType The entity type to get the approver for
 * @returns The UserRole that should approve this entity type
 */
export const getApproverRoleForEntity =(entityType: EntityType): UserRole =>{
  switch (entityType) {
    // Sub-city approver entities
    case EntityType.WIZARD_SESSION:
    case EntityType.LAND_PARCELS:
    case EntityType.OWNERS:
    case EntityType.LEASE_AGREEMENTS:
    case EntityType.ENCUMBRANCES:
      return UserRole.SUBCITY_APPROVER;

    // City approver entities
    case EntityType.CONFIGURATIONS:
    case EntityType.SUBCITY:
      return UserRole.CITY_APPROVER;

    // Revenue approver entities
    case EntityType.RATE_CONFIGURATION:
      return UserRole.REVENUE_APPROVER;

    // Default case - throw error for unmapped entity types
    default:
      throw new Error(`No approver role configured for entity type: ${entityType}`);
  }
}

/**
 * Check if a user role is the correct approver for an entity type
 * @param userRole The role of the user
 * @param entityType The entity type to check
 * @returns boolean indicating if the user is the correct approver
 */
export const  isCorrectApproverForEntity = (
  userRole: UserRole,
  entityType: EntityType
): boolean=> {
  try {
    const requiredRole = getApproverRoleForEntity(entityType);
    return userRole === requiredRole;
  } catch (error) {
    return false;
  }
}

/**
 * Get all entity types that a given approver role can approve
 * @param approverRole The approver role
 * @returns Array of EntityTypes that this role can approve
 */
export const getEntitiesForApproverRole = (approverRole: UserRole): EntityType[]  =>{
  switch (approverRole) {
    case UserRole.SUBCITY_APPROVER:
      return [
        EntityType.WIZARD_SESSION,
        EntityType.LAND_PARCELS,
        EntityType.OWNERS,
        EntityType.LEASE_AGREEMENTS,
        EntityType.ENCUMBRANCES
      ];

    case UserRole.CITY_APPROVER:
      return [
        EntityType.CONFIGURATIONS,
        EntityType.SUBCITY
      ];

    case UserRole.REVENUE_APPROVER:
      return [
        EntityType.RATE_CONFIGURATION
      ];

    default:
      return [];
  }
}

const isApproverRole = (role: UserRole): boolean => {
  const approverRoles: UserRole[] = [
    UserRole.CITY_APPROVER,
    UserRole.SUBCITY_APPROVER,
    UserRole.REVENUE_APPROVER
  ];
  return approverRoles.includes(role);
};
// Helper to check if role is an admin
const isAdminRole = (role: UserRole): boolean => {
  const adminRoles: UserRole[] = [
    UserRole.CITY_ADMIN,
    UserRole.SUBCITY_ADMIN,
    UserRole.REVENUE_ADMIN
  ];
  return adminRoles.includes(role);
};