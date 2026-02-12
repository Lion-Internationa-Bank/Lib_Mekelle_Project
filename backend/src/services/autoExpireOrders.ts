// import prisma from '../config/prisma.ts';
// // Runs daily at midnight
// // Purpose: Auto-expire orders past expiry date
// async function autoExpireOrders() {
//   const expiredOrders = await prisma.payment_orders.updateMany({
//     where: {
//       status: 'GENERATED',
//       expires_at: {
//         lt: new Date()
//       }
//     },
//     data: {
//       status: 'EXPIRED'
//     }
//   });
  
//   console.log(`Auto-expired ${expiredOrders.count} orders`);
  
//   // Free up bills for new orders
//   const freedBills = await prisma.billing_records.count({
//     where: {
//       order_items: {
//         some: {
//           order: {
//             status: 'EXPIRED'
//           }
//         }
//       }
//     }
//   });
// }