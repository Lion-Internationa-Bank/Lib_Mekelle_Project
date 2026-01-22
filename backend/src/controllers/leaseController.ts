// src/controllers/leaseController.ts
import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';

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

   // 1. Check if land parcel exists
    const landParcel = await prisma.land_parcels.findUnique({
      where: { upin },
    });

    if (!landParcel) {
      return res.status(404).json({
        success: false,
        message: 'Land parcel not found',
      });
    }

  try {
    // Calculate expiry date based on start_date + lease_period_years
    const startDate = new Date(start_date);
    const expiryDate = new Date(startDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + lease_period_years);

    // 1. Create the lease agreement
    const lease = await prisma.lease_agreements.create({
      data: {
        upin,
        annual_lease_fee,
        annual_installment,
        total_lease_amount,
        contract_date: new Date(contract_date),
        down_payment_amount,
        lease_period_years,
        legal_framework,
        payment_term_years,
        price_per_m2,
        start_date: startDate,
        expiry_date: expiryDate, // Add calculated expiry date
      },
    });

    // 2. Calculate billing schedule
    const bills = await generateLeaseBills(lease);

    return res.status(201).json({
      success: true,
      data: {
        lease_id: lease.lease_id,
        lease: {
          ...lease,
          expiry_date: expiryDate, // Include in response
        },
        bills_created: bills.length,
        bills,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create lease agreement',
    });
  }
};


// Helper function to generate lease bills
const generateLeaseBills = async (lease: any) => {
  try {
    // Get the current active lease interest rate
    const rateConfig = await prisma.rate_configurations.findFirst({
      where: {
        rate_type: 'LEASE_INTEREST_RATE',
        is_active: true,
        effective_from: { lte: new Date() },
        OR: [
          { effective_until: { gte: new Date() } },
          { effective_until: null }
        ]
      },
      orderBy: { effective_from: 'desc' }
    });

    if (!rateConfig) {
      throw new Error('No active lease interest rate configuration found');
    }

    const interestRate = parseFloat(rateConfig.value.toString());
    
    // Convert to numbers safely
    const downPayment = parseFloat(lease.down_payment_amount.toString());
    const totalLeaseAmount = parseFloat(lease.total_lease_amount.toString());
    const paymentTermYears = lease.payment_term_years;
    
    console.log('DEBUG - Calculation inputs:', {
      interestRate,
      downPayment,
      totalLeaseAmount,
      paymentTermYears,
      remainingAmount: totalLeaseAmount - downPayment
    });
    
    // Calculate remaining amount after down payment
    let remainingAmount = totalLeaseAmount - downPayment;
    
    // Validate calculations
    if (remainingAmount <= 0) {
      throw new Error('Down payment must be less than total lease amount');
    }
    
    const annualMainPayment = remainingAmount / paymentTermYears;
    
    console.log('DEBUG - Annual payment:', {
      annualMainPayment,
      maxAllowed: 999999999999999.99
    });
    
    // Check if annualMainPayment exceeds limit
    if (annualMainPayment > 999999999999999.99) {
      throw new Error(`Annual main payment ${annualMainPayment} exceeds database limit of 999,999,999,999,999.99`);
    }
    
    const bills = [];
    const startDate = new Date(lease.start_date);
    
    // Generate bills for each payment term year (starting from start_date + 1 year)
    for (let year = 1; year <= paymentTermYears; year++) {
      // Calculate due date (start_date + 1 year, then +1 year for each subsequent bill)
      const dueDate = new Date(startDate);
      dueDate.setFullYear(dueDate.getFullYear() + year);
      
      // Calculate interest for this year - round to 2 decimal places
      const interest = parseFloat((remainingAmount * interestRate).toFixed(2));
      const totalAnnualPayment = parseFloat((annualMainPayment + interest).toFixed(2));
      
      console.log(`DEBUG - Year ${year}:`, {
        remainingAmount,
        interest,
        totalAnnualPayment,
        maxAllowed: 999999999999999.99
      });
      
      // Validate values don't exceed database limits
      if (totalAnnualPayment > 999999999999999.99) {
        throw new Error(`Calculated annual payment ${totalAnnualPayment} exceeds database limit of 999,999,999,999,999.99`);
      }
      
      if (interest > 999999999999999.99) {
        throw new Error(`Calculated interest ${interest} exceeds database limit of 999,999,999,999,999.99`);
      }
      
      // Create bill for this year - use Prisma Decimal type
      const bill = await prisma.billing_records.create({
        data: {
          upin: lease.upin,
          lease_id: lease.lease_id,
          fiscal_year: dueDate.getFullYear(),
          bill_type: 'LEASE',
          amount_due: totalAnnualPayment,
          penalty_amount: 0,
          interest_amount: interest,
          payment_status: 'UNPAID',
          due_date: dueDate,
          interest_rate_used: interestRate,
          penalty_rate_used: 0,
          sync_status: 'PENDING',
          installment_number: year,
        }
      });
      
      bills.push(bill);
      
      // Update remaining amount for next year - round to 2 decimal places
      remainingAmount = parseFloat((remainingAmount - annualMainPayment).toFixed(2));
      
      // Ensure remaining amount doesn't go below 0 due to rounding
      if (remainingAmount < 0) {
        remainingAmount = 0;
      }
    }

    return bills;
  } catch (error) {
    console.error('Error generating lease bills:', error);
    throw error;
  }
};

export const updateLease = async (req: Request<{ lease_id: string }>, res: Response) => {
  try {
    console.log("Lease update started");

    const { lease_id } = req.params;
    const data = req.body;

    // Define which fields are allowed to be updated
    const allowedUpdates = {
      annual_lease_fee: true,
      total_lease_amount: true,
      down_payment_amount: true,
      annual_installment: true,
      price_per_m2: true,
      lease_period_years: true,
      payment_term_years: true,
      legal_framework: true,
      // Date fields — will be converted below
      start_date: true,
      expiry_date: true,
      contract_date: true, // if you allow updating this
    } as const;

    const updates: any = {};

    Object.keys(data).forEach((key) => {
      if (allowedUpdates[key as keyof typeof allowedUpdates]) {
        let value = data[key];

        // Special handling for date fields
        if (['start_date', 'expiry_date', 'contract_date'].includes(key)) {
          if (typeof value === 'string') {
            const parsedDate = new Date(value);
            // Validate it's a real date
            if (isNaN(parsedDate.getTime())) {
              throw new Error(`Invalid date format for ${key}: ${value}`);
            }
            value = parsedDate;
          } else if (!(value instanceof Date)) {
            throw new Error(`Invalid date type for ${key}`);
          }
        }

        // Convert numbers from string if needed (common from form data)
        if ([
          'annual_lease_fee',
          'total_lease_amount',
          'down_payment_amount',
          'annual_installment',
          'price_per_m2',
          'lease_period_years',
          'payment_term_years',
        ].includes(key) && typeof value === 'string') {
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
        message: 'No valid fields provided for update',
      });
    }

    const lease = await prisma.lease_agreements.update({
      where: { lease_id },
      data: updates,
    });

    return res.status(200).json({
      success: true,
      message: 'Lease agreement updated successfully',
      data: lease,
    });
  } catch (error: any) {
    console.error('Error updating lease:', error);

    // Prisma record not found
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Lease agreement not found',
      });
    }

    // Validation errors (invalid date, etc.)
    if (error.message.includes('Invalid date') || error.message.includes('Invalid number')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update lease agreement',
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






























