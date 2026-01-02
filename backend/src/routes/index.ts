// 1. Import the express function as the default export
import express from 'express';

import type { Request, Response, Router } from 'express';
import parcelRoutes from './parcelRoutes.ts';
import ownerRouter from './ownerRoutes.ts';
import leaseRouter from './leaseRoutes.ts';
import uploadRouter from './uploadRoutes.ts';

const router: Router = express.Router();

router.use('/parcels', parcelRoutes);
router.use('/owners', ownerRouter);
router.use('/leases', leaseRouter);
router.use('/upload', uploadRouter);
router.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Land Parcel API v1 - Ready!' });
});

export default router;





