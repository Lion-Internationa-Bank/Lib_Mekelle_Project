import prisma from '../../config/prisma.ts';
import { dateHelpers } from '../../utils/dateHelpers.ts';
import { LeaseStatus, PaymentStatus } from '../../generated/prisma/enums.ts';
export async function updateLeaseStatus() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting lease status update task...`);

  try {
    const now = new Date();

    // Find all active leases that have expired
    const expiredLeases = await prisma.lease_agreements.findMany({
      where: {
        status: 'ACTIVE',
        expiry_date: {
          lt: now,
          not: null
        }
      },
      select: {
        lease_id: true,
        upin: true,
        expiry_date: true
      }
    });

    console.log(`Found ${expiredLeases.length} expired leases to update`);

    if (expiredLeases.length === 0) {
      console.log('No expired leases to update');
      return { success: true, updatedCount: 0 };
    }

    // Use transaction to update all leases and related bills
    const result = await prisma.$transaction(async (tx) => {
      // Update lease status to EXPIRED
      const leaseUpdatePromises = expiredLeases.map(lease =>
        tx.lease_agreements.update({
          where: { lease_id: lease.lease_id },
          data: {
            status: 'EXPIRED',
            updated_at: new Date()
          }
        })
      );

      const updatedLeases = await Promise.all(leaseUpdatePromises);

      // Update related bills for these leases
      // For each expired lease, we might want to mark future bills or take other actions
      // for (const lease of expiredLeases) {
      //   // Get current fiscal year bills for this lease
      //   const currentFiscalYear = dateHelpers.getCurrentFiscalYear();
        
      //   await tx.billing_records.updateMany({
      //     where: {
      //       upin: lease.upin,
      //       fiscal_year: currentFiscalYear,
      //       payment_status: {
      //         in: ['UNPAID', 'OVERDUE']
      //       }
      //     },
      //     data: {
      //       // You might want to add special handling for expired lease bills
      //       // For now, we'll just log them
      //       updated_at: new Date()
      //     }
      //   });
      // }

      return updatedLeases.length;
    });

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Lease status update completed. Updated: ${result} leases in ${duration}ms`);
    
    return { 
      success: true, 
      updatedCount: result,
      executionTime: duration 
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in lease status update task:`, error);
    throw error;
  }
}