// // src/services/paymentOrderService.ts
// import prisma from '../config/prisma.ts';
// import { OrderNumberService } from './orderNumberService.ts';
// import { OrderGenerationMode, OrderStatus, PaymentStatus } from '../generated/prisma/enums.ts';

// export class PaymentOrderService {
//   private orderNumberService: OrderNumberService;

//   constructor() {
//     this.orderNumberService = OrderNumberService.getInstance();
//   }

//   /**
//    * Create payment order for a single bill
//    */
//   async createPaymentOrder(billId: string, options?: {
//     mode?: OrderGenerationMode;
//     validityDays?: number;
//     bankBranch?: string;
//     notes?: string;
//   }) {
//     // Get bill details
//     const bill = await prisma.billing_records.findUnique({
//       where: { bill_id: billId },
//       include: {
//         parcel: true,
//         lease_agreement: true
//       }
//     });

//     if (!bill) {
//       throw new Error('Bill not found');
//     }

//     // Check if bill already has an active order
//     const existingOrderItem = await prisma.order_bill_items.findFirst({
//       where: {
//         bill_id: billId,
//         order: {
//           status: 'GENERATED'
//         }
//       }
//     });

//     if (existingOrderItem) {
//       throw new Error(`Bill already has an active payment order: ${existingOrderItem.order_number}`);
//     }

//     // Calculate expiry date (default 90 days)
//     const validityDays = options?.validityDays || 90;
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + validityDays);

//     // Generate order number
//     const orderNumber = await this.orderNumberService.generateOrderNumberWithRetry();

//     return prisma.$transaction(async (tx) => {
//       // Create payment order
//       const order = await tx.payment_orders.create({
//         data: {
//           order_number: orderNumber,
//           total_amount: bill.amount_due,
//           generation_mode: options?.mode || 'AUTO',
//           expires_at: expiresAt,
//           status: 'GENERATED'
//         }
//       });

//       // Create order bill item (NO status field)
//       const orderItem = await tx.order_bill_items.create({
//         data: {
//           order_number: orderNumber,
//           bill_id: billId,
//           upin: bill.upin,
//           bill_type: bill.bill_type,
//           amount: bill.amount_due,
//           fiscal_year: bill.fiscal_year
//         }
//       });

//       return { order, orderItem };
//     });
//   }

//   /**
//    * Create bulk payment order for multiple bills
//    */
//   async createBulkPaymentOrder(params: {
//     billIds: string[];
//     validityDays?: number;
//     bankBranch?: string;
//     notes?: string;
//     mode?: OrderGenerationMode;
//   }) {
//     // Validate input
//     if (!params.billIds || params.billIds.length === 0) {
//       throw new Error('At least one bill must be selected');
//     }

//     // Get all bills
//     const bills = await prisma.billing_records.findMany({
//       where: {
//         bill_id: { in: params.billIds },
//         payment_status: 'UNPAID',
//         is_deleted: false
//       },
//       include: {
//         parcel: true
//       }
//     });

//     if (bills.length === 0) {
//       throw new Error('No valid bills found for order creation');
//     }

//     // Check if any bill already has an active order
//     const billsWithOrders = await prisma.billing_records.findMany({
//       where: {
//         bill_id: { in: params.billIds },
//         order_items: {
//           some: {
//             order: {
//               status: 'GENERATED'
//             }
//           }
//         }
//       }
//     });

//     if (billsWithOrders.length > 0) {
//       const billIdsWithOrders = billsWithOrders.map(b => b.bill_id);
//       throw new Error(`Some bills already have active payment orders: ${billIdsWithOrders.join(', ')}`);
//     }

//     // Validate no duplicate bill types per UPIN
//     const billsByUpin: Record<string, Set<string>> = {};
//     for (const bill of bills) {
//       // Initialize set if it doesn't exist
//       if (!billsByUpin[bill.upin]) {
//         billsByUpin[bill.upin] = new Set();
//       }
      
//       // Check for duplicate bill types within same UPIN
//       const billTypeSet = billsByUpin[bill.upin];
//       if (billTypeSet && billTypeSet.has(bill.bill_type)) {
//         throw new Error(
//           `Cannot add multiple ${bill.bill_type} bills from UPIN ${bill.upin} to the same order. ` +
//           `Please select only one ${bill.bill_type} bill per UPIN.`
//         );
//       }
      
//       // Add bill type to the set
//       if (billTypeSet) {
//         billTypeSet.add(bill.bill_type);
//       }
//     }

//     // Calculate total amount
//     const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.amount_due || 0), 0);

