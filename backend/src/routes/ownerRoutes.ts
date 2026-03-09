// src/routes/ownerRoutes.ts

import { Router } from 'express';
import { z } from 'zod';

import {
  createOwner,
  onlyCreateOwner,
  updateOwner,
  deleteOwner,
  getOwnersWithParcels,
  searchOwnersLite,
} from '../controllers/ownerController.js';

import {
  CreateOwnerSchema,
  OnlyCreateOwnerSchema,
  UpdateOwnerSchema,
  DeleteOwnerSchema,
  GetOwnersWithParcelsQuerySchema,
  SearchOwnersLiteQuerySchema,
} from '../validation/ownerSchemas.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticate } from '../middlewares/authMiddleware.js';


const router = Router({ mergeParams: true });
router.use(authenticate);

// Create owner + link to parcel
router.post('/', validateRequest(CreateOwnerSchema), createOwner);

// Create owner only (no parcel)
router.post('/only', validateRequest(OnlyCreateOwnerSchema), onlyCreateOwner);

// Update owner
router.put('/:owner_id', validateRequest(UpdateOwnerSchema), updateOwner);

// Soft delete owner
router.delete('/:owner_id', validateRequest(DeleteOwnerSchema), deleteOwner);

// List owners with their parcels (paginated + search)
router.get(
  '/with-parcels',
  validateRequest(z.object({ query: GetOwnersWithParcelsQuerySchema })),
  getOwnersWithParcels
);

// Lightweight search for owner autocomplete/dropdowns
router.get(
  '/search-lite',
  validateRequest(z.object({ query: SearchOwnersLiteQuerySchema })),
  searchOwnersLite
);

export default router;