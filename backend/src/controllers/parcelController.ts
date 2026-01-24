// src/controllers/parcelController.ts

import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';
import { 
  UserRole, 
  AuditAction, 
  ConfigCategory, 
  PaymentStatus, 
  EncumbranceStatus 
} from '../generated/prisma/enums.ts';
import {type AuthRequest } from '../middlewares/authMiddleware.ts';

// Define interfaces for request bodies and queries
interface GetParcelsQuery {
  page?: string;
  limit?: string;
  search?: string;
  sub_city_id?: string;
  ketena?: string;
  land_use?: string;
  tenure_type?: string;
}

interface CreateParcelBody {
  upin: string;           
  file_number: string;
  sub_city_id: string;
  tabia: string;
  ketena: string;
  block: string;
  total_area_m2: number;
  land_use?: string;
  land_grade: number;
  tenure_type?: string;  
  boundary_coords?: any;
  boundary_north?: any;
  boundary_south?: any;
  boundary_west?: any;
  boundary_east?:any;
}

interface TransferOwnershipBody {
  from_owner_id?: string;
  to_owner_id: string;
  to_share_ratio: number;
  transfer_type: string;  // From ConfigCategory.TRANSFER_TYPE
  transfer_price?: number;
  reference_no?: string;
  document_id?: string;
}

interface CreateEncumbranceBody {
  upin: string;
  type: string;  // From ConfigCategory.ENCUMBRANCE_TYPE
  issuing_entity: string;
  reference_number?: string;
  status?: EncumbranceStatus;
  registration_date?: string;
}

interface UpdateEncumbranceBody {
  type?: string;  // From ConfigCategory.ENCUMBRANCE_TYPE
  issuing_entity?: string;
  reference_number?: string;
  status?: EncumbranceStatus;
  registration_date?: string;
}

// Helper function to validate config values
const validateConfigValue = async (category: ConfigCategory, value: string): Promise<boolean> => {
  try {
    const config = await prisma.configurations.findFirst({
      where: {
        category,
        is_active: true,
        is_deleted: false,
        key: value,
      },
    });
    return !!config;
  } catch (error) {
    return false;
  }
};

export const createParcel = async (req: Request<{}, {}, CreateParcelBody>, res: Response) => {
  try {
    const {
      upin,           
      file_number,
      sub_city_id,
      tabia,
      ketena,
      block,
      total_area_m2,
      land_use,
      land_grade,
      tenure_type,      
      boundary_coords,
      boundary_north,
      boundary_south,
      boundary_west,
      boundary_east,
    } = req.body;

    // Validate required fields
    if (!upin || !file_number || !sub_city_id || !tabia || !ketena || !block || !total_area_m2 || land_grade === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Validate tenure_type if provided
    // if (tenure_type) {
    //   console.log("provided tenure type",tenure_type)
    //   const isValidTenure = await validateConfigValue(ConfigCategory.LAND_TENURE, tenure_type);
    //   console.log(isValidTenure)
    //   if (!isValidTenure) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Invalid tenure_type',
    //     });
    //   }
    // }

    // Validate land_use if provided
    // if (land_use) {
    //   const isValidLandUse = await validateConfigValue(ConfigCategory.LAND_USE, land_use);
    //   if (!isValidLandUse) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Invalid land_use',
    //     });
    //   }
    // }

    // Check if sub_city exists
    const subCity = await prisma.sub_cities.findFirst({
      where: {
        sub_city_id,
        is_deleted: false,
      },
    });

    if (!subCity) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sub_city_id',
      });
    }

    // Check for duplicate UPIN or file_number
    const existingParcel = await prisma.land_parcels.findFirst({
      where: {
        OR: [
          { upin },
          { file_number },
        ],
        is_deleted: false,
      },
    });

    if (existingParcel) {
      const conflictField = existingParcel.upin === upin ? 'UPIN' : 'file_number';
      return res.status(409).json({
        success: false,
        message: `${conflictField} already exists`,
      });
    }

    const parcel = await prisma.land_parcels.create({
      data: {
        upin,
        file_number,
        sub_city_id,
        tabia,
        ketena,
        block,
        total_area_m2,
        land_use,
        land_grade,
        tenure_type: tenure_type || 'OLD_POSSESSION',
        boundary_coords,
        boundary_north,
        boundary_south,
        boundary_west,
        boundary_east,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        upin: parcel.upin,
        sub_city_id: parcel.sub_city_id,
        file_number: parcel.file_number,
      },
    });
  } catch (error: any) {
    console.error('Create parcel error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'UPIN or file_number already exists',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create parcel',
    });
  }
};

