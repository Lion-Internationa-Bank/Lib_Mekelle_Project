// src/controllers/parcelController.ts

import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';

interface GetParcelsQuery {
  page?: string;
  limit?: string;
  search?: string;
  sub_city?: string;
  ketena?: string;
 land_use?: string;
  tenure_type?: string;
}

interface TransferOwnershipBody {
  from_owner_id?: string;      // optional: retiring existing owner
  to_owner_id: string;         // new/existing owner UUID
  to_share_ratio: number;      // e.g. 1.0 for full, 0.5 for half
  transfer_type: 'SALE' | 'GIFT' | 'HEREDITY' | 'CONVERSION';
  transfer_price?: number;     // optional for sale
  reference_no?: string;       // contract/doc number
  document_id?: string;        // optional linked document
}

interface CreateEncumbranceBody {
  upin: string;
  type: 'MORTGAGE' | 'COURT_FREEZE' | 'GOVT_RESERVATION';
  issuing_entity: string;
  reference_number?: string;
  status?: 'ACTIVE' | 'RELEASED';
  registration_date?: string;
}

interface UpdateEncumbranceBody {
  type?: 'MORTGAGE' | 'COURT_FREEZE' | 'GOVT_RESERVATION';
  issuing_entity?: string;
  reference_number?: string;
  status?: 'ACTIVE' | 'RELEASED';
  registration_date?: string;
}

