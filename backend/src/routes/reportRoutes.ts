// src/routes/billRoutes.ts
import express from 'express';
import { BillController } from '../controllers/reportController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { DownloadBillsSchema } from '../validation/billSchemas.js';

const router = express.Router();

router.get('/bill/download',
  // authenticate,
  // authorize(['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN', 'REVENUE_USER']),
  validateRequest(DownloadBillsSchema),
  BillController.downloadBills
);

export default router;