//     // Calculate expiry date
//     const validityDays = params.validityDays || 90;
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + validityDays);

//     // Generate order number
//     const orderNumber = await this.orderNumberService.generateOrderNumberWithRetry();

//     return prisma.$transaction(async (tx) => {
//       // Create payment order
//       const order = await tx.payment_orders.create({
//         data: {
//           order_number: orderNumber,
//           total_amount: totalAmount,
//           generation_mode: params.mode || 'BULK',
//           expires_at: expiresAt,
//           status: 'GENERATED'
//         }
//       });

//       // Create order items for each bill (NO status)
//       const orderItems = await Promise.all(
//         bills.map(bill =>
//           tx.order_bill_items.create({
//             data: {
//               order_number: orderNumber,
//               bill_id: bill.bill_id,
//               upin: bill.upin,
//               bill_type: bill.bill_type,
//               amount: bill.amount_due,
//               fiscal_year: bill.fiscal_year
//             }
//           })
//         )
//       );

//       return { order, orderItems, billCount: bills.length };
//     });
//   }

//   /**
//    * Add bills to existing order
//    */
//   async addBillsToOrder(orderNumber: string, billIds: string[]) {
//     const order = await prisma.payment_orders.findUnique({
//       where: { order_number: orderNumber }
//     });

//     if (!order) {
//       throw new Error('Order not found');
//     }

//     if (order.status !== 'GENERATED') {
//       throw new Error('Cannot add bills to non-GENERATED order');
//     }

//     // Get existing bill types per UPIN in the order
//     const existingItems = await prisma.order_bill_items.findMany({
//       where: { order_number: orderNumber }
//     });

//     const existingBillTypesByUpin: Record<string, Set<string>> = {};
//     for (const item of existingItems) {
//       // Initialize set if it doesn't exist
//       if (!existingBillTypesByUpin[item.upin]) {
//         existingBillTypesByUpin[item.upin] = new Set();
//       }
      
//       // Get the set and add bill type
//       const billTypeSet = existingBillTypesByUpin[item.upin];
//       if (billTypeSet) {
//         billTypeSet.add(item.bill_type);
//       }
//     }

//     // Get bills to add
//     const bills = await prisma.billing_records.findMany({
//       where: {
//         bill_id: { in: billIds },
//         payment_status: 'UNPAID',
//         is_deleted: false,
//         // Check if bill already has active order
//         order_items: {
//           none: {
//             order: {
//               status: 'GENERATED'
//             }
//           }
//         }
//       }
//     });

//     // Validate no duplicate bill types within same UPIN
//     for (const bill of bills) {
//       const existingTypes = existingBillTypesByUpin[bill.upin];
//       if (existingTypes?.has(bill.bill_type)) {
//         throw new Error(
//           `Cannot add ${bill.bill_type} bill from UPIN ${bill.upin}. ` +
//           `This order already contains a ${bill.bill_type} bill for this UPIN.`
//         );
//       }
//     }

//     return prisma.$transaction(async (tx) => {
//       // Create order items (NO status)
//       const orderItems = await Promise.all(
//         bills.map(bill =>
//           tx.order_bill_items.create({
//             data: {
//               order_number: orderNumber,
//               bill_id: bill.bill_id,
//               upin: bill.upin,
//               bill_type: bill.bill_type,
//               amount: bill.amount_due,
//               fiscal_year: bill.fiscal_year
//             }
//           })
//         )
//       );

//       // Update order total amount
//       const newTotal = Number(order.total_amount || 0) + 
//                       bills.reduce((sum, bill) => sum + Number(bill.amount_due || 0), 0);

//       await tx.payment_orders.update({
//         where: { order_number: orderNumber },
//         data: {
//           total_amount: newTotal
//         }
//       });

//       return orderItems;
//     });
//   }

//   /**
//    * Generate orders for bills with less than 90 days due date
//    * Only if payment status is not PAID and bill has no active GENERATED order
//    */
//   async generateOrdersForUpcomingBills(daysThreshold: number = 90) {
//     const targetDate = new Date();
//     targetDate.setDate(targetDate.getDate() + daysThreshold);

//     // Find bills due within threshold days without active GENERATED orders
//     const upcomingBills = await prisma.billing_records.findMany({
//       where: {
//         due_date: {
//           lte: targetDate,
//           gte: new Date()
//         },
//         payment_status: {
//           not: 'PAID'
//         },
//         is_deleted: false,
//         // Bills that have no GENERATED orders
//         order_items: {
//           none: {
//             order: {
//               status: 'GENERATED'
//             }
//           }
//         }
//       },
//       include: {
//         parcel: true
//       },
//       take: 200
//     });

