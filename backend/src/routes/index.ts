// src/routes/index.ts 
import express from 'express';
import type { Request, Response, Router } from 'express';
import parcelRoutes from './parcelRoutes.ts';
import ownerRouter from './ownerRoutes.ts';
import leaseRouter from './leaseRoutes.ts';
import uploadRouter from './uploadRoutes.ts';
import authRoutes from './authRoutes.ts';
import cityAdminRoutes from './cityAdminRoutes.ts';
import revenueAdminRoutes from './revenueAdminRoutes.ts';
import makerCheckerRoutes from './makerCheckerRoutes.ts'; 
import wizardRoutes from './wizardRoutes.ts'; 
import docApproval from './approvalDocuments.ts'
import bankRoutes from './bankRoutes.ts';
import billRoutes from './reportRoutes.ts';
import cronRoutes from './cronRoutes.ts'

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



router.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Land Parcel API v1 - Ready!' });
});

export default router;