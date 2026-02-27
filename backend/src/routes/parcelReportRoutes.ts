import express from 'express';
import { ParcelController } from '../controllers/parcelReportController.ts';
import { authenticate} from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';
import { validateRequest } from '../middlewares/validateRequest.ts';
import {
  GetEncumbrancesSchema,
  GetLandParcelsSchema,
  GetOwnersWithMultipleParcelsSchema,
 GetLeaseAnnualInstallmentRangeSchema
} from '../validation/parcelReportSchemas.ts';

const router = express.Router();

// Get encumbrances with optional date filter
router.get('/encumbrances',
  authenticate,
  authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'SUBCITY_NORMAL']),
  validateRequest(GetEncumbrancesSchema),
  ParcelController.getEncumbrances
);

// Get land parcels with multiple optional filters
router.get('/parcels',
  authenticate,
  authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'SUBCITY_NORMAL', 'SUBCITY_AUDITOR']),
  validateRequest(GetLandParcelsSchema),
  ParcelController.getLandParcels
);

// Get owners with more than one land parcel
router.get('/owners/multiple-parcels',
  authenticate,
  authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'SUBCITY_NORMAL']),
  validateRequest(GetOwnersWithMultipleParcelsSchema),
  ParcelController.getOwnersWithMultipleParcels
);


router.get('/annual_payment',
  authenticate,
  authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'SUBCITY_NORMAL', 'REVENUE_ADMIN', 'REVENUE_USER']),
  validateRequest(GetLeaseAnnualInstallmentRangeSchema),
  ParcelController.getLeaseAnnualInstallmentRange
);

export default router;