//     const results = [];
//     for (const bill of upcomingBills) {
//       try {
//         const { order } = await this.createPaymentOrder(bill.bill_id, {
//           mode: 'AUTO',
//           validityDays: 90
//         });
        
//         const daysUntilDue = bill.due_date 
//           ? Math.ceil((bill.due_date.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
//           : null;
        
//         results.push({ 
//           success: true, 
//           billId: bill.bill_id, 
//           orderNumber: order.order_number,
//           dueDate: bill.due_date,
//           daysUntilDue
//         });
//       } catch (error: any) {
//         results.push({ 
//           success: false, 
//           billId: bill.bill_id, 
//           error: error.message,
//           dueDate: bill.due_date
//         });
//       }
//     }

//     // Generate report
//     const successful = results.filter(r => r.success);
//     const failed = results.filter(r => !r.success);
    
//     return {
//       totalProcessed: results.length,
//       successful: successful.length,
//       failed: failed.length,
//       results,
//       summary: {
//         byDueDate: this.groupByDueDate(successful),
//         errors: failed.map(f => ({ billId: f.billId, error: f.error }))
//       }
//     };
//   }

//   /**
//    * Generate order for a specific bill with validation
//    */
//   async generateOrderForBill(billId: string, options?: {
//     mode?: OrderGenerationMode;
//     validityDays?: number;
//     force?: boolean; // Force generation even if checks fail
//   }) {
//     const bill = await prisma.billing_records.findUnique({
//       where: { bill_id: billId },
//       include: {
//         order_items: {
//           include: {
//             order: true
//           }
//         }
//       }
//     });

//     if (!bill) {
//       throw new Error('Bill not found');
//     }

//     // Check if bill is already PAID
//     if (bill.payment_status === 'PAID' && !options?.force) {
//       throw new Error('Bill is already PAID');
//     }

//     // Check if bill has due date within 90 days
//     if (bill.due_date) {
//       const daysUntilDue = Math.ceil((bill.due_date.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
//       if (daysUntilDue > 90 && !options?.force) {
//         throw new Error(`Bill due date is ${daysUntilDue} days away (more than 90 days)`);
//       }
//     }

//     // Check for existing GENERATED orders
//     const hasActiveOrder = bill.order_items?.some(item => 
//       item.order?.status === 'GENERATED'
//     );

//     if (hasActiveOrder && !options?.force) {
//       const activeOrder = bill.order_items?.find(item => item.order?.status === 'GENERATED');
//       throw new Error(`Bill already has active GENERATED order: ${activeOrder?.order_number}`);
//     }

//     return this.createPaymentOrder(billId, {
//       mode: options?.mode || 'AUTO',
//       validityDays: options?.validityDays || 90,
//       notes: options?.force ? 'Forced generation' : undefined
//     });
//   }

//   /**
//    * Check if bill is eligible for order generation
//    */
//   async checkBillEligibility(billId: string): Promise<{
//     eligible: boolean;
//     reasons: string[];
//     dueDateInfo?: {
//       dueDate: Date;
//       daysUntilDue: number;
//       within90Days: boolean;
//     };
//     existingOrder?: {
//       orderNumber: string;
//       orderStatus: OrderStatus;
//     };
//     paymentStatus: PaymentStatus;
//   }> {
//     const bill = await prisma.billing_records.findUnique({
//       where: { bill_id: billId },
//       include: {
//         order_items: {
//           include: {
//             order: true
//           }
//         }
//       }
//     });

//     if (!bill) {
//       return { eligible: false, reasons: ['Bill not found'], paymentStatus: 'UNPAID' };
//     }

//     const reasons: string[] = [];
    
//     // Check payment status
//     if (bill.payment_status === 'PAID') {
//       reasons.push('Bill is already PAID');
//     }

//     // Check due date
//     let dueDateInfo = undefined;
//     if (bill.due_date) {
//       const daysUntilDue = Math.ceil((bill.due_date.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
//       dueDateInfo = {
//         dueDate: bill.due_date,
//         daysUntilDue,
//         within90Days: daysUntilDue <= 90
//       };
      
//       if (daysUntilDue > 90) {
//         reasons.push(`Due date is ${daysUntilDue} days away (more than 90 days)`);
//       }
//     } else {
//       reasons.push('Bill has no due date');
//     }

