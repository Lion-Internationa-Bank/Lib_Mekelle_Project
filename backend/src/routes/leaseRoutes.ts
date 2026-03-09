// src/routes/leaseRoutes.ts

import { Router } from 'express';

import {
  createLease,
  updateLease,
  deleteLease,
} from '../controllers/leaseController.js';

import {
  CreateLeaseSchema,
  UpdateLeaseSchema,
  DeleteLeaseSchema,
} from '../validation/leaseSchemas.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = Router({ mergeParams: true });
router.use(authenticate);

// Create new lease agreement (linked to a parcel via UPIN)
router.post('/', validateRequest(CreateLeaseSchema),authorize(['SUBCITY_NORMAL']),createLease);

// Update existing lease agreement
router.put('/:lease_id', validateRequest(UpdateLeaseSchema),authorize(['SUBCITY_NORMAL']), updateLease);

// Soft delete lease agreement
router.delete('/:lease_id', validateRequest(DeleteLeaseSchema),authorize(['SUBCITY_NORMAL']), deleteLease);

export default router;