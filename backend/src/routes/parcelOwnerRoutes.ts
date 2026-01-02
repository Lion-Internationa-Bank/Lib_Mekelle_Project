// src/routes/parcelOwnerRoutes.ts
// import { Router } from 'express';
// import {  updateParcelOwnerShare } from '../controllers/parcelOwnerController.ts';


// const router = Router({ mergeParams: true });
// router.put('/owners/:upin/:owner_id/share', updateParcelOwnerShare);





// export default router;







// import { validateRequest } from '../middlewares/validateRequest.ts';
// import {
//   listParcelOwnersParamsSchema,
//   createParcelOwnerSchema,
//   getParcelOwnerParamsSchema,
//   updateParcelOwnerSchema,
// } from '../validators/parcelOwnerValidator.ts';



/**
 * GET /api/v1/parcels/:parcel_id/owners
 * List current owners and shares for the parcel
 */
// router.get(
//   '/',
//   validateRequest(listParcelOwnersParamsSchema, ),
//   ParcelOwnerController.listOwnersForParcel
// );

/**
 * POST /api/v1/parcels/:parcel_id/owners
 * Add a new owner to the parcel
 */
// router.post(
//   '/',
//   validateRequest(createParcelOwnerSchema),
//   ParcelOwnerController.addOwnerToParcel
// );

/**
 * GET /api/v1/parcels/:parcel_id/owners/:owner_id
 * Retrieve details of a specific owner linked to this parcel
 */
// router.get(
//   '/:owner_id',
//   validateRequest(getParcelOwnerParamsSchema, ),
//   ParcelOwnerController.getParcelOwnerDetail
// );

/**
 * PUT/PATCH /api/v1/parcels/:parcel_id/owners/:owner_id
 * Update ownership share or dates for this parcel-owner link
 */
// router.put(
//   '/:owner_id',
//   validateRequest(updateParcelOwnerSchema),
//   ParcelOwnerController.updateParcelOwner
// );
// router.patch(
//   '/:owner_id',
//   validateRequest(updateParcelOwnerSchema),
//   ParcelOwnerController.updateParcelOwner
// );

