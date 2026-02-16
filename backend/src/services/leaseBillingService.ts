// src/services/leaseBillingService.ts
import prisma from '../config/prisma.ts';

// Types
type PrismaClientType = typeof prisma;
type PrismaTransactionType = Parameters<Parameters<PrismaClientType['$transaction']>[0]>[0];

export interface LeaseWithDetails {
  lease_id: number;
  upin: string;
  total_lease_amount: number | string;
  down_payment_amount: number | string;
  other_payment?: number | string;
  payment_term_years: number;
  start_date: Date | string;
  annualMainPayment?: number;
  annual_installment?: number;
}

export interface GeneratedBill {
  billing_record_id: number;
  upin: string;
  lease_id: number;
  fiscal_year: number;
  bill_type: string;
  amount_due: number;
  amount_paid: number;
  penalty_amount: number;
  interest_amount: number;
  base_payment: number;
  payment_status: string;
  due_date: Date;
  interest_rate_used: number;
  penalty_rate_used: number;
  sync_status: string;
  installment_number: number;
  remaining_amount: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Generate lease bills for a new lease
 * @param tx - Prisma transaction or client
 * @param lease - Lease agreement data
 * @returns Array of generated billing records
 */
export const generateLeaseBillsInTx = async (
  tx: PrismaTransactionType | PrismaClientType,
  lease: LeaseWithDetails
): Promise<GeneratedBill[]> => {
  try {
    // Cast to any to avoid type errors with transaction client
    const prismaClient = tx as any;

    // Get active lease interest rate
    // const rateConfig = await prismaClient.rate_configurations.findFirst({
    //   where: {
    //     rate_type: "LEASE_INTEREST_RATE",
    //     is_active: true,
    //     effective_from: { lte: new Date() },
    //     OR: [
    //       { effective_until: { gte: new Date() } },
    //       { effective_until: null },
    //     ],
    //   },
    //   orderBy: { effective_from: "desc" },
    // });

    // if (!rateConfig) {
    //   throw new Error("No active lease interest rate configuration found");
    // }

    // const interestRate = parseFloat(rateConfig.value.toString());
    const downPayment = parseFloat(lease.down_payment_amount.toString());
    const totalLeaseAmount = parseFloat(lease.total_lease_amount.toString());
    const paymentTermYears = lease.payment_term_years;
    const annualMainPayment = Number(
      lease.annualMainPayment ?? lease.annual_installment ?? 0
    );

    // Calculate principal (only subtract down payment)
    let remainingAmount = totalLeaseAmount - downPayment;
    if (remainingAmount <= 0) {
      throw new Error("Down payment must be less than total lease amount");
    }

    if (paymentTermYears <= 0) {
      throw new Error("Payment term years must be greater than 0");
    }

    const bills: GeneratedBill[] = [];
    const startDate = new Date(lease.start_date);

    for (let year = 1; year <= paymentTermYears; year++) {
      const dueDate = new Date(startDate);
      dueDate.setFullYear(dueDate.getFullYear() + year);

      // const interest = parseFloat(
      //   (remainingAmount * interestRate).toFixed(2)
      // );
      const totalAnnualPayment = parseFloat(
        (annualMainPayment).toFixed(2)
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
          interest_amount: 0,
          base_payment: annualMainPayment,
          payment_status: "UNPAID",
          due_date: dueDate,
          // interest_rate_used: interestRate,
          penalty_rate_used: 0,
          sync_status: "PENDING",
          installment_number: year,
          remaining_amount: remainingAmount,
          created_at: new Date(),
          updated_at: new Date()
        },
      });

      bills.push(bill as GeneratedBill);

      remainingAmount = parseFloat(
        (remainingAmount - annualMainPayment).toFixed(2)
      );
      if (remainingAmount < 0) remainingAmount = 0;
    }

    return bills;
  } catch (error) {
    console.error('Generate lease bills error:', error);
    throw error;
  }
};

/**
 * Regenerate bills for an existing lease (useful for updates)
 * @param tx - Prisma transaction or client
 * @param lease - Lease agreement data
 * @param deleteExisting - Whether to delete existing bills first (default: true)
 * @returns Array of generated billing records
 */
export const regenerateLeaseBillsInTx = async (
  tx: PrismaTransactionType | PrismaClientType,
  lease: LeaseWithDetails,
  deleteExisting: boolean = true
): Promise<GeneratedBill[]> => {
  try {
    const prismaClient = tx as any;

    // Delete existing bills if requested
    if (deleteExisting) {
      await prismaClient.billing_records.deleteMany({
        where: {
          lease_id: lease.lease_id,
          bill_type: "LEASE"
        }
      });
    }

    // Generate new bills
    return await generateLeaseBillsInTx(tx, lease);
  } catch (error) {
    console.error('Regenerate lease bills error:', error);
    throw error;
  }
};

/**
 * Generate lease bills using global prisma client (for non-transactional operations)
 * @param lease - Lease agreement data
 * @returns Array of generated billing records
 */
export const generateLeaseBills = async (
  lease: LeaseWithDetails
): Promise<GeneratedBill[]> => {
  return generateLeaseBillsInTx(prisma, lease);
};

/**
 * Calculate lease payment details
 * @param totalLeaseAmount - Total lease amount
 * @param downPaymentAmount - Down payment amount
 * @param paymentTermYears - Payment term in years
 * @returns Object with principal and annual installment
 */
export const calculateLeasePaymentDetails = (
  totalLeaseAmount: number,
  downPaymentAmount: number,
  paymentTermYears: number
): { principal: number; annualInstallment: number } => {
  const principal = totalLeaseAmount - downPaymentAmount;
  
  if (principal <= 0) {
    throw new Error("Down payment must be less than total lease amount");
  }

  const annualInstallment = paymentTermYears > 0 
    ? parseFloat((principal / paymentTermYears).toFixed(2))
    : 0;

  return { principal, annualInstallment };
};

/**
 * Validate lease data before bill generation
 * @param lease - Lease agreement data
 * @throws Error if validation fails
 */
export const validateLeaseForBilling = (lease: LeaseWithDetails): void => {
  const totalLeaseAmount = parseFloat(lease.total_lease_amount.toString());
  const downPaymentAmount = parseFloat(lease.down_payment_amount.toString());
  
  if (totalLeaseAmount <= 0) {
    throw new Error("Total lease amount must be greater than 0");
  }

  if (downPaymentAmount < 0) {
    throw new Error("Down payment cannot be negative");
  }

  if (downPaymentAmount >= totalLeaseAmount) {
    throw new Error("Down payment must be less than total lease amount");
  }

  if (!lease.payment_term_years || lease.payment_term_years <= 0) {
    throw new Error("Payment term years must be greater than 0");
  }

  if (!lease.start_date) {
    throw new Error("Start date is required");
  }
};