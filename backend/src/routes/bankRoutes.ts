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


const router = express.Router();

// Public webhook endpoint (no authentication - bank calls this)
router.post('/callback/transaction',
  validateRequest(BankCallbackSchema),
  BankCallbackController.handleTransactionCallback
);

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