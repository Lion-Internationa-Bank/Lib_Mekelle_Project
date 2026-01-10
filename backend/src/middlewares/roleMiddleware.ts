// src/middleware/roleMiddleware.ts
import { type Response, type NextFunction } from 'express';
import {type AuthRequest } from './authMiddleware.ts';
import { UserRole } from '../generated/prisma/enums.ts';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};