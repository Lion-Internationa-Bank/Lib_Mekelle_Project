// src/routes/parcelRoutes.ts
import { Router } from 'express';

import { createParcel,
          getParcels, 
         getParcelByUpin,
         transferOwnership,
         updateParcel, 
         deleteParcel,
         updateParcelOwnerShare,
         createEncumbrance,
         updateEncumbrance,
         getEncumbrancesByParcel, 
         deleteEncumbrance 
} from '../controllers/parcelController.ts';

const router = Router({ mergeParams: true });

router.post('/', createParcel);
router.get('/', getParcels);
router.get('/:upin', getParcelByUpin);
router.post('/:upin/transfer', transferOwnership);
router.put('/:upin', updateParcel);
router.delete('/:upin', deleteParcel);
router.put('/owners/:parcel_owner_id/share', updateParcelOwnerShare);

// EN CUMBRANCES
router.post('/encumbrances', createEncumbrance);
router.put('/encumbrances/:encumbrance_id', updateEncumbrance);
router.delete('/encumbrances/:encumbrance_id', deleteEncumbrance);
router.get('/encumbrances/:upin', getEncumbrancesByParcel);



export default router;





// import { ParcelController } from '../controllers/parcelController.ts';
// import { uploadDocument } from '../middlewares/upload.ts';
// import { validateRequest } from '../middlewares/validateRequest.ts';
// import {
//   createParcelSchema,
//   updateParcelSchema,
//   listParcelsQuerySchema,
// } from '../validators/parcelValidator.ts';
// import parcelOwnerRoutes from './parcelOwnerRoutes.ts';
// import leaseRoutes from './leaseRoutes.ts';
// /**
//  * GET /api/v1/parcels/:upin
//  * Get single parcel by UPIN
//  */
// router.get('/:upin', ParcelController.getParcel);

// /**
//  * GET /api/v1/parcels
//  * List parcels with optional pagination and filtering
//  * Query: page, limit, upin
//  */
// router.get(
//   '/',
//   validateRequest(listParcelsQuerySchema, ),
//   ParcelController.getParcels
// );



// /**
//  * POST /api/v1/parcels
//  * Create new parcel with optional document upload
//  */
// router.post(
//   '/',
//   uploadDocument, // Handle file upload first
//   validateRequest(createParcelSchema),
//   ParcelController.createParcel
// );

// /**
//  * PUT /api/v1/parcels/:upin
//  * Update existing parcel by UPIN (no file upload here)
//  */
// router.put(
//   '/:upin',
//   validateRequest(updateParcelSchema),
//   ParcelController.updateParcel
// );

// // src/routes/parcelRoutes.ts
// router.use('/:upin/owners', parcelOwnerRoutes);

// // src/routes/parcelRoutes.ts


// router.use('/:upin/leases', leaseRoutes);

// export default router;
