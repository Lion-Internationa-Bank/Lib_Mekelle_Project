
import prisma from '../../config/prisma.ts';
import { dateHelpers } from '../../utils/dateHelpers.ts';
import { PaymentStatus } from '../../generated/prisma/enums.ts';

export async function updateBillStatusToOverdue() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting bill status update task...`);

  try {
    const currentFiscalYear = dateHelpers.getCurrentFiscalYear();
    const now = new Date();

    // Find all unpaid bills for current fiscal year with due date less than now
    const overdueBills = await prisma.billing_records.findMany({
      where: {
        fiscal_year: currentFiscalYear,
        payment_status: PaymentStatus.UNPAID,
        due_date: {
          lt: now,
          not: null
        }
      },
      select: {
        bill_id: true,
        upin: true,
        due_date: true,
        amount_due: true,
        base_payment: true,
        interest_amount: true,
        penalty_amount: true,
        remaining_amount: true
      }
    });

    console.log(`Found ${overdueBills.length} overdue bills for fiscal year ${currentFiscalYear}`);

    if (overdueBills.length === 0) {
      console.log('No overdue bills to update');
      return { success: true, updatedCount: 0 };
    }

    // Use transaction to update all bills
    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = overdueBills.map(bill => 
        tx.billing_records.update({
          where: { bill_id: bill.bill_id },
          data: {
            payment_status: 'OVERDUE',
            updated_at: new Date()
          }
        })
      );

      const updatedBills = await Promise.all(updatePromises);
      return updatedBills.length;
    });

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Bill status update completed. Updated: ${result} bills in ${duration}ms`);
    
    return { 
      success: true, 
      updatedCount: result,
      executionTime: duration 
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in bill status update task:`, error);
    throw error;
  }
}