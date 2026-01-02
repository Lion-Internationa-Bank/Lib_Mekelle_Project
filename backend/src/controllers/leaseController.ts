// src/controllers/leaseController.ts
import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';

export const createLease = async (req: Request, res: Response) => {
  const {
    upin,
    annual_lease_fee,
    total_lease_amount,
    annual_installment,
    contract_date,
    down_payment_amount,
    lease_period_years,
    legal_framework,
    payment_term_years,
    price_per_m2,
    start_date,
    expiry_date,
  } = req.body;

  try {
    const lease = await prisma.lease_agreements.create({
      data: {
        upin,
        annual_lease_fee,
        annual_installment,
        total_lease_amount,
        contract_date:new Date(contract_date),
        down_payment_amount,
        lease_period_years,
        legal_framework,
        payment_term_years,
        price_per_m2,
        start_date: new Date(start_date),
        expiry_date: new Date(expiry_date),
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        lease_id: lease.lease_id,
        lease,
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































// import express from 'express';
// import { LeaseService } from '../services/leaseService.ts';

// export class LeaseController {
// static async createLeaseForParcel(
//     req: express.Request,
//     res: express.Response
//   ) {
//     try {
//       const upin = req.params.upin;
//       if (!upin) {
//         return res.status(400).json({
//           success: false,
//           message: 'upin is required',
//         });
//       }

//       const file = (req as any).file as Express.Multer.File | undefined;

//       const {
//         lease_period_years,
//         price_per_m2,
//         total_lease_value,
//         down_payment_amount,
//         annual_installment,
//         payment_term_years,
//         contract_date,
//         legal_framework,
//         start_date,
//         end_date,
//         holder_full_name,
//         holder_identity_type,
//         holder_identity_number,
//         holder_contact_phone,
//         holder_email,
//         holder_address,
//         document_type,
//       } = req.body;

//       const lease = await LeaseService.createLeaseForParcel(upin, {
//         lease_period_years,
//         price_per_m2,
//         total_lease_value,
//         down_payment_amount,
//         annual_installment,
//         payment_term_years,
//         contract_date,
//         legal_framework,
//         start_date,
//         end_date,
//         holder_full_name,
//         holder_identity_type,
//         holder_identity_number,
//         holder_contact_phone,
//         holder_email,
//         holder_address,
//         // document info from uploaded file
//         document_type,
//         document_file_name: file ? file.filename : undefined,
//         document_file_path: file ? file.destination : undefined,
//         document_file_size_kb: file ? Math.round(file.size / 1024) : undefined,
//       });

//       return res.status(201).json({
//         success: true,
//         message: 'Lease created successfully',
//         data: lease,
//       });
//     } catch (error: any) {
//       console.error('Create lease error:', error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error',
//       });
//     }
//   }

//   static async getLease(req: express.Request, res: express.Response) {
//     try {
//       const upin = req.params.upin;
//       const leaseId = req.params.lease_id;

//       if (!upin || !leaseId) {
//         return res.status(400).json({
//           success: false,
//           message: 'upin and lease_id are required',
//         });
//       }

//       const lease = await LeaseService.getLease(upin, leaseId);

//       if (!lease) {
//         return res.status(404).json({
//           success: false,
//           message: 'Lease not found',
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: 'Lease fetched successfully',
//         data: lease,
//       });
//     } catch (error: any) {
//       console.error('Get lease error:', error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error',
//       });
//     }
//   }

//   static async updateLease(req: express.Request, res: express.Response) {
//     try {
//       const upin = req.params.upin;
//       const leaseId = req.params.lease_id;

//       if (!upin || !leaseId) {
//         return res.status(400).json({
//           success: false,
//           message: 'upin and lease_id are required',
//         });
//       }

//       const updated = await LeaseService.updateLease(upin, leaseId, req.body);

//       if (!updated) {
//         return res.status(404).json({
//           success: false,
//           message: 'Lease not found',
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: 'Lease updated successfully',
//         data: updated,
//       });
//     } catch (error: any) {
//       console.error('Update lease error:', error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error',
//       });
//     }
//   }

//   static async getLeaseHistory(req: express.Request, res: express.Response) {
//     try {
//       const upin = req.params.upin;
//       const leaseId = req.params.lease_id;

//       if (!upin || !leaseId) {
//         return res.status(400).json({
//           success: false,
//           message: 'upin and lease_id are required',
//         });
//       }

//       const history = await LeaseService.getLeaseHistory(upin, leaseId);

//       return res.status(200).json({
//         success: true,
//         message: 'Lease history fetched successfully',
//         data: history,
//       });
//     } catch (error: any) {
//       console.error('Get lease history error:', error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error',
//       });
//     }
//   }
// }
