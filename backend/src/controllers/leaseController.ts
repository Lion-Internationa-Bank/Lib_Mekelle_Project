// src/controllers/leaseController.ts
import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';
import { AuditAction, } from '../generated/prisma/enums.ts'; 


// Use Prisma namespace types
type PrismaClientType = typeof prisma;
type PrismaTransactionType = Parameters<Parameters<PrismaClientType['$transaction']>[0]>[0];

// ---- Bill generators ----

// For create (global client)
const generateLeaseBills = async (lease: any) => {
  return generateLeaseBillsCore(prisma, lease);
};

// For update (inside $transaction)
const generateLeaseBillsInTx = async (
  tx: PrismaTransactionType,
  lease: any
) => {
  return generateLeaseBillsCore(tx, lease);
};

// Core implementation reused by both
const generateLeaseBillsCore = async (
  client: PrismaTransactionType | PrismaClientType,
  lease: any
) => {
  // Cast to any to avoid type errors with transaction client
  const prismaClient = client as any;

  const rateConfig = await prismaClient.rate_configurations.findFirst({
    where: {
      rate_type: "LEASE_INTEREST_RATE",
      is_active: true,
      effective_from: { lte: new Date() },
      OR: [
        { effective_until: { gte: new Date() } },
        { effective_until: null },
      ],
    },
    orderBy: { effective_from: "desc" },
  });

  if (!rateConfig) {
    throw new Error("No active lease interest rate configuration found");
  }

  const interestRate = parseFloat(rateConfig.value.toString());

  const downPayment = parseFloat(lease.down_payment_amount.toString());
  const otherPayment = parseFloat(lease.other_payment.toString());
  const totalLeaseAmount = parseFloat(lease.total_lease_amount.toString());
  const paymentTermYears = lease.payment_term_years;
  const annualMainPayment = Number(
    lease.annualMainPayment ?? lease.annual_installment ?? 0
  );

  let remainingAmount = totalLeaseAmount - (downPayment + otherPayment) ;
  if (remainingAmount <= 0) {
    throw new Error("Down payment must be less than total lease amount");
  }

  const bills: any[] = [];
  const startDate = new Date(lease.start_date);

  for (let year = 1; year <= paymentTermYears; year++) {
    const dueDate = new Date(startDate);
    dueDate.setFullYear(dueDate.getFullYear() + year);

    const interest = parseFloat(
      (remainingAmount * interestRate).toFixed(2)
    );
    const totalAnnualPayment = parseFloat(
      (annualMainPayment + interest).toFixed(2)
    );

    const bill = await prismaClient.billing_records.create({
      data: {
        upin: lease.upin,
        lease_id: lease.lease_id,
        fiscal_year: dueDate.getFullYear(),
        bill_type: "LEASE",
        amount_due: totalAnnualPayment,
        amount_paid: 0,
        penalty_amount: 0,
        interest_amount: interest,
        base_payment: annualMainPayment,
        payment_status: "UNPAID",
        due_date: dueDate,
        interest_rate_used: interestRate,
        penalty_rate_used: 0,
        sync_status: "PENDING",
        installment_number: year,
        remaining_amount: remainingAmount,
      },
    });

    bills.push(bill);

    remainingAmount = parseFloat(
      (remainingAmount - annualMainPayment).toFixed(2)
    );
    if (remainingAmount < 0) remainingAmount = 0;
  }

  return bills;
};

// ---- CREATE LEASE ----

