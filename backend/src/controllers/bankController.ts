// src/controllers/bankController.ts
import type { Request, Response } from 'express';
import { BankCallbackService } from '../services/bankCallbackService.js';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class BankCallbackController {
  /**
   * Handle bank transaction callback webhook
   */
static async handleTransactionCallback(req: AuthRequest, res: Response) {
  try {
    // Client info from token middleware
    const callbackData = req.body;
    
    // 1. Verify signature only
    const signature = req.headers['x-signature'] as string;
    
    if (!signature) {
      console.warn('Missing signature header:', {
        ip: req.ip
      });
      
      return res.status(200).json({
        success: false,
        message: 'Missing x-signature header'
      });
    }

    // 2. Reconstruct the string that was signed
    // Simple format: JSON.stringify(body)
    const bodyString = JSON.stringify(callbackData);
    
    // 3. Compute expected signature using client secret
    // The client secret is shared between you and the API user
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET as string)
      .update(bodyString)
      .digest('hex');

    // 4. Constant-time comparison
    const providedSignature = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    
    const isValidSignature = providedSignature.length === expectedSignatureBuffer.length && 
                             crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer);

    if (!isValidSignature) {
      console.warn('Invalid signature:', {
        transactionId: callbackData.transactionId,
        ip: req.ip
      });
      
      return res.status(200).json({
        success: false,
        message: 'Invalid request signature'
      });
    }

    // Log with client context
    console.log('Bank callback received:', {
      transactionId: callbackData.transactionId,
      upin: callbackData.upin,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!callbackData.transactionId || !callbackData.upin) {
      return res.status(200).json({
        success: false,
        message: 'Missing required fields: transactionId and upin are required'
      });
    }

    const bankService = new BankCallbackService();
    const result = await bankService.processBankCallback(callbackData);

    return res.status(200).json({
      success: true,
      message: 'Bank callback processed successfully',
      data: result
    });
    
  } catch (error: any) {
    console.error('Bank callback error:', {
      error: error.message,
      transactionId: req.body?.transactionId
    });
    
    // Error message mapping
    const errorMessages: Record<string, string> = {
      'Payment amount mismatch': 'Partial payments are not allowed. The payment amount must exactly match the total of the selected bills.',
      'already processed': 'This transaction has already been processed.',
      'No parcel found': 'Invalid UPIN. No parcel found.',
      'No unpaid bills': 'No unpaid bills found for this UPIN.',
      'No bills to update': 'No bills match the selected payment option.'
    };

    let errorMessage = error.message || 'Failed to process bank callback';
    for (const [key, msg] of Object.entries(errorMessages)) {
      if (errorMessage.includes(key)) {
        errorMessage = msg;
        break;
      }
    }
    
    return res.status(200).json({
      success: false,
      message: errorMessage
    });
  }
}

