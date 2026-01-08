// src/routes/leaseRoutes.ts

import { Router } from 'express';

import {
  createLease,
  updateLease,
  deleteLease,
} from '../controllers/leaseController.ts';

import {
  CreateLeaseSchema,
  UpdateLeaseSchema,
  DeleteLeaseSchema,
} from '../validation/leaseSchemas.ts';

import { validateRequest } from '../middlewares/validateRequest.ts';

const router = Router({ mergeParams: true });

// Create new lease agreement (linked to a parcel via UPIN)
router.post('/', validateRequest(CreateLeaseSchema), createLease);

// Update existing lease agreement
router.put('/:lease_id', validateRequest(UpdateLeaseSchema), updateLease);

// Soft delete lease agreement
router.delete('/:lease_id', validateRequest(DeleteLeaseSchema), deleteLease);

export default router;