// src/routes/authRoutes.ts
import express, { Router } from 'express';
import {
  login,
  createUser,
  // getMe,
  changePassword,
  getUsers,
  suspendUser,
  deleteUser,
} from '../controllers/authController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';
import {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  userIdParamSchema,
  suspendUserSchema,
} from '../validation/authSchema.ts';
import { validateRequest } from '../middlewares/validateRequest.ts';
import { UserRole } from '../generated/prisma/enums.ts';

const router: Router = express.Router();

// Public routes
router.post('/login', validateRequest(loginSchema), login);

// Protected routes
// router.get('/me', authenticate, getMe);
router.patch(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  changePassword
);

// User management
router.post(
  '/users',
  authenticate,
  authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'] as UserRole[]),
  validateRequest(createUserSchema),
  createUser
);

router.get(
  '/users',
  authenticate,
  authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'] as UserRole[]),
  getUsers
);

router.patch(
  '/users/:id/suspend',
  authenticate,
  authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'] as UserRole[]),
  validateRequest(suspendUserSchema),
  suspendUser
);

router.delete(
  '/users/:id',
  authenticate,
  authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'] as UserRole[]),
  validateRequest(userIdParamSchema),
  deleteUser
);

export default router;