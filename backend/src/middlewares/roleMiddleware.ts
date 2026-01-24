// src/middleware/roleMiddleware.ts
import { type Response, type NextFunction } from 'express';
import {type AuthRequest } from './authMiddleware.ts';
import { UserRole, ConfigCategory } from '../generated/prisma/enums.ts';

export const authorize = (allowedRoles: UserRole[]) => {

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        console.log("allowed role ",allowedRoles)
        console.log("user",req.user)
        console.log("user role",req.user?.role)
      return res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};












const CITY_ADMIN_ALLOWED = [
  ConfigCategory.LAND_TENURE,
  ConfigCategory.TRANSFER_TYPE,
  ConfigCategory.LAND_USE,
  ConfigCategory.ENCUMBRANCE_TYPE,
] as const;

// const REVENUE_ADMIN_ALLOWED = [
//   ConfigCategory.REVENUE_RATES,
//   ConfigCategory.PAYMENT_METHOD,
//   ConfigCategory.REVENUE_TYPE,
// ] as const;

export const roleBasedConfigAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user!;
  const category = req.params.category as ConfigCategory;

  if (user.role === UserRole.CITY_ADMIN) {
    if (!CITY_ADMIN_ALLOWED.includes(category)) {
      return res.status(403).json({
        message: `City Admin can only update: ${CITY_ADMIN_ALLOWED.join(', ')}`,
      });
    }
  // } else if (user.role === UserRole.REVENUE_ADMIN) {
  //   if (!REVENUE_ADMIN_ALLOWED.includes(category)) {
  //     return res.status(403).json({
  //       message: `Revenue Admin can only update: ${REVENUE_ADMIN_ALLOWED.join(', ')}`,
  //     });
  //   }
  }
   else {
    return res.status(403).json({
      message: 'You are not authorized to update configurations',
    });
  }

  next();
};



// const ALLOWED_RATE_TYPES = ['LEASE_INTEREST_RATE', 'PENALTY_RATE'] as const;

// export const revenueAdminRateAccess = (
//   req:  AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const rateType = req.params.type as string;

//   if (!ALLOWED_RATE_TYPES.includes(rateType as any)) {
//     return res.status(400).json({
//       message: `Invalid rate type. Allowed: ${ALLOWED_RATE_TYPES.join(', ')}`
//     });
//   }

//   next();
// };