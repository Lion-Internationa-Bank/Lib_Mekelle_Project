// src/routes/billRoutes.ts
import express from 'express';
import { BillController } from '../controllers/reportController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';
import { validateRequest } from '../middlewares/validateRequest.ts';
import { DownloadBillsSchema } from '../validation/billSchemas.ts';

const router = express.Router();

router.get('/bill/download',
  // authenticate,
  // authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN', 'REVENUE_USER']),
  validateRequest(DownloadBillsSchema),
  BillController.downloadBills
);

export default router;