export const getParcels = async (req: AuthRequest<{}, any, any, GetParcelsQuery>, res: Response) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    const { search, sub_city_id, tenure_type, ketena, land_use } = req.query;
    console.log("subcity",req.user)

    const where: any = {
      is_deleted: false,
      ...(search && {
        OR: [
          { upin: { contains: search, mode: 'insensitive' } },
          { file_number: { contains: search, mode: 'insensitive' } },
          { tabia: { contains: search, mode: 'insensitive' } },
          { ketena: { contains: search, mode: 'insensitive' } },
          { block: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(tenure_type && { tenure_type }),
      ...(ketena && { ketena }),
      ...(land_use && { land_use }),
    };

    // Restrict to user's sub_city_id if present (e.g., for non-admin users)
    if (req.user?.sub_city_id) {
      where.sub_city_id = req.user.sub_city_id;
    } else if (sub_city_id) {
      // Allow admins (sub_city_id null) to filter by query sub_city_id
      where.sub_city_id = sub_city_id;
    }

    const [parcels, total] = await Promise.all([
      prisma.land_parcels.findMany({
        where,
        skip,
        take: limit,
        include: {
          sub_city: {
            select: {
              name: true,
            },
          },
          owners: {
            where: { is_active: true, is_deleted: false },
            include: {
              owner: {
                select: { owner_id: true, full_name: true },
              },
            },
            orderBy: { acquired_at: 'asc' }, // optional: show oldest owners first
          },
          _count: {
            select: {
              encumbrances: {
                where: {
                  is_deleted: false,
                  status: EncumbranceStatus.ACTIVE,
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
          sub_city: parcel.sub_city?.name || parcel.sub_city_id,
          tabia: parcel.tabia,
          ketena: parcel.ketena,
          block: parcel.block,
          total_area_m2: parcel.total_area_m2,
          land_use: parcel.land_use,
          tenure_type: parcel.tenure_type,
          land_grade: parcel.land_grade,
          encumbrance_status: parcel._count.encumbrances > 0 ? 'Encumbered' : 'Clear',

          // Updated: just list of active owner names (no share ratio)
          owners: parcel.owners
            .map((po) => po.owner.full_name)
            .filter(Boolean)
            .join(', ') || 'No active owners',

          // Optional: also return count or owner IDs if frontend needs them
          owner_count: parcel.owners.length,
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
        upin: true,
        file_number: true,
        sub_city_id: true,
        sub_city: {
          select: {
            name: true,
            description: true,
          },
        },
        tabia: true,
        ketena: true,
        block: true,
        total_area_m2: true,
        land_use: true,
        land_grade: true,
        tenure_type: true,
        boundary_coords: true,
        boundary_east:true,
        boundary_north:true,
        boundary_south:true,
        boundary_west:true,
        created_at: true,
        updated_at: true,

        owners: {
          where: { is_active: true, is_deleted: false },
          select: {
            parcel_owner_id: true,
            acquired_at: true,           // ← kept (useful info)
            // share_ratio: true,        ← REMOVED
            owner: {
              select: {
                owner_id: true,
                full_name: true,
                national_id: true,
                tin_number: true,
                phone_number: true,
                documents: {
                  where: { is_deleted: false },
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
          // orderBy: { share_ratio: "desc" },  ← REMOVED
          orderBy: { acquired_at: "asc" },     // ← reasonable alternative
        },

        lease_agreement: {
          where: { is_deleted: false },
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
              where: { is_deleted: false },
              select: { 
                doc_id: true, 
                doc_type: true, 
                file_url: true, 
                file_name: true, 
                upload_date: true, 
                is_verified: true 
              },
              orderBy: { upload_date: "desc" },
            },
          },
        },

        buildings: {
          where: { is_deleted: false },
          select: { 
            building_id: true, 
            usage_type: true, 
            total_area: true, 
            floor_count: true 
          },
          orderBy: { created_at: "desc" },
        },

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
              where: { is_deleted: false },
              select: { 
                doc_id: true, 
                doc_type: true, 
                file_url: true, 
                file_name: true, 
                upload_date: true, 
                is_verified: true 
              },
              orderBy: { upload_date: "desc" },
            },
          },
          orderBy: { registration_date: "desc" },
        },

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
              where: { is_deleted: false },
              select: { 
                doc_id: true, 
                doc_type: true, 
                file_url: true, 
                file_name: true, 
                upload_date: true, 
                is_verified: true 
              },
              orderBy: { upload_date: "desc" },
            },
            from_owner: { select: { full_name: true } },
            to_owner: { select: { full_name: true } },
          },
          orderBy: { transfer_date: "desc" },
        },

        documents: {
          where: { 
            is_deleted: false,
            owner_id: null, 
            lease_id: null, 
            encumbrance_id: null, 
            history_id: null 
          },
          select: { 
            doc_id: true, 
            doc_type: true, 
            file_url: true, 
            file_name: true, 
            upload_date: true, 
            is_verified: true 
          },
          orderBy: { upload_date: "desc" },
        },

        billing_records: {
          where: { is_deleted: false },
          select: {
            bill_id: true,
            fiscal_year: true,
            bill_type: true,
            amount_due: true,
            penalty_amount: true,
            payment_status: true,
            due_date: true,
            base_payment:true,
            interest_amount:true,
            remaining_amount:true,
            installment_number:true,
            // transactions: {
            //   where: { is_deleted: false },
            //   select: { 
            //     transaction_id: true, 
            //     revenue_type: true, 
            //     receipt_serial_no: true, 
            //     amount_paid: true, 
            //     payment_date: true 
            //   },
            //   orderBy: { payment_date: "desc" },
            // },
          },
          // orderBy: { fiscal_year: "desc" },
        },
      },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found or has been deleted",
      });
    }

    // Transform history
    const enrichedHistory = parcel.history.map((entry) => ({
      ...entry,
      from_owner_name: entry.from_owner?.full_name ?? "Original/Old Possession",
      to_owner_name: entry.to_owner?.full_name ?? "Unknown",
      from_owner: undefined,
      to_owner: undefined,
    }));

  

    return res.status(200).json({
      success: true,
      data: {
        ...parcel,
        history: enrichedHistory,
        active_owners_count: parcel.owners.length,
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

export const updateParcel = async (req: Request<{ upin: string }>, res: Response) => {
  try {
    const { upin } = req.params;
    const data = req.body;

    // Validate allowed updates
    const allowedUpdates = {
      file_number: true,
      sub_city_id: true,
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
    for (const key in data) {
      if (allowedUpdates[key as keyof typeof allowedUpdates]) {
        // Validate tenure_type
        // if (key === 'tenure_type' && data[key]) {
        //   const isValid = await validateConfigValue(ConfigCategory.LAND_TENURE, data[key]);
        //   if (!isValid) {
        //     return res.status(400).json({
        //       success: false,
        //       message: 'Invalid tenure_type',
        //     });
        //   }
        // }
        
        // Validate land_use
        // if (key === 'land_use' && data[key]) {
        //   const isValid = await validateConfigValue(ConfigCategory.LAND_USE, data[key]);
        //   if (!isValid) {
        //     return res.status(400).json({
        //       success: false,
        //       message: 'Invalid land_use',
        //     });
        //   }
        // }
        
        updates[key] = data[key];
      }
    }

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
      return res.status(404).json({ 
        success: false, 
        message: 'Parcel not found' 
      });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        success: false, 
        message: 'File number already exists' 
      });
    }
    console.error('Update parcel error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update parcel' 
    });
  }
};

export const deleteParcel = async (req: Request<{ upin: string }>, res: Response) => {
  try {
    const { upin } = req.params;

    // Check if parcel has active owners
    const activeOwners = await prisma.parcel_owners.count({
      where: { 
        upin, 
        is_active: true,
        is_deleted: false,
      },
    });

    if (activeOwners > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parcel with active owners',
      });
    }

    // Check if parcel has active billing records
    const activeBilling = await prisma.billing_records.count({
      where: { 
        upin, 
        is_deleted: false,
        payment_status: { in: [PaymentStatus.UNPAID, PaymentStatus.OVERDUE] }
      },
    });

    if (activeBilling > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parcel with unpaid bills',
      });
    }

    // Soft delete
    await prisma.land_parcels.update({
      where: { upin },
      data: { 
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Parcel deleted successfully',
      data: { upin },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Parcel not found' 
      });
    }
    console.error('Delete parcel error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete parcel' 
    });
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
      transfer_type,
      transfer_price,
      reference_no,
    } = req.body;

    // === Basic validations ===
    if (!to_owner_id || !transfer_type) {
      return res.status(400).json({
        success: false,
        message: "to_owner_id and transfer_type are required.",
      });
    }

    // Validate transfer_type
    // const isValidTransferType = await validateConfigValue(ConfigCategory.TRANSFER_TYPE, transfer_type);
    // if (!isValidTransferType) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid transfer_type",
    //   });
    // }

    if (from_owner_id && from_owner_id === to_owner_id) {
      return res.status(400).json({
        success: false,
        message: "Self-transfer is not allowed.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current active owners
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

      if (from_owner_id) {
        fromOwnerRecord = activeOwners.find((po) => po.owner_id === from_owner_id);
        if (!fromOwnerRecord) {
          throw new Error("FROM_OWNER_NOT_ACTIVE");
        }
      }

      // 3. Check if TO owner exists
      const existingToOwnerRecord = activeOwners.find((po) => po.owner_id === to_owner_id);

      // 4. Create event snapshot (no share calculations)
   
      const snapshot = {
        timestamp: new Date().toISOString(),
        owners_before: activeOwners.map((po) => ({
          id: po.owner_id,
          name: po.owner.full_name,
        })),
      };

      // 5. Perform updates
      const updates: Promise<any>[] = [];

      // Update tenure to LEASE unless it's heredity
      if (transfer_type !== "HEREDITY") {
        const leaseTenure = await tx.configurations.findFirst({
          where: {
            category: ConfigCategory.LAND_TENURE,
            key: "LEASE",
            is_active: true,
            is_deleted: false,
          },
        });

        if (leaseTenure) {
          updates.push(
            tx.land_parcels.update({
              where: { upin },
              data: { tenure_type: "LEASE" },
            })
          );
        }
      }

      // Handle FROM owner
      if (from_owner_id && fromOwnerRecord) {
        // Full transfer → retire the owner (assuming full ownership transfer when no share ratio)
        updates.push(
          tx.parcel_owners.update({
            where: { parcel_owner_id: fromOwnerRecord.parcel_owner_id },
            data: {
              is_active: false,
              retired_at: new Date(),
            },
          })
        );
      }

      // Handle TO owner
      if (existingToOwnerRecord) {
        // For existing owner, we could merge or update metadata, but since no share, just update acquired_at
        updates.push(
          tx.parcel_owners.update({
            where: { parcel_owner_id: existingToOwnerRecord.parcel_owner_id },
            data: {
              acquired_at: new Date(),
            },
          })
        );
      } else {
        // Verify to_owner exists
        const toOwner = await tx.owners.findUnique({
          where: { owner_id: to_owner_id, is_deleted: false },
        });

        if (!toOwner) {
          throw new Error("TO_OWNER_NOT_FOUND");
        }

        // Create new ownership record (share_ratio removed from schema, so omit it)
        updates.push(
          tx.parcel_owners.create({
            data: {
              upin,
              owner_id: to_owner_id,
              acquired_at: new Date(),
              is_active: true,
            },
          })
        );
      }

      await Promise.all(updates);

      // 6. Record transfer in history (omit share-related fields if any)
      const historyEntry = await tx.ownership_history.create({
        data: {
          upin,
          transfer_type,
          transfer_date: new Date(),
          transfer_price: transfer_price ? Number(transfer_price) : null,
          reference_no: reference_no || null,
          from_owner_id: from_owner_id || null,
          to_owner_id: to_owner_id,
          event_snapshot: snapshot as any,
        },
        include: {
          from_owner: { select: { full_name: true } },
          to_owner: { select: { full_name: true } },
        },
      });

      // Determine action (adjusted for no shares)
      const finalOwners = await tx.parcel_owners.findMany({
        where: { upin, is_active: true, is_deleted: false },
      });


      return {
        history: historyEntry,
        action: existingToOwnerRecord ? "UPDATED_EXISTING_OWNER" : "NEW_OWNER_CREATED",
        transfer_kind: fromOwnerRecord ? "FULL" : "UNKNOWN", // Adjusted since no partial without shares
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
      TO_OWNER_NOT_FOUND: "The specified buyer does not exist.",
      NO_ACTIVE_OWNERS: "This parcel has no active owners.",
    };

    const message = errorMessages[error.message] || "Transfer failed due to an unexpected error.";

    return res.status(errorMessages[error.message] ? 400 : 500).json({
      success: false,
      message,
    });
  }
};





export const addCoOwner = async (req: Request, res: Response) => {
  const { upin } = req.params as { upin: string };
  const { owner_id, acquired_at } = req.body as { 
    owner_id: string; 
    acquired_at?: string;
    [key: string]: any 
  };

  try {
    // 1. Required field validation
    if (!upin?.trim()) {
      return res.status(400).json({
        success: false,
        message: "UPIN is required",
      });
    }

    if (!owner_id?.trim()) {
      return res.status(400).json({
        success: false,
        message: "owner_id is required",
      });
    }

    // 2. Check if parcel exists
    const parcel = await prisma.land_parcels.findUnique({
      where: { upin },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    // 3. Check if parcel is active
    if (parcel.status !== 'ACTIVE' || parcel.is_deleted) {
      return res.status(400).json({
        success: false,
        message: "Parcel is not active",
      });
    }

    // 4. Check if owner exists
    const existingOwner = await prisma.owners.findUnique({
      where: { 
        owner_id,
        is_deleted: false 
      },
    });

    if (!existingOwner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found or is deleted",
      });
    }

    // 5. Check for existing links with different scenarios
    const existingLinks = await prisma.parcel_owners.findMany({
      where: {
        upin,
        owner_id,
        is_deleted: false,
      },
      orderBy: {
        acquired_at: 'desc',
      },
    });

    // If there's an active link (not retired)
    const activeLink = existingLinks.find(link => 
      link.is_active && !link.retired_at
    );

    if (activeLink) {
      return res.status(409).json({
        success: false,
        message: "This owner is already an active co-owner of the parcel",
        data: {
          parcel_owner_id: activeLink.parcel_owner_id,
          acquired_at: activeLink.acquired_at,
        }
      });
    }

    // If there's a retired link, we might want to reactivate it instead of creating new
    const retiredLink = existingLinks.find(link => 
      !link.is_active || link.retired_at
    );

    // Determine acquired_at date
    const acquiredDate = acquired_at ? new Date(acquired_at) : new Date();
    
    // Validate acquired date is not in the future
    if (acquiredDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Acquisition date cannot be in the future",
      });
    }

    // Check if there's already an owner with the same acquisition date
    const duplicateDateLink = existingLinks.find(link => 
      link.acquired_at.toISOString() === acquiredDate.toISOString()
    );

    if (duplicateDateLink) {
      return res.status(409).json({
        success: false,
        message: "Owner already added to this parcel with the same acquisition date",
      });
    }

    // 6. Create the link
    const result = await prisma.$transaction(async (tx) => {
      // If there's a retired link, we could reactivate it instead
      // For now, we'll create a new record
      const parcelOwner = await tx.parcel_owners.create({
        data: {
          upin,
          owner_id,
          acquired_at: acquiredDate,
          is_active: true,
          retired_at: null,
        },
      });

      // Optionally: Create ownership history record
      // await tx.ownership_history.create({
      //   data: {
      //     upin,
      //     to_owner_id: owner_id,
      //     transfer_type: "CO_OWNER_ADDITION",
      //     event_snapshot: {
      //       parcel: parcel.upin,
      //       owner: existingOwner.full_name,
      //       owner_id: owner_id,
      //       acquired_at: acquiredDate,
      //       added_by: req.user?.userId, // Assuming you have user info
      //     },
      //     reference_no: `COOWNER-${Date.now()}`,
      //   },
      // });

      return { parcelOwner };
    });

    return res.status(201).json({
      success: true,
      message: "Co-owner added successfully",
      data: {
        parcel_owner_id: result.parcelOwner.parcel_owner_id,
        upin: result.parcelOwner.upin,
        owner_id: result.parcelOwner.owner_id,
        acquired_at: result.parcelOwner.acquired_at,
      },
    });
  } catch (error: any) {
    console.error("Add co-owner error:", error);

    if (error.code === 'P2002') {
      // Handle unique constraint violation (upin + owner_id + acquired_at)
      const constraint = error.meta?.target;
      if (constraint?.includes('parcel_owners_upin_owner_id_acquired_at_key')) {
        return res.status(409).json({
          success: false,
          message: "Owner already linked to this parcel with the same acquisition date",
        });
      }
      return res.status(409).json({
        success: false,
        message: "Duplicate entry detected",
      });
    }

    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: "Foreign key constraint failed - parcel or owner not found",
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Related record not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add co-owner",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


export const subdivideParcel = async (req: AuthRequest, res: Response) => {
  const { upin } = req.params as { upin: string };
  
  interface SubdivisionChild {
    upin: string;
    file_number: string;
    total_area_m2: number;
    land_use?: string;
    land_grade?: number;
    boundary_coords?: any;
    boundary_north?: string;
    boundary_south?: string;
    boundary_west?: string;
    boundary_east?: string;
  }
  
  const { childParcels } = req.body as { 
    childParcels: SubdivisionChild[] 
  };

  try {
    if (!Array.isArray(childParcels) || childParcels.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two child parcels are required',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get parent with its active owners (correct relation name)
      const parent = await tx.land_parcels.findUnique({
        where: { upin },
        include: {
          owners: {  // Changed from parcel_owners to owners
            where: { 
              is_active: true, 
              is_deleted: false 
            },
            include: { 
              owner: true 
            },
          },
        },
      });

      if (!parent) throw new Error('PARENT_NOT_FOUND');
      if (parent.status !== 'ACTIVE') throw new Error('PARENT_NOT_ACTIVE');

      // 2. Validate child parcels
      for (const childData of childParcels) {
        if (!childData.upin?.trim()) {
          throw new Error('CHILD_UPIN_REQUIRED');
        }
        if (!childData.file_number?.trim()) {
          throw new Error('CHILD_FILE_NUMBER_REQUIRED');
        }
        if (!childData.total_area_m2 || Number(childData.total_area_m2) <= 0) {
          throw new Error('INVALID_CHILD_AREA');
        }
        
        // Check for duplicate UPIN
        const existingParcel = await tx.land_parcels.findUnique({
          where: { upin: childData.upin },
        });
        
        if (existingParcel) {
          throw new Error(`DUPLICATE_UPIN: ${childData.upin}`);
        }
      }

      // 3. Area validation (with small tolerance)
      const totalChildArea = childParcels.reduce(
        (sum: number, c: SubdivisionChild) => sum + Number(c.total_area_m2), 
        0
      );
      const parentArea = Number(parent.total_area_m2);
      
      if (Math.abs(totalChildArea - parentArea) > 0.1) {
        throw new Error('CHILD_AREAS_MUST_MATCH_PARENT');
      }

      // 4. Retire parent
      await tx.land_parcels.update({
        where: { upin },
        data: { 
          status: 'RETIRED',
          updated_at: new Date(),
        },
      });

      const createdChildren = [];

      // 5. Create children + copy active owners
      for (const childData of childParcels) {
        const child = await tx.land_parcels.create({
          data: {
            upin: childData.upin,
            file_number: childData.file_number,
            sub_city_id: parent.sub_city_id,
            tabia: parent.tabia,
            ketena: parent.ketena,
            block: parent.block,
            total_area_m2: childData.total_area_m2,
            land_use: childData.land_use || parent.land_use,
            land_grade: childData.land_grade || parent.land_grade,
            tenure_type: parent.tenure_type,
            parent_upin: upin,
            status: 'ACTIVE',
            boundary_coords: childData.boundary_coords || parent.boundary_coords,
            boundary_north: childData.boundary_north || parent.boundary_north,
            boundary_east: childData.boundary_east || parent.boundary_east,
            boundary_south: childData.boundary_south || parent.boundary_south,
            boundary_west: childData.boundary_west || parent.boundary_west,
          },
        });

        // Copy all active owners from parent to this child (now using parent.owners)
        for (const parcelOwner of parent.owners) {  // Changed from parent.parcel_owners
          await tx.parcel_owners.create({
            data: {
              upin: child.upin,
              owner_id: parcelOwner.owner_id,
              acquired_at: new Date(),
              is_active: true,
            },
          });
        }

        createdChildren.push(child);
      }

      // 6. Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: req.user?.user_id || 'system',
          action_type: AuditAction.UPDATE,
          entity_type: 'land_parcels',
          entity_id: upin,
          changes: {
            action: 'subdivision',
            parent_upin: upin,
            child_upins: childParcels.map(c => c.upin),
            child_areas: childParcels.map(c => c.total_area_m2),
            timestamp: new Date(),
          },
          timestamp: new Date(),
          ip_address: req.ip,
        },
      });

      return { children: createdChildren };
    });

    return res.status(201).json({
      success: true,
      message: "Parcel subdivided successfully. Parent retired, children created with copied owners.",
      data: {
        parent_upin: upin,
        child_parcels: result.children.map(c => ({
          upin: c.upin,
          file_number: c.file_number,
          total_area_m2: Number(c.total_area_m2),
          land_use: c.land_use,
          land_grade: Number(c.land_grade),
        })),
      },
    });
  } catch (error: any) {
    console.error("Subdivision error:", error);

    const messages: Record<string, string> = {
      PARENT_NOT_FOUND: "Parent parcel not found",
      PARENT_NOT_ACTIVE: "Only active parcels can be subdivided",
      CHILD_AREAS_MUST_MATCH_PARENT: "Total child areas must match parent area (within 0.1 m² tolerance)",
      CHILD_UPIN_REQUIRED: "Child UPIN is required",
      CHILD_FILE_NUMBER_REQUIRED: "Child file number is required",
      INVALID_CHILD_AREA: "Child area must be greater than 0",
    };

    let message = messages[error.message] || "Failed to subdivide parcel";
    
    // Handle duplicate UPIN error
    if (error.message?.startsWith('DUPLICATE_UPIN:')) {
      const duplicateUpin = error.message.split(': ')[1];
      message = `UPIN already exists: ${duplicateUpin}`;
    }

    // Handle Prisma errors
    if (error.code === 'P2002') {
      message = "Duplicate UPIN or file number detected";
    }

    return res.status(400).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

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

    // Validate encumbrance type
    // const isValidType = await validateConfigValue(ConfigCategory.ENCUMBRANCE_TYPE, type);
    // if (!isValidType) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid encumbrance type',
    //   });
    // }

    // Verify parcel exists
    const parcel = await prisma.land_parcels.findFirst({
      where: { upin, is_deleted: false },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found',
      });
    }

    // Check reference number uniqueness
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
        status: status || EncumbranceStatus.ACTIVE,
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

