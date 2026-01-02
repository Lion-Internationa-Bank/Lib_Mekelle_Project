// src/routes/leaseRoutes.ts



import { Router } from 'express';
import { createLease ,updateLease, deleteLease} from '../controllers/leaseController.ts';

const router = Router({ mergeParams: true });

router.post('/', createLease);
router.put('/:lease_id', updateLease);
router.delete('/:lease_id', deleteLease);

export default router;





// import { Router } from 'express';
// import { LeaseController } from '../controllers/leaseController.ts';
// import { validateRequest } from '../middlewares/validateRequest.ts';
// import { uploadDocument } from '../middlewares/upload.ts';
// import {
//   createLeaseSchema,
//   updateLeaseSchema,
//   leaseParamsSchema,
//   leaseHistoryParamsSchema,
// } from '../validators/leaseValidator.ts';

// const router = Router({ mergeParams: true });
// // in leaseRoutes.ts, before uploadDocument
// router.post(
//   '/',
//   (req, res, next) => {
//     const upin = req.params.upin;
//     if (!upin) {
//       return res.status(400).json({ message: 'upin is required' });
//     }


 
//     next();
//   },
//   uploadDocument,
//   validateRequest(createLeaseSchema),
//   LeaseController.createLeaseForParcel
// );


// /**
//  * GET /api/v1/parcels/:upin/leases/:lease_id
//  * Get specific lease (with holder and parcel)
//  */
// router.get(
//   '/:lease_id',
//   validateRequest(leaseParamsSchema, ),
//   LeaseController.getLease
// );

// /**
//  * PUT/PATCH /api/v1/parcels/:upin/leases/:lease_id
//  * Update lease agreement fields
//  */
// router.put(
//   '/:lease_id',
//   validateRequest(updateLeaseSchema),
//   LeaseController.updateLease
// );
// router.patch(
//   '/:lease_id',
//   validateRequest(updateLeaseSchema),
//   LeaseController.updateLease
// );

// /**
//  * GET /api/v1/parcels/:upin/leases/:lease_id/history
//  * Get lease holder history for this lease
//  */
// router.get(
//   '/:lease_id/history',
//   validateRequest(leaseHistoryParamsSchema,),
//   LeaseController.getLeaseHistory
// );

// export default router;
