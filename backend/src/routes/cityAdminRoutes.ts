// src/routes/cityAdminRoutes.ts
import express, { Router } from 'express';
import {
  getConfig,
  createOrUpdateConfig,
  getSubCities,
  createSubCity,
  updateSubCity,
  deleteSubCity,
} from '../controllers/configController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import {
  configListSchema,
  configUpdateSchema,
  createSubCitySchema,
  updateSubCitySchema,
  subCityIdParamSchema,
} from '../validation/configSchema.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { UserRole, ConfigCategory } from '../generated/prisma/enums.js';


const router: Router = express.Router();

// All routes restricted to CITY_ADMIN only
const cityAdminOnly = authorize(['CITY_ADMIN'] as UserRole[]);

// Config routes
// router.get('/configs/:category', authenticate, cityAdminOnly, getConfig);
router.get('/configs/:category', authenticate, getConfig);

router.post(
  '/configs/:category',
  authenticate,
  cityAdminOnly, 
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