export const updateEncumbrance = async (
  req: Request<{ encumbrance_id: string }, {}, UpdateEncumbranceBody>,
  res: Response
) => {
  try {
    const { encumbrance_id } = req.params;
    const { type, issuing_entity, reference_number, status, registration_date } = req.body;

    // Validate at least one field
    if (!type && !issuing_entity && !reference_number && !status && !registration_date) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update',
      });
    }

    // Validate type if provided
    // if (type) {
    //   const isValidType = await validateConfigValue(ConfigCategory.ENCUMBRANCE_TYPE, type);
    //   if (!isValidType) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Invalid encumbrance type',
    //     });
    //   }
    // }

    // Check reference number uniqueness
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

export const deleteEncumbrance = async (req: Request<{ encumbrance_id: string }>, res: Response) => {
  try {
    const { encumbrance_id } = req.params;

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
      message: 'Encumbrance deleted successfully',
      data: { encumbrance_id },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Encumbrance not found',
      });
    }
    console.error('Delete encumbrance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete encumbrance',
    });
  }
};

export const getEncumbrancesByParcel = async (req: Request<{ upin: string }>, res: Response) => {
  try {
    const { upin } = req.params;

    const encumbrances = await prisma.encumbrances.findMany({
      where: {
        upin,
        is_deleted: false,
      },
      orderBy: { registration_date: 'desc' },
      include: {
        documents: {
          where: { is_deleted: false },
          select: {
            doc_id: true,
            doc_type: true,
            file_url: true,
            file_name: true,
            upload_date: true,
            is_verified: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: encumbrances,
    });
  } catch (error: any) {
    console.error('Get encumbrances error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch encumbrances',
    });
  }
};