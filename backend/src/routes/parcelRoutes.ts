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
  createEncumbrance,
  updateEncumbrance,
  deleteEncumbrance,
  getEncumbrancesByParcel,
  addParcelOwner,
  subdivideParcel
} from '../controllers/parcelController.ts';

import {
  CreateParcelSchema,
  GetParcelsQuerySchema,
  UpdateParcelSchema,
  TransferOwnershipSchema,

  CreateEncumbranceSchema,
  UpdateEncumbranceSchema,
  DeleteEncumbranceSchema,
  GetEncumbrancesByUpinSchema,
} from '../validation/parcelSchemas.ts';

import { validateRequest } from '../middlewares/validateRequest.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';

const router = Router({ mergeParams: true });

// === Parcel Routes ===
router.post('/', validateRequest(CreateParcelSchema),authenticate,authorize(['SUBCITY_NORMAL']), createParcel);

// router.get('/', validateRequest(z.object({ query: GetParcelsQuerySchema })), authenticate, getParcels);

router.get('/',authenticate,authorize(['SUBCITY_NORMAL','SUBCITY_AUDITOR','REVENUE_USER']), getParcels);
router.get(
  '/:upin',
  validateRequest(z.object({ params: z.object({ upin: z.string().min(1) }) })),authenticate,authorize(['SUBCITY_NORMAL','SUBCITY_AUDITOR','REVENUE_USER']),
  getParcelByUpin
);

router.put('/:upin', validateRequest(UpdateParcelSchema),authenticate,authorize(['SUBCITY_NORMAL']), updateParcel);

router.delete(
  '/:upin',
  validateRequest(z.object({ params: z.object({ upin: z.string().min(1) }) })),authenticate,authorize(['SUBCITY_NORMAL']),
  deleteParcel
);

// === Ownership Routes ===
router.post('/:upin/transfer', validateRequest(TransferOwnershipSchema),authenticate,authorize(['SUBCITY_NORMAL']), transferOwnership);

router.post('/:upin/owners',authenticate, authorize(['SUBCITY_NORMAL']),addParcelOwner);

router.post('/:upin/subdivide',authenticate, authorize(['SUBCITY_NORMAL']), subdivideParcel); 

// === Encumbrance Routes ===
router.post('/encumbrances', validateRequest(CreateEncumbranceSchema),authenticate, authorize(['SUBCITY_NORMAL']),createEncumbrance);

router.put(
  '/encumbrances/:encumbrance_id',
  validateRequest(UpdateEncumbranceSchema),authenticate,authorize(['SUBCITY_NORMAL']),
  updateEncumbrance
);

router.delete(
  '/encumbrances/:encumbrance_id',
  validateRequest(DeleteEncumbranceSchema),authenticate,authorize(['SUBCITY_NORMAL']),
  deleteEncumbrance
);

router.get(
  '/encumbrances/:upin',
  validateRequest(GetEncumbrancesByUpinSchema),authenticate,
  getEncumbrancesByParcel
);

export default router;