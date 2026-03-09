// src/routes/index.ts 
import express from 'express';
import type { Request, Response, Router } from 'express';
import parcelRoutes from './parcelRoutes.js';
import ownerRouter from './ownerRoutes.js';
import leaseRouter from './leaseRoutes.js';
import uploadRouter from './uploadRoutes.js';
import authRoutes from './authRoutes.js';
import cityAdminRoutes from './cityAdminRoutes.js';
import revenueAdminRoutes from './revenueAdminRoutes.js';
import makerCheckerRoutes from './makerCheckerRoutes.js'; 
import wizardRoutes from './wizardRoutes.js'; 
import docApproval from './approvalDocuments.js'
import bankRoutes from './bankRoutes.js';
import billRoutes from './reportRoutes.js';
import cronRoutes from './cronRoutes.js'
import parcelReportRoutes from './parcelReportRoutes.js'

const router: Router = express.Router();

router.use('/parcels', parcelRoutes);
router.use('/owners', ownerRouter);
router.use('/leases', leaseRouter);
router.use('/upload', uploadRouter);
router.use('/auth', authRoutes);
router.use('/city-admin', cityAdminRoutes);
router.use('/revenue-admin', revenueAdminRoutes);
router.use('/maker-checker', makerCheckerRoutes); 
router.use('/wizard', wizardRoutes); 
router.use('/doc-approval',docApproval)
router.use('/reports', billRoutes);
router.use('/bank', bankRoutes); 
router.use('/cron', cronRoutes);
router.use('/parcels/reports',parcelReportRoutes)



router.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Land Parcel API v1 - Ready!' });
});

export default router;