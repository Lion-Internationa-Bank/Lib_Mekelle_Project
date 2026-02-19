// src/services/bankCallbackService.ts
import prisma from '../config/prisma.ts';
import { PaymentStatus } from '../generated/prisma/enums.ts';

export interface BankCallbackDto {
  transactionId: string;
  upin: string;
  number: number;
  amountPaid?: number;
  paymentDate?: string;
  bankBranch?: string;
  bankAccount?: string;
  notes?: string;
}

// transactionId
// upin
// number
// amountPaid
// paymentDate


export interface ProcessedBill {
  bill_id: string;
  fiscal_year: number;
  amount_due: number;
  amount_paid: number;
  remaining_amount: number;
  status: PaymentStatus;
  bill_type: 'OVERDUE' | 'CURRENT' | 'FUTURE';
}

export interface BankCallbackResult {
  success: boolean;
  transaction_id: string;
  bills_updated: ProcessedBill[];
  total_amount_paid: number;
  message: string;
  summary: {
    overdue_paid: number;
    current_paid: number;
    future_bills_paid: number;

  };
}

export class BankCallbackService {
  private prisma: typeof prisma;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Process bank callback and update bills
   * Business Logic:
   * - Overdue bills: Fully paid (amount_due) - marked as PAID, remaining_amount = 0
   * - Current year bill: Fully paid (amount_due) - marked as PAID, remaining_amount = 0
   * - Future bills: 
   *   - Selected from the END (most recent/farthest years) - marked as PAID, remaining_amount = 0
   *   - ALL remaining unpaid future bills have their remaining_amount reduced by:
   *     (number of future bills paid in this transaction) * base_payment
   */
  async processBankCallback(callbackData: BankCallbackDto): Promise<BankCallbackResult> {
    const { transactionId, upin, number,  amountPaid, paymentDate } = callbackData;

    // Start a transaction to ensure data consistency
    return await this.prisma.$transaction(async (tx) => {
      // 1. Check if transaction already exists
      const existingTransaction = await tx.financial_transactions.findFirst({
        where: { bank_transaction_id: transactionId }
      });

      if (existingTransaction) {
        throw new Error(`Transaction ${transactionId} already processed`);
      }

      // 2. Verify UPIN exists
      const parcel = await tx.land_parcels.findUnique({
        where: { upin }
      });

      if (!parcel) {
        throw new Error(`No parcel found for UPIN: ${upin}`);
      }

      // 3. Get lease agreement for base payment amount
      const leaseAgreement = await tx.lease_agreements.findUnique({
        where: { upin }
      });

      if (!leaseAgreement) {
        throw new Error(`No lease agreement found for UPIN: ${upin}`);
      }

      const basePaymentAmount = Number(leaseAgreement.annual_installment || 0);

      // 4. Get all unpaid bills for this UPIN
      const unpaidBills = await tx.billing_records.findMany({
        where: {
          upin,
          payment_status: { in: [PaymentStatus.UNPAID, PaymentStatus.OVERDUE] },
          is_deleted: false
        },
        orderBy: {
          fiscal_year: 'asc' // Oldest first
        }
      });

      if (unpaidBills.length === 0) {
        throw new Error(`No unpaid bills found for UPIN: ${upin}`);
      }

      // 5. Determine which bills to mark as PAID based on priority
      const { 
        billsToMarkAsPaid,      // Bills that will be fully paid (status = PAID, remaining = 0)
        futureBillsPaid,        // The future bills that are being marked as PAID
        allFutureBills          // ALL future bills (for adjusting remaining amounts)
      } = this.determineBillsToMarkAsPaid(unpaidBills, number);

      if (billsToMarkAsPaid.length === 0) {
        throw new Error(`No bills to update for number: ${number}`);
      }

      // 6. Calculate total amount to be paid
      const currentYear = new Date().getFullYear();
      let totalAmountToPay = 0;
      let overduePaid = 0;
      let currentPaid = 0;
      
      // Separate bills by type for counting
      const overdueBillsPaid = billsToMarkAsPaid.filter(b => b.fiscal_year < currentYear);
      const currentBillPaid = billsToMarkAsPaid.find(b => b.fiscal_year === currentYear);
      const futureBillsPaidList = billsToMarkAsPaid.filter(b => b.fiscal_year > currentYear);

      // Calculate total amount
      for (const bill of billsToMarkAsPaid) {
        totalAmountToPay += Number(bill.amount_due);
      }

      overduePaid = overdueBillsPaid.length;
      currentPaid = currentBillPaid ? 1 : 0;
      const futurePaidCount = futureBillsPaidList.length;

    //   // 7. Validate payment amount if provided
    //   if (amountPaid && Number(amountPaid) !== totalAmountToPay) {
    //     throw new Error(
    //       `Payment amount mismatch. Expected ${totalAmountToPay} for:\n` +
    //       `- ${overduePaid} overdue bill(s) (fully paid)\n` +
    //       `- ${currentPaid} current bill(s) (fully paid)\n` +
    //       `- ${futurePaidCount} future bill(s) (fully paid from end)\n` +
    //       `But received ${amountPaid}`
    //     );
    //   }

  

      // 9. Create financial transaction record
      const transaction = await tx.financial_transactions.create({
        data: {
          upin,
         
          amount_paid: Number(amountPaid),
          payment_date: paymentDate ? new Date(paymentDate) : new Date(),
          bank_transaction_id: transactionId,
          payment_type: "LEASE BILLING",
          bank_branch: callbackData.bankBranch,
          bank_account: callbackData.bankAccount,
          notes: callbackData.notes || this.generateNotes(overduePaid, currentPaid, futurePaidCount, futureBillsPaidList.map(b => b.fiscal_year)),
        }
      });

      // 10. CRITICAL: Adjust remaining_amount for ALL unpaid future bills
      // Subtract (futurePaidCount * basePaymentAmount) from each unpaid future bill's remaining_amount
      const totalDeduction = futurePaidCount * basePaymentAmount;
      
      if (totalDeduction > 0 && allFutureBills.length > 0) {
        console.log(`Adjusting ${allFutureBills.length} future bills: deducting ${totalDeduction} from each remaining_amount`);
        
        for (const futureBill of allFutureBills) {
          const currentRemaining = Number(futureBill.remaining_amount );
          const newRemaining = Math.max(0, currentRemaining - totalDeduction);
          
          await tx.billing_records.update({
            where: { bill_id: futureBill.bill_id },
            data: {
              remaining_amount: newRemaining,
              updated_at: new Date()
            }
          });
        }
      }

      // 11. Mark selected bills as PAID (including future bills from the end)
      const processedBills: ProcessedBill[] = [];

      for (const bill of billsToMarkAsPaid) {
        const billType = bill.fiscal_year < currentYear ? 'OVERDUE' :
                        bill.fiscal_year === currentYear ? 'CURRENT' : 'FUTURE';
        
        // Mark as fully paid
        const updatedBill = await tx.billing_records.update({
          where: { bill_id: bill.bill_id },
          data: {
            payment_status: PaymentStatus.PAID,
            remaining_amount: 0,
            amount_paid: Number(bill.amount_due), // Set to full amount
            last_payment_date: new Date()
          }
        });

        processedBills.push({
          bill_id: bill.bill_id,
          fiscal_year: bill.fiscal_year,
          amount_due: Number(bill.amount_due),
          amount_paid: Number(bill.amount_due),
          remaining_amount: 0,
          status: updatedBill.payment_status as PaymentStatus,
          bill_type: billType
        });
      }

      // 12. Log the transaction for audit
      console.log('Bank callback processed:', {
        transaction_id: transaction.transaction_id,
        upin,
        overdue_paid: overduePaid,
        current_paid: currentPaid,
        future_paid: futurePaidCount,
        future_years_paid: futureBillsPaidList.map(b => b.fiscal_year).join(','),
        total_deduction_applied: totalDeduction,
        total_amount: totalAmountToPay,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        transaction_id: transaction.transaction_id,
        bills_updated: processedBills,
        total_amount_paid: totalAmountToPay,
        message: `Payment processed: ${overduePaid} overdue, ${currentPaid} current, ${futurePaidCount} future`,
        summary: {
          overdue_paid: overduePaid,
          current_paid: currentPaid,
          future_bills_paid: futurePaidCount,

        }
      };
    });
  }

  /**
   * Determine which bills to mark as PAID
   * Priority: 
   * 1. ALL overdue bills (fiscal_year < current) - mark as PAID
   * 2. Current year bill (if exists) - mark as PAID
   * 3. Future bills - take from the END (most recent/farthest years) and mark as PAID
   * 
   * CRITICAL: Also return ALL future bills for adjustment
   */
  private determineBillsToMarkAsPaid(unpaidBills: any[], number: number): { 
    billsToMarkAsPaid: any[], 
    futureBillsPaid: any[],
    allFutureBills: any[]
  } {
    const currentYear = new Date().getFullYear();
    
    // Separate bills by type
    const overdueBills = unpaidBills
      .filter(bill => bill.fiscal_year < currentYear)
      .sort((a, b) => a.fiscal_year - b.fiscal_year); // Oldest first
    
    const currentYearBill = unpaidBills.find(bill => bill.fiscal_year === currentYear);
    
    const allFutureBills = unpaidBills
      .filter(bill => bill.fiscal_year > currentYear)
      .sort((a, b) => a.fiscal_year - b.fiscal_year); // Ascending (2027,2028,2029...)
    
    // Build list of bills to mark as PAID
    const billsToMarkAsPaid: any[] = [];
    let remaining = number;
    
    // 1. Add ALL overdue bills first (they must be fully paid)
    if (overdueBills.length > 0) {
      billsToMarkAsPaid.push(...overdueBills);
      remaining -= overdueBills.length;
    }
    
    // 2. Add current year bill if remaining and exists
    if (remaining > 0 && currentYearBill) {
      billsToMarkAsPaid.push(currentYearBill);
      remaining--;
    }
    
    // 3. Add future bills from the END for the remaining count
    let futureBillsPaid: any[] = [];
    if (remaining > 0 && allFutureBills.length > 0) {
      // Take from the end (most recent years)
      const futureToTake = Math.min(allFutureBills.length, remaining);
      futureBillsPaid = allFutureBills.slice(-futureToTake); // Get last N bills
      billsToMarkAsPaid.push(...futureBillsPaid);
    }
    
    return {
      billsToMarkAsPaid,
      futureBillsPaid,
      allFutureBills
    };
  }

  /**
   * Generate notes for transaction
   */
  private generateNotes(overdueCount: number, currentCount: number, futureCount: number, futureYears: number[]): string {
    const parts = [];
    if (overdueCount > 0) parts.push(`${overdueCount} overdue (fully paid)`);
    if (currentCount > 0) parts.push(`${currentCount} current (fully paid)`);
    if (futureCount > 0) parts.push(`${futureCount} future years ${futureYears.join(',')} (fully paid)`);
    
    return `Payment for: ${parts.join(', ')}`;
  }

  /**
   * Get payment options showing how payments will be applied
   */
//   async getPaymentOptions(upin: string) {
//     const [unpaidBills, leaseAgreement] = await Promise.all([
//       this.prisma.billing_records.findMany({
//         where: {
//           upin,
//           payment_status: { in: [PaymentStatus.UNPAID, PaymentStatus.OVERDUE] },
//           is_deleted: false
//         },
//         orderBy: {
//           fiscal_year: 'asc'
//         }
//       }),
//       this.prisma.lease_agreements.findUnique({
//         where: { upin }
//       })
//     ]);

//     if (!leaseAgreement) {
//       throw new Error(`No lease agreement found for UPIN: ${upin}`);
//     }

//     const currentYear = new Date().getFullYear();
//     const basePayment = Number(leaseAgreement.annual_installment || 0);
    
//     const overdueBills = unpaidBills.filter(b => b.fiscal_year < currentYear);
//     const currentBill = unpaidBills.find(b => b.fiscal_year === currentYear);
//     const futureBills = unpaidBills.filter(b => b.fiscal_year > currentYear);

//     const options = [];
//     const maxOptions = Math.min(10, unpaidBills.length);

//     for (let num = 1; num <= maxOptions; num++) {
//       const { billsToMarkAsPaid, futureBillsPaid, allFutureBills } = this.determineBillsToMarkAsPaid(unpaidBills, num);
      
//       let totalAmount = 0;
//       let overdueCount = 0;
//       let currentCount = 0;
//       let futureCount = 0;
      
//       for (const bill of billsToMarkAsPaid) {
//         totalAmount += Number(bill.amount_due);
//         if (bill.fiscal_year < currentYear) overdueCount++;
//         else if (bill.fiscal_year === currentYear) currentCount++;
//         else futureCount++;
//       }

//       // Calculate how remaining amounts will be adjusted
//       const totalDeduction = futureCount * basePayment;
      
//       // Show adjusted remaining amounts for future bills
//       const adjustedFutureBills = allFutureBills.map(bill => {
//         const currentRemaining = Number(bill.remaining_amount || bill.amount_due);
//         const newRemaining = Math.max(0, currentRemaining - totalDeduction);
//         return {
//           fiscal_year: bill.fiscal_year,
//           current_remaining: currentRemaining,
//           new_remaining: newRemaining,
//           reduction: totalDeduction,
//           will_be_paid: futureBillsPaid.some(fb => fb.bill_id === bill.bill_id)
//         };
//       });

//       options.push({
//         number_of_bills: num,
//         total_amount: totalAmount,
//         breakdown: {
//           overdue: overdueCount,
//           current: currentCount,
//           future: futureCount
//         },
//         future_years_paid: futureBillsPaid.map(b => b.fiscal_year).sort((a, b) => a - b),
//         total_deduction_applied_to_all_future: totalDeduction,
//         future_bills_adjustment: adjustedFutureBills,
//         bills_to_pay: billsToMarkAsPaid.map(b => ({
//           fiscal_year: b.fiscal_year,
//           amount_due: Number(b.amount_due),
//           type: b.fiscal_year < currentYear ? 'OVERDUE' :
//                 b.fiscal_year === currentYear ? 'CURRENT' : 'FUTURE'
//         }))
//       });
//     }

//     return {
//       upin,
//       base_payment_per_year: basePayment,
//       summary: {
//         total_unpaid_bills: unpaidBills.length,
//         overdue_count: overdueBills.length,
//         current_exists: !!currentBill,
//         future_count: futureBills.length,
//         future_year_range: futureBills.length > 0 
//           ? `${futureBills[0].fiscal_year} - ${futureBills[futureBills.length-1].fiscal_year}`
//           : 'none'
//       },
//       payment_options: options
//     };
//   }
}