// src/controllers/leaseController.ts
import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';
import type { Prisma } from "@prisma/client";

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
  const totalLeaseAmount = parseFloat(lease.total_lease_amount.toString());
  const paymentTermYears = lease.payment_term_years;
  const annualMainPayment = Number(
    lease.annualMainPayment ?? lease.annual_installment ?? 0
  );

  let remainingAmount = totalLeaseAmount - downPayment;
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
  } = req.body;

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

    // 2. Expiry date from start_date + lease_period_years
    const startDate = new Date(start_date);
    const expiryDate = new Date(startDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + lease_period_years);

    // 3. Calculate principal and annual main payment
    const totalLeaseAmountNum = Number(total_lease_amount ?? 0);
    const downPaymentNum = Number(down_payment_amount ?? 0);
    const principal = totalLeaseAmountNum - downPaymentNum;

    if (principal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Down payment must be less than total lease amount",
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create lease agreement",
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
    }

    const principal =
      Number(totalLeaseAmount ?? 0) - Number(downPaymentAmount ?? 0);
    if (principal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Down payment must be less than total lease amount",
      });
    }

    const annualMainPayment =
      paymentTermYears > 0 ? principal / paymentTermYears : 0;
    updates.annual_installment = annualMainPayment;

    const result = await prisma.$transaction(async (tx) => {
      const updatedLease = await tx.lease_agreements.update({
        where: { lease_id },
        data: updates,
      });

      await tx.billing_records.deleteMany({
        where: { lease_id },
      });

      const newBills = await generateLeaseBillsInTx(tx, {
        ...updatedLease,
        annualMainPayment,
      });

      return { updatedLease, newBills };
    });

    return res.status(200).json({
      success: true,
      message: "Lease agreement updated successfully",
      data: {
        lease: result.updatedLease,
        bills_created: result.newBills.length,
        bills: result.newBills,
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
    });
  }
};












export const deleteLease = async (req: Request<{ lease_id: string }>, res: Response) => {
  try {
    const { lease_id } = req.params;

    await prisma.lease_agreements.update({
      where: { lease_id },
      data: { updated_at: new Date() }, // Soft delete
    });

    return res.status(200).json({
      success: true,
      message: 'Lease agreement marked as deleted',
      data: { lease_id },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Lease not found' });
    }
    return res.status(500).json({ success: false, message: 'Failed to delete lease' });
  }
};






























