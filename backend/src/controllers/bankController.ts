// src/controllers/bankController.ts
import type { Request, Response } from 'express';
import { BankCallbackService } from '../services/bankCallbackService.ts';
import prisma from '../config/prisma.ts';
import type { AuthRequest } from '../middlewares/authMiddleware.ts';

export class BankCallbackController {
  /**
   * Handle bank transaction callback webhook
   */
  static async handleTransactionCallback(req: Request, res: Response) {
    try {
      const callbackData = req.body;
      
      // Log incoming callback for audit
      console.log('Bank callback received:', {
        transactionId: callbackData.transactionId,
        upin: callbackData.upin,
        number: callbackData.number,
        timestamp: new Date().toISOString()
      });

      const bankService = new BankCallbackService();
      const result = await bankService.processBankCallback(callbackData);

      return res.status(200).json({
        success: true,
        message: 'Bank callback processed successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Bank callback error:', error);
      
      // Determine appropriate error message
      let errorMessage = error.message || 'Failed to process bank callback';
      
      // Handle specific error cases
      if (errorMessage.includes('Payment amount mismatch')) {
        errorMessage = 'Partial payments are not allowed. The payment amount must exactly match the total of the selected bills.';
      } else if (errorMessage.includes('already processed')) {
        errorMessage = 'This transaction has already been processed.';
      } else if (errorMessage.includes('No parcel found')) {
        errorMessage = 'Invalid UPIN. No parcel found.';
      } else if (errorMessage.includes('No unpaid bills')) {
        errorMessage = 'No unpaid bills found for this UPIN.';
      } else if (errorMessage.includes('No bills to update')) {
        errorMessage = 'No bills match the selected payment option.';
      }
      
      // Always return 200 to bank to acknowledge receipt
      return res.status(200).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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