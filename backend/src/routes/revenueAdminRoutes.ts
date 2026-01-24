// src/routes/revenueAdminRoutes.ts
import express from "express";
import { authenticate } from "../middlewares/authMiddleware.ts";
import {
  // revenueAdminRateAccess,
  authorize,
} from "../middlewares/roleMiddleware.ts";
import {
  getCurrentRate,
  getRateHistoryByType,
  createRate,
  updateRate,
  deactivateRate,
} from "../controllers/rateController.ts";

const router = express.Router();

// All endpoints require authentication + Revenue Admin role
router.use(authenticate);

// Get current rate for a type 
router.get("/rates/:type/current", getCurrentRate);

// Get rate history for a type (optionally ?limit=10)
router.get("/rates/:type/history", getRateHistoryByType);

// Create NEW rate for a type (insert only)
router.post("/rates/:type", authorize(['REVENUE_ADMIN']), createRate);

// Update existing ACTIVE rate for a type (requires effective_from in body)
router.put("/rates/:type", authorize(['REVENUE_ADMIN']) , updateRate);

// Deactivate a specific rate row for a type (requires effective_from in body)
router.patch("/rates/:type/deactivate",authenticate,  authorize(['REVENUE_ADMIN']), deactivateRate);

export default router;
