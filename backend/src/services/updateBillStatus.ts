import prisma from '../config/prisma.ts';
// Runs daily at 6 AM
// Purpose: Mark unpaid bills as OVERDUE after due date
async function updateOverdueBills() {
  const overdueBills = await prisma.billing_records.updateMany({
    where: {
      payment_status: 'UNPAID',
      due_date: {
        lt: new Date()
      }
    },
    data: {
      payment_status: 'OVERDUE'
    }
  });
  
  console.log(`Updated ${overdueBills.count} bills to OVERDUE status`);
}