static async generateToken(req: Request, res: Response): Promise<void> {
  try {
    // Security headers
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    // Validate environment configuration
    if (!process.env.BANK_JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
      console.error('API credentials not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const { client_id, client_secret } = req.body;

    // Input validation
    if (!client_id || !client_secret) {
      res.status(400).json({ error: 'Missing credentials' });
      return;
    }

    if (typeof client_id !== 'string' || typeof client_secret !== 'string') {
      res.status(400).json({ error: 'Invalid credential format' });
      return;
    }

    // Length limits to prevent DoS
    if (client_id.length > 255 || client_secret.length > 255) {
      res.status(400).json({ error: 'Credential too long' });
      return;
    }

    // Constant-time comparison   
    const expectedId = Buffer.from(process.env.CLIENT_ID);
    const providedId = Buffer.from(client_id);
    const expectedSecret = Buffer.from(process.env.CLIENT_SECRET);
    const providedSecret = Buffer.from(client_secret);

    // Add length validation before timingSafeEqual
    if (expectedId.length !== providedId.length || 
        expectedSecret.length !== providedSecret.length) {
      // Small delay to prevent timing attacks from revealing length mismatch
      console.log("expectedId.length !== providedId.length ",expectedId.length !== providedId.length )
      console.log(" expectedSecret.length !== providedSecret.length", expectedSecret.length !== providedSecret.length)
      await new Promise(resolve => setTimeout(resolve, 100));
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isIdValid = crypto.timingSafeEqual(expectedId, providedId);
    const isSecretValid = crypto.timingSafeEqual(expectedSecret, providedSecret);

    if (!isIdValid || !isSecretValid) {
      // Add consistent delay for all failures
      await new Promise(resolve => setTimeout(resolve, 100));
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token with best practices
    const token = jwt.sign(
      { 
      },
      process.env.BANK_JWT_SECRET,
      { 
        expiresIn:'5m',
        algorithm: 'HS256',
        audience: 'webhook-api',
      }
    );

    // Return token with matching expiration time
    res.status(200).json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 900 // 15 minutes in seconds
    });

  } catch (error) {
    const errorId = crypto.randomBytes(8).toString('hex');
    console.error(`Auth Error [${errorId}]:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      error_id: errorId
    });
  }
}
  /**
   * Get payment options showing prioritized bills
   */
  //   static async getPaymentOptions(req: AuthRequest, res: Response) {
//     try {
//       const { upin } = req.params;
      
//       const bankService = new BankCallbackService();
//       const options = await bankService.getPaymentOptions(upin);

//       return res.status(200).json({
//         success: true,
//         data: options
//       });
//     } catch (error: any) {
//       console.error('Get payment options error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to fetch payment options'
//       });
//     }
  //   }

  /**
   * Get unpaid bills for a UPIN (simplified version)
   */
  static async getUnpaidBills(req: AuthRequest, res: Response) {
    try {
      const { upin } = req.params;
      
      const bills = await prisma.billing_records.findMany({
        where: {
          upin,
          payment_status: 'UNPAID',
          is_deleted: false
        },
        orderBy: {
          fiscal_year: 'asc'
        },
        select: {
          bill_id: true,
          fiscal_year: true,
          amount_due: true,
          penalty_amount: true,
          interest_amount: true,
          due_date: true,
          bill_type: true,
        }
      });

      const currentYear = new Date().getFullYear();
      
      const billsWithStatus = bills.map(bill => ({
        ...bill,
        amount_due: Number(bill.amount_due),
        penalty_amount: Number(bill.penalty_amount || 0),
        interest_amount: Number(bill.interest_amount || 0),
        status: bill.fiscal_year < currentYear ? 'OVERDUE' : 
                bill.fiscal_year === currentYear ? 'CURRENT' : 'FUTURE'
      }));

      return res.status(200).json({
        success: true,
        data: {
          upin,
          total_unpaid_bills: billsWithStatus.length,
          total_amount_due: billsWithStatus.reduce((sum, b) => sum + b.amount_due, 0),
          bills: billsWithStatus
        }
      });
    } catch (error: any) {
      console.error('Get unpaid bills error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch unpaid bills'
      });
    }
  }

  /**
   * Get all transactions for a specific UPIN
   */
  static async getTransactionsByUpin(req: AuthRequest, res: Response) {
    try {
      const { upin } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [transactions, total] = await Promise.all([
        prisma.financial_transactions.findMany({
          where: { upin, },
          orderBy: { payment_date: 'desc' },
          skip,
          take: Number(limit),
          include: {
            parcel: {
              select: {
                upin: true,
                file_number: true,
                sub_city: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }),
        prisma.financial_transactions.count({
          where: { upin, }
        })
      ]);

      return res.status(200).json({
        success: true,
        data: transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Get transactions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions'
      });
    }
  }

  /**
   * Get single transaction by ID
   */
  static async getTransactionById(req: AuthRequest, res: Response) {
    try {
      const { transactionId } = req.params;
      
      const transaction = await prisma.financial_transactions.findUnique({
        where: { transaction_id: transactionId },
        include: {
          parcel: {
            select: {
              upin: true,
              file_number: true,
              sub_city: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error: any) {
      console.error('Get transaction error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction'
      });
    }
  }
}