//     // Check existing GENERATED orders
//     let existingOrder = undefined;
//     const activeOrderItem = bill.order_items?.find(item => 
//       item.order?.status === 'GENERATED'
//     );

//     if (activeOrderItem) {
//       existingOrder = {
//         orderNumber: activeOrderItem.order_number,
//         orderStatus: activeOrderItem.order!.status
//       };
//       reasons.push(`Bill has active GENERATED order: ${activeOrderItem.order_number}`);
//     }

//     const eligible = reasons.length === 0;

//     return {
//       eligible,
//       reasons,
//       dueDateInfo,
//       existingOrder,
//       paymentStatus: bill.payment_status
//     };
//   }

//   /**
//    * Get bills eligible for order generation
//    */
//   async getEligibleBills(upin?: string, daysThreshold: number = 90) {
//     const targetDate = new Date();
//     targetDate.setDate(targetDate.getDate() + daysThreshold);

//     const whereClause: any = {
//       due_date: {
//         lte: targetDate,
//         gte: new Date()
//       },
//       payment_status: {
//         not: 'PAID'
//       },
//       is_deleted: false,
//       // No GENERATED orders
//       order_items: {
//         none: {
//           order: {
//             status: 'GENERATED'
//           }
//         }
//       }
//     };

//     if (upin) {
//       whereClause.upin = upin;
//     }

//     const eligibleBills = await prisma.billing_records.findMany({
//       where: whereClause,
//       include: {
//         parcel: true,
//         lease_agreement: true,
//         order_items: {
//           include: {
//             order: true
//           }
//         }
//       },
//       orderBy: {
//         due_date: 'asc'
//       }
//     });

//     return eligibleBills.map(bill => {
//       const daysUntilDue = bill.due_date 
//         ? Math.ceil((bill.due_date.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
//         : null;

//       const hasActiveOrder = bill.order_items?.some(item => 
//         item.order?.status === 'GENERATED'
//       );

//       return {
//         bill_id: bill.bill_id,
//         upin: bill.upin,
//         bill_type: bill.bill_type,
//         amount_due: bill.amount_due,
//         due_date: bill.due_date,
//         days_until_due: daysUntilDue,
//         payment_status: bill.payment_status,
//         fiscal_year: bill.fiscal_year,
//         has_active_order: hasActiveOrder,
//         order_history: bill.order_items?.map(item => ({
//           order_number: item.order_number,
//           order_status: item.order?.status,
//           created_at: item.created_at
//         })),
//         parcel: bill.parcel,
//         lease: bill.lease_agreement
//       };
//     });
//   }

//   /**
//    * Process payment for an order
//    */
//   async processOrderPayment(orderNumber: string, paymentData: {
//     amountPaid: number;
//     bankTransactionId?: string;
//     bankBranch?: string;
//     paymentMethod: string;
//     receiptSerialNo: string;
//     paymentDate?: Date;
//   }) {
//     const order = await prisma.payment_orders.findUnique({
//       where: { order_number: orderNumber },
//       include: {
//         bill_items: {
//           include: {
//             bill: true
//           }
//         }
//       }
//     });

//     if (!order) {
//       throw new Error('Order not found');
//     }

//     if (order.status !== 'GENERATED') {
//       throw new Error(`Order is already ${order.status}`);
//     }

//     // Validate payment amount
//     const orderAmount = Number(order.total_amount || 0);
//     const paymentAmount = Number(paymentData.amountPaid || 0);
    
//     if (Math.abs(paymentAmount - orderAmount) > 0.01) {
//       throw new Error(
//         `Payment amount (${paymentAmount}) does not match order total (${orderAmount})`
//       );
//     }

//     const paymentDate = paymentData.paymentDate || new Date();

//     return prisma.$transaction(async (tx) => {
//       // Get first parcel for transaction reference
//       const firstItem = order.bill_items[0];
//       const transactionUpin = firstItem?.upin || '';

//       // Create financial transaction
//       const transaction = await tx.financial_transactions.create({
//         data: {
//           order_number: orderNumber,
//           upin: transactionUpin,
//           receipt_serial_no: paymentData.receiptSerialNo,
//           amount_paid: paymentData.amountPaid,
//           payment_method: paymentData.paymentMethod,
//           bank_transaction_id: paymentData.bankTransactionId,
//           bank_branch: paymentData.bankBranch,
//           payment_date: paymentDate,
//           revenue_type: 'PAYMENT'
//         }
//       });

//       // Update order status
//       await tx.payment_orders.update({
//         where: { order_number: orderNumber },
//         data: {
//           status: 'PAID',
//           paid_at: paymentDate,
//           final_amount_paid: paymentData.amountPaid,
//           payment_method: paymentData.paymentMethod
//         }
//       });

