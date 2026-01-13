// src/routes/revenueAdminRoutes.ts
import express from 'express';
import { authenticate} from '../middlewares/authMiddleware.ts';
import { revenueAdminRateAccess , authorize } from '../middlewares/roleMiddleware.ts';
import { updateRate, getCurrentRate } from '../controllers/rateController.ts';

const router = express.Router();

// All endpoints require authentication + Revenue Admin role
router.use(authenticate);
router.use(authorize(['REVENUE_ADMIN']));

// Get current rate (publicly readable, but only Revenue Admin can update)
router.get('/rates/:type', getCurrentRate);

// Update rate (Revenue Admin only, single value enforced)
router.post('/rates/:type', revenueAdminRateAccess, updateRate);

export default router;