export const createLease = async (req: Request, res: Response) => {
  const {
    upin,
    total_lease_amount,
    contract_date,
    down_payment_amount,
    lease_period_years,
    legal_framework,
    payment_term_years,
    price_per_m2,
    start_date,
    other_payment,
  } = req.body;

  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    // 1. Check if land parcel exists
    const landParcel = await prisma.land_parcels.findUnique({
      where: { upin },
    });

    if (!landParcel) {
      return res.status(404).json({
        success: false,
        message: "Land parcel not found",
      });
    }
    else{
      if(landParcel.tenure_type !== "LEASE"){
        return res.status(403).json({
          success: false,
          message: "Land Tenure Type Must Be LEASE to Register Lease Agreement"
        })
      }
    }
     
    

    

    // 2. Expiry date from start_date + lease_period_years
    const startDate = new Date(start_date);
    const expiryDate = new Date(startDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + lease_period_years);

    // 3. Calculate principal and annual main payment
    const totalLeaseAmountNum = Number(total_lease_amount ?? 0);
    const downPaymentNum = Number(down_payment_amount ?? 0);
    const otherPaymentNum = Number(other_payment ?? 0)
    const principal = totalLeaseAmountNum - (downPaymentNum + otherPaymentNum);

    if (principal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Down payment plus Other payment must be less than total lease amount",
      });
    }


    const annualMainPayment =
      payment_term_years > 0 ? principal / payment_term_years : 0;

    // 4. Create lease
    const lease = await prisma.lease_agreements.create({
      data: {
        upin,
        total_lease_amount,
        contract_date: new Date(contract_date),
        down_payment_amount,
        other_payment,
        lease_period_years,
        legal_framework,
        payment_term_years,
        price_per_m2,
        start_date: startDate,
        expiry_date: expiryDate,
        annual_installment: annualMainPayment,
      },
    });

    // 5. Generate bills using shared generator
    const bills = await generateLeaseBills({
      ...lease,
      annualMainPayment,
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        user_id: actor?.user_id || null,
        action_type: AuditAction.CREATE,
        entity_type: 'lease_agreements',
        entity_id: lease.lease_id,
        changes: {
          action: 'create_lease',
          upin,
          total_lease_amount: lease.total_lease_amount,
          down_payment_amount: lease.down_payment_amount,
          other_payment: lease.other_payment,
          lease_period_years: lease.lease_period_years,
          payment_term_years: lease.payment_term_years,
          price_per_m2: lease.price_per_m2,
          start_date: lease.start_date,
          expiry_date: lease.expiry_date,
          contract_date: lease.contract_date,
          annual_installment: lease.annual_installment,
          bills_created: bills.length,
          actor_id: actor?.user_id,
          actor_role: actor?.role,
          actor_username: actor?.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        lease_id: lease.lease_id,
        lease: {
          ...lease,
          expiry_date: expiryDate,
        },
        bills_created: bills.length,
        bills,
      },
    });
  } catch (error: any) {
    console.error("Create lease error:", error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Lease for this land parcel already exists"
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Invalid land parcel reference"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to create lease agreement",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ---- UPDATE LEASE ----

export const updateLease = async (
  req: Request<{ lease_id: string }>,
  res: Response
) => {
  const { lease_id } = req.params;
  const data = req.body;
  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    console.log("Lease update started");

    const existingLease = await prisma.lease_agreements.findUnique({
      where: { lease_id },
    });

    if (!existingLease) {
      return res.status(404).json({
        success: false,
        message: "Lease agreement not found",
      });
    }

    const allowedUpdates = {
      annual_lease_fee: true,
      total_lease_amount: true,
      down_payment_amount: true,
      other_payment:true,
      annual_installment: true,
      price_per_m2: true,
      lease_period_years: true,
      payment_term_years: true,
      legal_framework: true,
      start_date: true,
      expiry_date: true,
      contract_date: true,
    } as const;

    const updates: any = {};
    const changesForAudit: any = {};

    Object.keys(data).forEach((key) => {
      if (allowedUpdates[key as keyof typeof allowedUpdates]) {
        let value = data[key];

        if (["start_date", "expiry_date", "contract_date"].includes(key)) {
          if (typeof value === "string") {
            const parsedDate = new Date(value);
            if (isNaN(parsedDate.getTime())) {
              throw new Error(`Invalid date format for ${key}: ${value}`);
            }
            value = parsedDate;
          } else if (!(value instanceof Date)) {
            throw new Error(`Invalid date type for ${key}`);
          }
        }

        if (
          [
            "annual_lease_fee",
            "total_lease_amount",
            "down_payment_amount",
            "other_payment",
            "annual_installment",
            "price_per_m2",
            "lease_period_years",
            "payment_term_years",
          ].includes(key) &&
          typeof value === "string"
        ) {
          const num = parseFloat(value);
          if (isNaN(num)) {
            throw new Error(`Invalid number for ${key}: ${value}`);
          }
          value = num;
        }

        updates[key] = value;
        
        // Only store in audit log if value has changed
        const existingValue = existingLease[key as keyof typeof existingLease];
        if (JSON.stringify(existingValue) !== JSON.stringify(value)) {
          changesForAudit[key] = {
            from: existingValue,
            to: value
          };
        }
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const totalLeaseAmount =
      updates.total_lease_amount ?? existingLease.total_lease_amount;
    const downPaymentAmount =
      updates.down_payment_amount ?? existingLease.down_payment_amount;
    const otherPaymentAmount = 
      updates.other_payment ?? existingLease.other_payment; 
    const paymentTermYears =
      updates.payment_term_years ?? existingLease.payment_term_years;
    const leasePeriodYears =
      updates.lease_period_years ?? existingLease.lease_period_years;
    const startDateVal =
      updates.start_date ?? existingLease.start_date;

    if (updates.start_date || updates.lease_period_years) {
      const startDate = new Date(startDateVal);
      const expiryDate = new Date(startDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + leasePeriodYears);
      updates.expiry_date = expiryDate;
      
      // Add expiry_date to audit if it changed
      if (existingLease.expiry_date?.getTime() !== expiryDate.getTime()) {
        changesForAudit.expiry_date = {
          from: existingLease.expiry_date,
          to: expiryDate
        };
      }
    }

    const principal =
      Number(totalLeaseAmount ?? 0) - (Number(downPaymentAmount ?? 0) + Number(otherPaymentAmount ?? 0 ));
    if (principal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Down payment plus Other payment must be less than total lease amount",
      });
    }

    const annualMainPayment =
      paymentTermYears > 0 ? principal / paymentTermYears : 0;
    updates.annual_installment = annualMainPayment;
    
    // Add annual_installment to audit if it changed
    if (Number(existingLease.annual_installment) !== annualMainPayment) {
      changesForAudit.annual_installment = {
        from: existingLease.annual_installment,
        to: annualMainPayment
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedLease = await tx.lease_agreements.update({
        where: { lease_id },
        data: updates,
      });

      // Delete existing bills
      const deletedBills = await tx.billing_records.deleteMany({
        where: { lease_id },
      });

      // Generate new bills
      const newBills = await generateLeaseBillsInTx(tx, {
        ...updatedLease,
        annualMainPayment,
      });

      return { updatedLease, deletedBills, newBills };
    });

    // Create audit log only if there were actual changes
    if (Object.keys(changesForAudit).length > 0) {
      await prisma.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.UPDATE,
          entity_type: 'lease_agreements',
          entity_id: lease_id,
          changes: {
            action: 'update_lease',
            changed_fields: changesForAudit,
            bills: {
              deleted_count: result.deletedBills.count,
              created_count: result.newBills.length
            },
            actor_id: actor?.user_id,
            actor_role: actor?.role,
            actor_username: actor?.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: (req as any).ip || req.socket.remoteAddress,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lease agreement updated successfully",
      data: {
        lease: result.updatedLease,
        bills: {
          deleted: result.deletedBills.count,
          created: result.newBills.length,
          new_bills: result.newBills,
        },
      },
    });
  } catch (error: any) {
    console.error("Error updating lease:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Lease agreement not found",
      });
    }

    if (
      error.message?.includes("Invalid date") ||
      error.message?.includes("Invalid number")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update lease agreement",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const deleteLease = async (req: Request<{ lease_id: string }>, res: Response) => {
  const { lease_id } = req.params;
  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    // Get current lease data for audit log
    const existingLease = await prisma.lease_agreements.findUnique({
      where: { 
        lease_id,
        is_deleted: false 
      },
    });

    if (!existingLease) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lease not found' 
      });
    }

    // Check if there are active bills
    const activeBills = await prisma.billing_records.count({
      where: {
        lease_id,
        is_deleted: false,
        payment_status: {
          in: ['UNPAID', 'OVERDUE']
        }
      }
    });

    if (activeBills > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete lease with ${activeBills} unpaid or overdue bill(s)`
      });
    }

    const deletedLease = await prisma.lease_agreements.update({
      where: { lease_id },
      data: { 
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
        status: 'EXPIRED' // Optionally update status
      },
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        user_id: actor?.user_id || null,
        action_type: AuditAction.DELETE,
        entity_type: 'lease_agreements',
        entity_id: lease_id,
        changes: {
          action: 'soft_delete_lease',
          upin: existingLease.upin,
          lease_period_years: existingLease.lease_period_years,
          total_lease_amount: existingLease.total_lease_amount,
          active_bills_at_deletion: activeBills,
          actor_id: actor?.user_id,
          actor_role: actor?.role,
          actor_username: actor?.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Lease agreement soft deleted successfully',
      data: { 
        lease_id,
        deleted_at: deletedLease.deleted_at,
        is_deleted: deletedLease.is_deleted,
        status: deletedLease.status
      },
    });
  } catch (error: any) {
    console.error('Delete lease error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Lease not found' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete lease',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};





























