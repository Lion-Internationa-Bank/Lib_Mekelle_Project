// src/routes/parcelRoutes.ts

import { Router } from 'express';
import { z } from 'zod';

import {
  createParcel,
  getParcels,
  getParcelByUpin,
  transferOwnership,
  updateParcel,
  deleteParcel,
  updateParcelOwnerShare,
  createEncumbrance,
  updateEncumbrance,
  deleteEncumbrance,
  getEncumbrancesByParcel,
} from '../controllers/parcelController.ts';

import {
  CreateParcelSchema,
  GetParcelsQuerySchema,
  UpdateParcelSchema,
  TransferOwnershipSchema,
  UpdateParcelOwnerShareSchema,
  CreateEncumbranceSchema,
  UpdateEncumbranceSchema,
  DeleteEncumbranceSchema,
  GetEncumbrancesByUpinSchema,
} from '../validation/parcelSchemas.ts';

import { validateRequest } from '../middlewares/validateRequest.ts';

const router = Router({ mergeParams: true });

// === Parcel Routes ===
router.post('/', validateRequest(CreateParcelSchema), createParcel);

router.get('/', validateRequest(z.object({ query: GetParcelsQuerySchema })), getParcels);

router.get(
  '/:upin',
  validateRequest(z.object({ params: z.object({ upin: z.string().min(1) }) })),
  getParcelByUpin
);

router.put('/:upin', validateRequest(UpdateParcelSchema), updateParcel);

router.delete(
  '/:upin',
  validateRequest(z.object({ params: z.object({ upin: z.string().min(1) }) })),
  deleteParcel
);

// === Ownership Routes ===
router.post('/:upin/transfer', validateRequest(TransferOwnershipSchema), transferOwnership);

router.put(
  '/owners/:parcel_owner_id/share',
  validateRequest(UpdateParcelOwnerShareSchema),
  updateParcelOwnerShare
);

// === Encumbrance Routes ===
router.post('/encumbrances', validateRequest(CreateEncumbranceSchema), createEncumbrance);

router.put(
  '/encumbrances/:encumbrance_id',
  validateRequest(UpdateEncumbranceSchema),
  updateEncumbrance
);

router.delete(
  '/encumbrances/:encumbrance_id',
  validateRequest(DeleteEncumbranceSchema),
  deleteEncumbrance
);

router.get(
  '/encumbrances/:upin',
  validateRequest(GetEncumbrancesByUpinSchema),
  getEncumbrancesByParcel
);

export default router;