export const createParcel = async (req: Request, res: Response) => {
  try {
    const {
      upin,           
      file_number,
      sub_city,
      tabia,
      ketena,
      block,
      total_area_m2,
      land_use,
      land_grade,
      tenure_type,      
      geometry_data,
    } = req.body;

    const parcel = await prisma.land_parcels.create({
      data: {
        upin, // or generate UPIN here
       file_number,
        sub_city,
        tabia,
        ketena,
        block,
        total_area_m2,
        land_use,
        land_grade,
        tenure_type,
        geometry_data,
       
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        upin: parcel.upin,
        sub_city: parcel.sub_city,
       
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create parcel',
    });
  }
};

export const getParcels = async (req: Request<{}, {}, {}, GetParcelsQuery>, res: Response) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    const { search, sub_city, tenure_type, ketena, land_use } = req.query;

    const where: any = {
      is_deleted: false,
      OR: search
        ? [
            { upin: { contains: search, mode: 'insensitive' } },
            { file_number: { contains: search, mode: 'insensitive' } },
            { sub_city: { contains: search, mode: 'insensitive' } },
            { ketena: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
      ...(sub_city && { sub_city }),
      ...(ketena && { ketena }),
      ...(tenure_type && { tenure_type }),
      ...(land_use && { land_use }),
    };

    const [parcels, total] = await Promise.all([
      prisma.land_parcels.findMany({
        where,
        skip,
        take: limit,
        include: {
          // Active owners with names
          owners: {
            where: { is_active: true, is_deleted: false },
            include: {
              owner: {
                select: { owner_id: true, full_name: true },
              },
            },
          },
          // Count only ACTIVE encumbrances
          _count: {
            select: {
              encumbrances: {
                where: {
                  is_deleted: false,
                  status: 'ACTIVE', // ← Only count ACTIVE ones
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.land_parcels.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        parcels: parcels.map((parcel) => ({
          upin: parcel.upin,
          file_number: parcel.file_number,
          sub_city: parcel.sub_city,
          ketena: parcel.ketena,
          total_area_m2: parcel.total_area_m2,
          land_use: parcel.land_use,
          tenure_type: parcel.tenure_type,
          // Correct status: Encumbered only if there's at least one ACTIVE encumbrance
          encumbrance_status: parcel._count.encumbrances > 0 ? 'Encumbered' : 'Clear',
          owners: parcel.owners.map((po) => po.owner.full_name).join(', '),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Fetch parcels error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch parcels',
    });
  }
};

export const getParcelByUpin = async (
  req: Request<{ upin: string }>,
  res: Response
) => {
  try {
    const { upin } = req.params;

    const parcel = await prisma.land_parcels.findUnique({
      where: { upin, is_deleted: false },
      select: {
        // Core info
        upin: true,
        file_number: true,
        sub_city: true,
        tabia: true,
        ketena: true,
        block: true,
        total_area_m2: true,
        land_use: true,
        land_grade: true,
        tenure_type: true,
        geometry_data: true,
        created_at: true,
        updated_at: true,

        // Active owners + their documents
        owners: {
          where: { is_active: true, is_deleted: false },
          select: {
            parcel_owner_id: true,
            share_ratio: true,
            acquired_at: true,
            owner: {
              select: {
                owner_id: true,
                full_name: true,
                national_id: true,
                tin_number: true,
                phone_number: true,
                documents: {
                  select: {
                    doc_id: true,
                    doc_type: true,
                    file_url: true,
                    file_name: true,
                    upload_date: true,
                    is_verified: true,
                  },
                  orderBy: { upload_date: "desc" },
                },
              },
            },
          },
          orderBy: { share_ratio: "desc" },
        },

        // Lease
        lease_agreement: {
          select: {
            lease_id: true,
            annual_lease_fee: true,
            total_lease_amount: true,
            down_payment_amount: true,
            annual_installment: true,
            price_per_m2: true,
            lease_period_years: true,
            payment_term_years: true,
            start_date: true,
            expiry_date: true,
            contract_date: true,
            legal_framework: true,
            documents: {
              select: { doc_id: true, doc_type: true, file_url: true, file_name: true, upload_date: true, is_verified: true },
              orderBy: { upload_date: "desc" },
            },
          },
        },

        // Buildings
        buildings: {
          where: { is_deleted: false },
          select: { building_id: true, usage_type: true, total_area: true, floor_count: true },
          orderBy: { created_at: "desc" },
        },

        // Encumbrances
        encumbrances: {
          where: { is_deleted: false },
          select: {
            encumbrance_id: true,
            type: true,
            issuing_entity: true,
            reference_number: true,
            status: true,
            registration_date: true,
            documents: {
              select: { doc_id: true, doc_type: true, file_url: true, file_name: true, upload_date: true, is_verified: true },
              orderBy: { upload_date: "desc" },
            },
          },
          orderBy: { registration_date: "desc" },
        },

        // Transfer History — now with owner names via relations!
        history: {
          where: { is_deleted: false },
          select: {
            history_id: true,
            transfer_type: true,
            transfer_date: true,
            transfer_price: true,
            reference_no: true,
            event_snapshot: true,
            documents: {
              select: { doc_id: true, doc_type: true, file_url: true, file_name: true, upload_date: true, is_verified: true },
              orderBy: { upload_date: "desc" },
            },
            from_owner: { select: { full_name: true } },
            to_owner: { select: { full_name: true } },
          },
          orderBy: { transfer_date: "desc" },
        },

        // Parcel-level documents
        documents: {
          where: { owner_id: null, lease_id: null, encumbrance_id: null, history_id: null },
          select: { doc_id: true, doc_type: true, file_url: true, file_name: true, upload_date: true, is_verified: true },
          orderBy: { upload_date: "desc" },
        },

        // Billing
        billing_records: {
          where: { is_deleted: false },
          select: {
            bill_id: true,
            fiscal_year: true,
            bill_type: true,
            amount_due: true,
            amount_paid: true,
            penalty_amount: true,
            payment_status: true,
            transactions: {
              where: { is_deleted: false },
              select: { transaction_id: true, revenue_type: true, receipt_serial_no: true, amount_paid: true, payment_date: true },
              orderBy: { payment_date: "desc" },
            },
          },
          orderBy: { fiscal_year: "desc" },
        },
      },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found or has been deleted",
      });
    }

    // Transform history to add clean name fields
    const enrichedHistory = parcel.history.map((entry) => ({
      ...entry,
      from_owner_name: entry.from_owner?.full_name ?? "Original/Old Possession",
      to_owner_name: entry.to_owner?.full_name ?? "Unknown",
      // Optional: remove nested objects if you don't want them in frontend
      from_owner: undefined,
      to_owner: undefined,
    }));

    // Group billing by type
    const billing_summary = parcel.billing_records.reduce((acc, bill) => {
      const type = bill.bill_type;
      acc[type] ??= [];
      acc[type].push(bill);
      return acc;
    }, {} as Record<string, typeof parcel.billing_records>);

    return res.status(200).json({
      success: true,
      data: {
        ...parcel,
        history: enrichedHistory,
        billing_summary,
      },
    });
  } catch (error) {
    console.error("Error fetching parcel:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch parcel details",
    });
  }
};
// UPDATE LAND PARCEL
export const updateParcel = async (req: Request<{ upin: string }>, res: Response) => {
  try {
    const { upin } = req.params;
    const data = req.body;

    // Validate required fields
    const allowedUpdates = {
      file_number: true,
      sub_city: true,
      tabia: true,
      ketena: true,
      block: true,
      total_area_m2: true,
      land_use: true,
      land_grade: true,
      tenure_type: true,
      geometry_data: true,
    };

    const updates: any = {};
    Object.keys(data).forEach(key => {
      if (allowedUpdates[key as keyof typeof allowedUpdates]) {
        updates[key] = data[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    const parcel = await prisma.land_parcels.update({
      where: { upin },
      data: updates,
    });

    return res.status(200).json({
      success: true,
      message: 'Parcel updated successfully',
      data: parcel,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update parcel' });
  }
};

// SOFT DELETE LAND PARCEL (set flag or mark inactive)
export const deleteParcel = async (req: Request<{ upin: string }>, res: Response) => {
  try {
    const { upin } = req.params;

    // Check if parcel has active owners
    const activeOwners = await prisma.parcel_owners.count({
      where: { upin, is_active: true },
    });

    if (activeOwners > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parcel with active owners',
      });
    }

    // Soft delete - update timestamp or add deleted_at field
    await prisma.land_parcels.update({
      where: { upin },
      data: { updated_at: new Date() }, // Or add deleted_at field
    });

    return res.status(200).json({
      success: true,
      message: 'Parcel marked as deleted',
      data: { upin },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }
    return res.status(500).json({ success: false, message: 'Failed to delete parcel' });
  }
};

export const transferOwnership = async (
  req: Request<{ upin: string }, {}, TransferOwnershipBody>,
  res: Response
) => {
  try {
    const { upin } = req.params;
    const {
      from_owner_id,
      to_owner_id,
      to_share_ratio,
      transfer_type,
      transfer_price,
      reference_no,
    } = req.body;

    // === Basic validations ===
    if (!to_owner_id || !to_share_ratio || !transfer_type) {
      return res.status(400).json({
        success: false,
        message: "to_owner_id, to_share_ratio, and transfer_type are required.",
      });
    }

    if (from_owner_id && from_owner_id === to_owner_id) {
      return res.status(400).json({
        success: false,
        message: "Self-transfer is not allowed. From and To owner cannot be the same person.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current active owners with relations
      const activeOwners = await tx.parcel_owners.findMany({
        where: {
          upin,
          is_active: true,
          is_deleted: false,
        },
        include: {
          owner: {
            select: { owner_id: true, full_name: true },
          },
        },
      });

      if (activeOwners.length === 0) {
        throw new Error("NO_ACTIVE_OWNERS");
      }

      // 2. Validate FROM owner (if specified)
      let fromOwnerRecord = null;
      let fromOwnerShare = 0;

      if (from_owner_id) {
        fromOwnerRecord = activeOwners.find((po) => po.owner_id === from_owner_id);
        if (!fromOwnerRecord) {
          throw new Error("FROM_OWNER_NOT_ACTIVE");
        }
        fromOwnerShare = Number(fromOwnerRecord.share_ratio);

        if (Number(to_share_ratio) > fromOwnerShare) {
          throw new Error("TO_SHARE_EXCEEDS_FROM_OWNER");
        }
      }

      // 3. Check if TO owner already exists
      const existingToOwnerRecord = activeOwners.find((po) => po.owner_id === to_owner_id);

      // 4. Calculate new total shares
      const currentTotal = activeOwners.reduce((sum, po) => sum + Number(po.share_ratio), 0);
      let newTotal = currentTotal;

      if (from_owner_id && fromOwnerRecord) {
        newTotal -= fromOwnerShare; // deduct transferred amount
      }
      newTotal += Number(to_share_ratio);

      if (newTotal > 1.000001) {
        throw new Error("SHARE_RATIO_EXCEEDED");
      }

      // 5. Create event snapshot
      const snapshot = {
        timestamp: new Date().toISOString(),
        previous_total: currentTotal,
        final_total: newTotal,
        owners_before: activeOwners.map((po) => ({
          id: po.owner_id,
          name: po.owner.full_name,
          share: Number(po.share_ratio),
        })),
      };

      // 6. Perform updates
      const updates: Promise<any>[] = [];

      // Update tenure to LEASE unless it's heredity
      if (transfer_type !== "HEREDITY") {
        updates.push(
          tx.land_parcels.update({
            where: { upin },
            data: { tenure_type: "LEASE" },
          })
        );
      }

      // Handle FROM owner
      if (from_owner_id && fromOwnerRecord) {
        const remainingShare = fromOwnerShare - Number(to_share_ratio);

        if (remainingShare <= 0.000001) {
          // Full transfer → retire the owner
          updates.push(
            tx.parcel_owners.update({
              where: { parcel_owner_id: fromOwnerRecord.parcel_owner_id },
              data: {
                is_active: false,
                retired_at: new Date(),
              },
            })
          );
        } else {
          // Partial transfer → reduce share
          updates.push(
            tx.parcel_owners.update({
              where: { parcel_owner_id: fromOwnerRecord.parcel_owner_id },
              data: {
                share_ratio: remainingShare,
              },
            })
          );
        }
      }

      // Handle TO owner
      if (existingToOwnerRecord) {
        // Add to existing share
        const newShare = Number(existingToOwnerRecord.share_ratio) + Number(to_share_ratio);

        updates.push(
          tx.parcel_owners.update({
            where: { parcel_owner_id: existingToOwnerRecord.parcel_owner_id },
            data: {
              share_ratio: newShare,
              acquired_at: new Date(), // update acquisition on increase
            },
          })
        );
      } else {
        // Create new ownership record
        updates.push(
          tx.parcel_owners.create({
            data: {
              upin,
              owner_id: to_owner_id,
              share_ratio: to_share_ratio,
              acquired_at: new Date(),
              is_active: true,
            },
          })
        );
      }

      await Promise.all(updates);

      // 7. Record transfer in history (with proper relations)
      const historyEntry = await tx.ownership_history.create({
        data: {
          upin,
          transfer_type,
          transfer_date: new Date(),
          transfer_price: transfer_price ? Number(transfer_price) : null,
          reference_no: reference_no || null,
          from_owner_id: from_owner_id || null,
          to_owner_id: to_owner_id,
          event_snapshot: snapshot as any, // Prisma accepts Json
        },
        include: {
          from_owner: { select: { full_name: true } },
          to_owner: { select: { full_name: true } },
        },
      });

      return {
        history: historyEntry,
        action: existingToOwnerRecord ? "ADDED_TO_EXISTING_OWNER" : "NEW_OWNER_CREATED",
        transfer_kind: fromOwnerShare <= Number(to_share_ratio) + 0.000001 ? "FULL" : "PARTIAL",
        final_total_shares: newTotal,
      };
    });

    return res.status(201).json({
      success: true,
      message: "Ownership transferred successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Transfer failed:", error);

    const errorMessages: Record<string, string> = {
      FROM_OWNER_NOT_ACTIVE: "The specified seller is not currently an active owner.",
      TO_SHARE_EXCEEDS_FROM_OWNER: "Cannot transfer more than the seller's current share.",
      SHARE_RATIO_EXCEEDED: "Total shares would exceed 100%.",
      NO_ACTIVE_OWNERS: "This parcel has no active owners.",
    };

    const message = errorMessages[error.message] || "Transfer failed due to an unexpected error.";

    return res.status(errorMessages[error.message] ? 400 : 500).json({
      success: false,
      message,
    });
  }
};
export const updateParcelOwnerShare = async (
  req: Request<{ parcel_owner_id: string }>, 
  res: Response
) => {
  // Declare in outer scope so it's accessible to the catch block
  let calculatedNewTotal: number | undefined;

  try {
    console.log("from update parcel owner share ")
    const { parcel_owner_id } = req.params;
    const { share_ratio } = req.body;
   console.log("from update parcel owner share ",share_ratio)
    // 1. VALIDATE INPUT
    if (share_ratio === undefined || share_ratio <= 0 || share_ratio > 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid share_ratio (0.0-1.0) required',
      });
    }

    // 2. ATOMIC TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // A. Find current record
      const currentRecord = await tx.parcel_owners.findUnique({
        where: { parcel_owner_id },
        select: {
          parcel_owner_id: true,
          upin: true,
          owner_id: true,
          share_ratio: true,
          is_active: true,
          is_deleted: true,
        },
      });

      if (!currentRecord) {
        throw new Error('PARCEL_OWNER_NOT_FOUND');
      }

      if (currentRecord.is_deleted) {
        throw new Error('PARCEL_OWNER_DELETED');
      }

      if (!currentRecord.is_active) {
        throw new Error('PARCEL_OWNER_INACTIVE');
      }

      // B. Calculate current total shares for this UPIN
      const activeOwners = await tx.parcel_owners.findMany({
        where: { 
          upin: currentRecord.upin, 
          is_active: true, 
          is_deleted: false 
        },
      });

      const currentTotal = activeOwners.reduce((sum, po) => sum + Number(po.share_ratio), 0);
      const oldShare = Number(currentRecord.share_ratio);
      
      // Update the outer variable for error reporting
      calculatedNewTotal = currentTotal - oldShare + Number(share_ratio);

      // C. VALIDATE total shares ≤ 1.0 (with small epsilon for floating point math)
      if (calculatedNewTotal > 1.000001) {
        throw new Error('SHARE_RATIO_EXCEEDED');
      }

      // D. Update share ratio
      const updatedRecord = await tx.parcel_owners.update({
        where: { parcel_owner_id },
        data: {
          share_ratio,
          updated_at: new Date(),
        },
      });

      return {
        record: updatedRecord,
        share_change: {
          parcel_owner_id,
          upin: currentRecord.upin,
          owner_id: currentRecord.owner_id,
          old_share: oldShare,
          new_share: Number(share_ratio),
          old_total: currentTotal,
          new_total: calculatedNewTotal.toFixed(6),
        },
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Share ratio updated successfully',
      data: result,
    });

  } catch (error: any) {
    console.error('Share update error:', error);
    
    const errorMap: Record<string, string> = {
      'PARCEL_OWNER_NOT_FOUND': 'Parcel owner record not found',
      'PARCEL_OWNER_DELETED': 'Parcel owner record is deleted',
      'PARCEL_OWNER_INACTIVE': 'Parcel owner record is inactive',
      'SHARE_RATIO_EXCEEDED': `New total shares (${calculatedNewTotal?.toFixed(4)}) would exceed 100%`,
    };

    const errorMessage = errorMap[error.message] || 'Failed to update share ratio';
    const statusCode = errorMap[error.message] ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};

// CREATE EN CUMBRANCE
export const createEncumbrance = async (
  req: Request<{}, {}, CreateEncumbranceBody>,
  res: Response
) => {
  try {
    const { upin, type, issuing_entity, reference_number, status, registration_date } = req.body;

    // Validate required fields
    if (!upin || !type || !issuing_entity) {
      return res.status(400).json({
        success: false,
        message: 'upin, type, and issuing_entity are required',
      });
    }

    // Verify parcel exists and is not deleted
    const parcel = await prisma.land_parcels.findFirst({
      where: { upin, is_deleted: false },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found or deleted',
      });
    }

    // Check reference number uniqueness (if provided)
    if (reference_number) {
      const existingRef = await prisma.encumbrances.findFirst({
        where: { reference_number, is_deleted: false },
      });
      if (existingRef) {
        return res.status(409).json({
          success: false,
          message: 'Reference number already exists',
        });
      }
    }

    const encumbrance = await prisma.encumbrances.create({
      data: {
        upin,
        type,
        issuing_entity,
        reference_number,
        status: status || 'ACTIVE',
        registration_date: registration_date ? new Date(registration_date) : new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Encumbrance created successfully',
      data: encumbrance,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Reference number already exists',
      });
    }
    console.error('Create encumbrance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create encumbrance',
    });
  }
};

// UPDATE EN CUMBRANCE
export const updateEncumbrance = async (
  req: Request<{ encumbrance_id: string }, {}, UpdateEncumbranceBody>,
  res: Response
) => {
  try {
    const { encumbrance_id } = req.params;
    const { type, issuing_entity, reference_number, status, registration_date } = req.body;

    // Validate at least one field to update
    if (!type && !issuing_entity && !reference_number && !status && !registration_date) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update',
      });
    }

    // Check reference number uniqueness (if changing)
    if (reference_number) {
      const existingEncumbrance = await prisma.encumbrances.findFirst({
        where: { 
          reference_number, 
          encumbrance_id: { not: encumbrance_id },
          is_deleted: false 
        },
      });
      if (existingEncumbrance) {
        return res.status(409).json({
          success: false,
          message: 'Reference number already exists on another encumbrance',
        });
      }
    }

    const updates: any = {};
    if (type) updates.type = type;
    if (issuing_entity) updates.issuing_entity = issuing_entity;
    if (reference_number !== undefined) updates.reference_number = reference_number;
    if (status) updates.status = status;
    if (registration_date) updates.registration_date = new Date(registration_date);

    const encumbrance = await prisma.encumbrances.update({
      where: { encumbrance_id },
      data: {
        ...updates,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Encumbrance updated successfully',
      data: encumbrance,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Encumbrance not found',
      });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Reference number conflict',
      });
    }
    console.error('Update encumbrance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update encumbrance',
    });
  }
};

// SOFT DELETE EN CUMBRANCE
export const deleteEncumbrance = async (req: Request<{ encumbrance_id: string }>, res: Response) => {
  try {
    const { encumbrance_id } = req.params;

    // Check if already deleted
    const existing = await prisma.encumbrances.findUnique({
      where: { encumbrance_id },
      select: { is_deleted: true },
    });

    if (existing?.is_deleted) {
      return res.status(400).json({
        success: false,
        message: 'Encumbrance is already deleted',
      });
    }

    await prisma.encumbrances.update({
      where: { encumbrance_id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Encumbrance soft deleted successfully',
      data: { encumbrance_id },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Encumbrance not found',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to delete encumbrance',
    });
  }
};

// GET EN CUMBRANCES BY PARCEL (Bonus utility)
export const getEncumbrancesByParcel = async (req: Request<{ upin: string }>, res: Response) => {
  try {
    const { upin } = req.params;

    const encumbrances = await prisma.encumbrances.findMany({
      where: {
        upin,
        is_deleted: false,
      },
      orderBy: { registration_date: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: encumbrances,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch encumbrances',
    });
  }
};