//       // Update all bills in the order
//       for (const item of order.bill_items) {
//         if (item.bill) {
//           // Update bill payment status
//           await tx.billing_records.update({
//             where: { bill_id: item.bill_id },
//             data: {
//               payment_status: 'PAID',
//               last_payment_date: paymentDate,
//               remaining_amount: 0
//             }
//           });
//         }
//         // NO NEED to update order_bill_items.status anymore!
//       }

//       return { transaction, billCount: order.bill_items.length };
//     });
//   }

//   /**
//    * Cancel an order
//    */
//   async cancelOrder(orderNumber: string, reason?: string) {
//     const order = await prisma.payment_orders.findUnique({
//       where: { order_number: orderNumber }
//     });

//     if (!order) {
//       throw new Error('Order not found');
//     }

//     if (order.status !== 'GENERATED') {
//       throw new Error(`Cannot cancel order with status: ${order.status}`);
//     }

//     return prisma.payment_orders.update({
//       where: { order_number: orderNumber },
//       data: {
//         status: 'CANCELLED',
//         cancelled_at: new Date()
//       }
//     });
//     // NO NEED to update order_bill_items.status anymore!
//   }

//   /**
//    * Helper: Group results by due date
//    */
//   private groupByDueDate(results: any[]): Record<string, number> {
//     // Initialize with all possible groups
//     const groups: Record<string, number> = {
//       '0-7': 0,
//       '8-30': 0,
//       '31-60': 0,
//       '61-90': 0,
//       '90+': 0
//     };

//     for (const result of results) {
//       // Skip if daysUntilDue is null/undefined
//       if (result.daysUntilDue === null || result.daysUntilDue === undefined) {
//         continue;
//       }
      
//       if (result.daysUntilDue <= 7) {
//         groups['0-7'] = (groups['0-7'] || 0) + 1;
//       } else if (result.daysUntilDue <= 30) {
//         groups['8-30'] = (groups['8-30'] || 0) + 1;
//       } else if (result.daysUntilDue <= 60) {
//         groups['31-60'] = (groups['31-60'] || 0) + 1;
//       } else if (result.daysUntilDue <= 90) {
//         groups['61-90'] = (groups['61-90'] || 0) + 1;
//       } else {
//         groups['90+'] = (groups['90+'] || 0) + 1;
//       }
//     }

//     return groups;
//   }

//   /**
//    * Auto-generate orders for upcoming bills (legacy - uses simpler logic)
//    */
//   async autoGenerateOrdersForUpcomingBills(daysBeforeDue: number = 90) {
//     return this.generateOrdersForUpcomingBills(daysBeforeDue);
//   }

//   /**
//    * Check for expiring orders
//    */
//   async checkExpiringOrders(daysThreshold: number = 3) {
//     const thresholdDate = new Date();
//     thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

//     const expiringOrders = await prisma.payment_orders.findMany({
//       where: {
//         status: 'GENERATED',
//         expires_at: {
//           lte: thresholdDate,
//           gte: new Date()
//         },
//         is_deleted: false
//       },
//       include: {
//         bill_items: {
//           include: {
//             bill: {
//               include: {
//                 parcel: {
//                   include: {
//                     owners: {
//                       include: { owner: true }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     });

//     return expiringOrders;
//   }

//   /**
//    * Extend order validity
//    */
//   async extendOrderValidity(orderNumber: string, additionalDays: number) {
//     const order = await prisma.payment_orders.findUnique({
//       where: { order_number: orderNumber }
//     });

//     if (!order) {
//       throw new Error('Order not found');
//     }

//     if (order.status !== 'GENERATED') {
//       throw new Error('Cannot extend non-GENERATED order');
//     }

//     const newExpiry = new Date(order.expires_at);
//     newExpiry.setDate(newExpiry.getDate() + additionalDays);

//     return prisma.payment_orders.update({
//       where: { order_number: orderNumber },
//       data: {
//         expires_at: newExpiry
//       }
//     });
//   }

//   /**
//    * Get order with details
//    */
//   async getOrderDetails(orderNumber: string) {
//     return prisma.payment_orders.findUnique({
//       where: { order_number: orderNumber },
//       include: {
//         bill_items: {
//           include: {
//             bill: {
//               include: {
//                 parcel: true,
//                 lease_agreement: true
//               }
//             },
//             parcel: true
//           }
//         },
//         transactions: true
//       }
//     });
//   }
// }