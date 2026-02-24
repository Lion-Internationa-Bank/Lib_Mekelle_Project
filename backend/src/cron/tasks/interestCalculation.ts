import prisma from '../../config/prisma.ts';
import { dateHelpers } from '../../utils/dateHelpers.ts';
import { RateConfigService } from '../../services/rateConfigService.ts';

export async function calculateAndUpdateInterest() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting interest calculation task...`);

  try {
    const currentFiscalYear = dateHelpers.getCurrentFiscalYear();
    
    // Get current lease interest rate
    const leaseInterestRate = await RateConfigService.getLeaseInterestRate();

    console.log(`Current lease interest rate: ${leaseInterestRate}`);

    // Find all unpaid bills for current fiscal year
    const unpaidBills = await prisma.billing_records.findMany({
      where: {
        fiscal_year: currentFiscalYear,
        payment_status: {
          in: ['UNPAID', 'OVERDUE']
        }
      },
      select: {
        bill_id: true,
        upin: true,
        base_payment: true,
        interest_amount: true,
        amount_due: true,
        remaining_amount: true,
        amount_paid: true
      }
    });

    console.log(`Found ${unpaidBills.length} unpaid bills for interest calculation`);

    if (unpaidBills.length === 0) {
      console.log('No unpaid bills to calculate interest');
      return { success: true, updatedCount: 0 };
    }

    // Use transaction to update all bills
    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = unpaidBills.map(async (bill) => {
        // Calculate remaining amount
        const remainingAmount = Number(bill.remaining_amount);
        
        if (remainingAmount <= 0) return null;

        // Calculate interest: remaining amount * lease interest rate
        // Assuming interest is calculated annually
        const interestAmount = remainingAmount * leaseInterestRate;
        
        // New amount due = base payment + interest
        const newAmountDue = Number(bill.base_payment || 0) + interestAmount;

        return tx.billing_records.update({
          where: { bill_id: bill.bill_id },
          data: {
            interest_amount: interestAmount,
            interest_rate_used:leaseInterestRate,
            amount_due: newAmountDue,
            updated_at: new Date()
          }
        });
      });

      const updatedBills = await Promise.all(updatePromises);
      return updatedBills.filter(Boolean).length;
    });

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Interest calculation completed. Updated: ${result} bills in ${duration}ms`);
    
    return { 
      success: true, 
      updatedCount: result,
      executionTime: duration 
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in interest calculation task:`, error);
    throw error;
  }
}