// src/routes/cityAdminRoutes.ts
import express, { Router } from 'express';
import {
  getConfig,
  createOrUpdateConfig,
  getSubCities,
  createSubCity,
  updateSubCity,
  deleteSubCity,
} from '../controllers/configController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';
import {
  configListSchema,
  configUpdateSchema,
  createSubCitySchema,
  updateSubCitySchema,
  subCityIdParamSchema,
} from '../validation/configSchema.ts';
import { validateRequest } from '../middlewares/validateRequest.ts';
import { UserRole, ConfigCategory } from '../generated/prisma/enums.ts';
import {roleBasedConfigAccess}  from '../middlewares/roleMiddleware.ts'

const router: Router = express.Router();

// All routes restricted to CITY_ADMIN only
const cityAdminOnly = authorize(['CITY_ADMIN'] as UserRole[]);

// Config routes
// router.get('/configs/:category', authenticate, cityAdminOnly, getConfig);
router.get('/configs/:category', authenticate,  getConfig);

router.post(
  '/configs/:category',
  authenticate,
  (req, res, next) => {
    const category = req.params.category as ConfigCategory;
    if (!Object.values(ConfigCategory).includes(category)) {
      return res.status(400).json({ message: 'Invalid configuration category' });
    }
    next();
  },
  authorize(['CITY_ADMIN', 'REVENUE_ADMIN']), // Only these two roles allowed
  roleBasedConfigAccess, // ← NEW middleware for category-role enforcement
  validateRequest(configListSchema),
  createOrUpdateConfig
);
// Sub-city routes
// router.get('/sub-cities', authenticate, cityAdminOnly, getSubCities);
router.get('/sub-cities', authenticate,  getSubCities);

router.post('/sub-cities', authenticate, cityAdminOnly, validateRequest(createSubCitySchema), createSubCity);

router.patch(
  '/sub-cities/:id',
  authenticate,
  cityAdminOnly,
  validateRequest(updateSubCitySchema),
  updateSubCity
);

router.delete(
  '/sub-cities/:id',
  authenticate,
  cityAdminOnly,
  validateRequest(subCityIdParamSchema),
  deleteSubCity
);

export default router;