import { UserRole } from "../generated/prisma/enums.ts";
// Helper to find the approver role for a request (returns role, not ID)
export const findApproverRoleForRequest = (
  adminRole: UserRole,
  targetRole?: UserRole,
  subCityId?: string | null
): UserRole | null => {
  // For City Admin creating/ managing users
  if (adminRole === UserRole.CITY_ADMIN) {
    return UserRole.CITY_APPROVER;
  }
  
  // For Sub-city Admin creating/ managing users in their sub-city
  if (adminRole === UserRole.SUBCITY_ADMIN) {
    return UserRole.SUBCITY_APPROVER;
  }
  
  // For Revenue Admin creating/ managing revenue users
  if (adminRole === UserRole.REVENUE_ADMIN) {
    return UserRole.REVENUE_APPROVER;
  }

  return null;
};



