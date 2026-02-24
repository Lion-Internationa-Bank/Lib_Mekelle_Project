import prisma from '../../config/prisma.ts';
import { dateHelpers } from '../../utils/dateHelpers.ts';
import { RateConfigService } from '../../services/rateConfigService.ts';
import { PaymentStatus } from '../../generated/prisma/enums.ts';

export async function calculateAndUpdatePenalty() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting penalty calculation task...`);

  try {
    const currentFiscalYear = dateHelpers.getCurrentFiscalYear();
    const now = new Date();

    // Get current rates
    const penaltyRate = await RateConfigService.getPenaltyRate();
    const leaseInterestRate = await RateConfigService.getLeaseInterestRate();
    const graceDays = await RateConfigService.getLatePaymentGraceDays();

    console.log(`Current rates - Penalty: ${penaltyRate}, Interest: ${leaseInterestRate}, Grace Days: ${graceDays}`);

    // Find all overdue bills for current fiscal year
    const overdueBills = await prisma.billing_records.findMany({
      where: {
        fiscal_year: currentFiscalYear,
        payment_status: 'OVERDUE',
        due_date: {
          not: null
        }
      },
      select: {
        bill_id: true,
        upin: true,
        due_date: true,
        base_payment: true,
        interest_amount: true,
        penalty_amount: true,
        amount_due: true,
        remaining_amount: true
      }
    });

    console.log(`Found ${overdueBills.length} overdue bills for penalty calculation`);

    if (overdueBills.length === 0) {
      console.log('No overdue bills to calculate penalty');
      return { success: true, updatedCount: 0 };
    }

    // Use transaction to update all bills
    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = overdueBills.map(async (bill) => {
        if (!bill.due_date) return null;

        // Calculate days overdue (after grace period)
        const daysOverdue = Math.max(0, dateHelpers.getDaysDifference(bill.due_date, now) );
        // const daysOverdue = Math.max(0, dateHelpers.getDaysDifference(bill.due_date, now) - graceDays);
        
        if (daysOverdue <= 0) return null;

        // Calculate base amount for penalty (base payment + interest)
        const baseAmount = Number(bill.base_payment || 0) + Number(bill.interest_amount || 0);
        
        // Calculate penalty: (base payment + interest) * (penalty rate + interest rate) * days/365
        // Assuming rates are annual rates
        const penaltyAmount = baseAmount * (penaltyRate + leaseInterestRate) * (daysOverdue / 365);
        
        // New total due
        const newAmountDue = baseAmount + penaltyAmount;

        return tx.billing_records.update({
          where: { bill_id: bill.bill_id },
          data: {
            penalty_amount: penaltyAmount,
            amount_due: newAmountDue,
            updated_at: new Date()
          }
        });
      });

      const updatedBills = await Promise.all(updatePromises);
      return updatedBills.filter(Boolean).length;
    });

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Penalty calculation completed. Updated: ${result} bills in ${duration}ms`);
    
    return { 
      success: true, 
      updatedCount: result,
      executionTime: duration 
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in penalty calculation task:`, error);
    throw error;
  }
}