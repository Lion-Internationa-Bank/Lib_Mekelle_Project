// src/routes/bankRoutes.ts
import express from 'express';
import { BankCallbackController } from '../controllers/bankController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  BankCallbackSchema,
  GetUnpaidBillsSchema,
  GetTransactionsByUpinSchema,
  GetTransactionByIdSchema
} from '../validation/bankSchemas.js';
import rateLimit from 'express-rate-limit';
import { verifyToken } from '@/middlewares/bankauthmiddleware.ts';

const TokenAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 5 attempts per window
  message: { error: "Too many authentication attempts" }
});

const router = express.Router();

// Public webhook endpoint (no authentication - bank calls this)
router.post('/callback/transaction',
  validateRequest(BankCallbackSchema),verifyToken,
  BankCallbackController.handleTransactionCallback
);

router.get('/outh/token',TokenAuthLimiter,
  BankCallbackController.generateToken
)

// Protected endpoints for querying
router.get('/unpaid-bills/:upin',
  authenticate,
  validateRequest(GetUnpaidBillsSchema),
  BankCallbackController.getUnpaidBills
);

router.get('/transactions/:upin',
  authenticate,
  validateRequest(GetTransactionsByUpinSchema),
  BankCallbackController.getTransactionsByUpin
);

router.get('/transaction/:transactionId',
  authenticate,
  validateRequest(GetTransactionByIdSchema),
  BankCallbackController.getTransactionById
);

export default router;