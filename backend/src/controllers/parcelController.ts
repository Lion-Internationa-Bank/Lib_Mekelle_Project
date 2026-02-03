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

export const createParcel = async (req: AuthRequest, res: Response) => {
  const user = req.user!; 
  // if(!user){
  //   return res.status(404).json({
  //     success:false,
  //     message:"Anauthorized access"
  //   })
  // }
  
  try {
    const {
      upin,           
      file_number,
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
    if (!upin || !file_number  || !tabia || !ketena || !block || !total_area_m2 || land_grade === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }
    const subcityId = user.sub_city_id;
    
    if(!subcityId){
        return res.status(404).json({
          success:false,
          message: "Sub city id not found",
        })
      }

       // Check if sub_city exists
    const subCity = await prisma.sub_cities.findFirst({
      where: {
        sub_city_id:subcityId,
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
        sub_city_id:subcityId,
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

    // Create audit log for parcel creation
    await prisma.audit_logs.create({
      data: {
        user_id: user?.user_id ,
        action_type: AuditAction.CREATE,
        entity_type: 'land_parcels',
        entity_id: parcel.upin,
        changes: {
          action: 'create_parcel',
          upin: parcel.upin,
          file_number: parcel.file_number,
          sub_city_id: parcel.sub_city_id,
          tabia: parcel.tabia,
          ketena: parcel.ketena,
          block: parcel.block,
          total_area_m2: parcel.total_area_m2,
          land_use: parcel.land_use,
          land_grade: parcel.land_grade,
          tenure_type: parcel.tenure_type,
          has_boundary_coords: !!parcel.boundary_coords,
          has_boundary_north: !!parcel.boundary_north,
          has_boundary_south: !!parcel.boundary_south,
          has_boundary_west: !!parcel.boundary_west,
          has_boundary_east: !!parcel.boundary_east,
          actor_id: user?.user_id,
          actor_role: user?.role,
          // actor_username: user?.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        upin: parcel.upin,
        sub_city_id: parcel.sub_city_id,
        file_number: parcel.file_number,
        tabia: parcel.tabia,
        ketena: parcel.ketena,
        block: parcel.block,
        total_area_m2: parcel.total_area_m2,
        created_at: parcel.created_at,
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
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Invalid sub_city_id reference',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create parcel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getParcels = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    const { search, sub_city_id, tenure_type, ketena, land_use } = req.query;
    console.log("subcity", req.user);

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

    // Define which roles can see all sub-cities
    const canSeeAllSubCities = (
      user.role === UserRole.CITY_ADMIN || 
      user.role === UserRole.REVENUE_USER || 
      user.role === UserRole.REVENUE_ADMIN
    );

    // Apply sub_city restrictions based on user role
    if (canSeeAllSubCities) {
      // CITY_ADMIN, REVENUE_USER, REVENUE_ADMIN can see all or filter by specific sub_city_id
      if (sub_city_id) {
        where.sub_city_id = sub_city_id;
      }
      // If no sub_city_id filter provided, they see all parcels (no sub_city restriction)
    } else {
      // For all other roles (SUBCITY_NORMAL, SUBCITY_AUDITOR, SUBCITY_ADMIN, etc.)
      // Force restrict to their assigned sub_city_id
      if (user.sub_city_id) {
        where.sub_city_id = user.sub_city_id;
      } else {
        // If user has no sub_city_id assigned but is not an admin role,
        // they shouldn't see any parcels
        return res.status(200).json({
          success: true,
          data: {
            parcels: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      }
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
        boundary_east: true,
        boundary_north: true,
        boundary_south: true,
        boundary_west: true,
        created_at: true,
        updated_at: true,

        owners: {
          where: { is_active: true, is_deleted: false },
          select: {
            parcel_owner_id: true,
            acquired_at: true,
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
          orderBy: { acquired_at: "asc" },
        },

        lease_agreement: {
          where: { is_deleted: false },
          select: {
            lease_id: true,
            annual_lease_fee: true,
            total_lease_amount: true,
            down_payment_amount: true,
            other_payment: true,
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
            remaining_amount:true,
            interest_amount: true,
            payment_status: true,
            due_date: true,
            base_payment:true,
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
  const { upin } = req.params;
  const data = req.body;
  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    // Get current parcel data for audit log
    const currentParcel = await prisma.land_parcels.findFirst({
      where: { 
        upin,
        is_deleted: false 
      },
    });

    if (!currentParcel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parcel not found' 
      });
    }

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
      boundary_coords: true,
      boundary_north: true,
      boundary_south: true,
      boundary_west: true,
      boundary_east: true,
      status: true,
    };

    const updates: any = {};
    const changesForAudit: any = {};

    for (const key in data) {
      if (allowedUpdates[key as keyof typeof allowedUpdates]) {
        // Check if sub_city_id exists when updating
        if (key === 'sub_city_id' && data[key]) {
          const subCityExists = await prisma.sub_cities.findFirst({
            where: {
              sub_city_id: data[key],
              is_deleted: false,
            },
          });
          
          if (!subCityExists) {
            return res.status(400).json({
              success: false,
              message: 'Invalid sub_city_id',
            });
          }
        }
        
        // Check if new file_number doesn't conflict with existing parcels
        if (key === 'file_number' && data[key] && data[key] !== currentParcel.file_number) {
          const existingFileNumber = await prisma.land_parcels.findFirst({
            where: {
              file_number: data[key],
              is_deleted: false,
              NOT: { upin }
            },
          });
          
          if (existingFileNumber) {
            return res.status(409).json({
              success: false,
              message: 'File number already exists',
            });
          }
        }
        
        updates[key] = data[key];
        
        // Only store in audit log if value has changed
        const currentValue = currentParcel[key as keyof typeof currentParcel];
        if (JSON.stringify(currentValue) !== JSON.stringify(data[key])) {
          changesForAudit[key] = {
            from: currentValue,
            to: data[key]
          };
        }
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
      data: {
        ...updates,
        updated_at: new Date(),
      },
    });

    // Create audit log only if there were actual changes
    if (Object.keys(changesForAudit).length > 0) {
      await prisma.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.UPDATE,
          entity_type: 'land_parcels',
          entity_id: upin,
          changes: {
            action: 'update_parcel',
            changed_fields: changesForAudit,
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
      message: 'Parcel updated successfully',
      data: {
        upin: parcel.upin,
        file_number: parcel.file_number,
        sub_city_id: parcel.sub_city_id,
        tabia: parcel.tabia,
        ketena: parcel.ketena,
        block: parcel.block,
        updated_at: parcel.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Update parcel error:', error);
    
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
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid sub_city_id reference' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update parcel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteParcel = async (req: Request<{ upin: string }>, res: Response) => {
  const { upin } = req.params;
  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    // Get current parcel data for audit log
    const currentParcel = await prisma.land_parcels.findFirst({
      where: { 
        upin,
        is_deleted: false 
      },
    });

    if (!currentParcel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parcel not found' 
      });
    }

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
        data: { active_owners: activeOwners }
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
        data: { unpaid_bills: activeBilling }
      });
    }

    // Check if parcel has child parcels
    const childParcels = await prisma.land_parcels.count({
      where: { 
        parent_upin: upin,
        is_deleted: false
      }
    });

    if (childParcels > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parcel with child parcels',
        data: { child_parcels: childParcels }
      });
    }

    // Check if parcel has active lease
    const activeLease = await prisma.lease_agreements.count({
      where: { 
        upin,
        is_deleted: false,
        status: 'ACTIVE'
      }
    });

    if (activeLease > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parcel with active lease',
        data: { active_leases: activeLease }
      });
    }

    // Check if parcel has active encumbrances
    const activeEncumbrances = await prisma.encumbrances.count({
      where: { 
        upin,
        is_deleted: false,
        status: 'ACTIVE'
      }
    });

    if (activeEncumbrances > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parcel with active encumbrances',
        data: { active_encumbrances: activeEncumbrances }
      });
    }

    // Soft delete
    const deletedParcel = await prisma.land_parcels.update({
      where: { upin },
      data: { 
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
        status: 'RETIRED', // Update status to RETIRED
        file_number: `${currentParcel.file_number}_deleted_${Date.now()}`, // Modify file_number to allow reuse
      },
    });

    // Create audit log for parcel deletion
    await prisma.audit_logs.create({
      data: {
        user_id: actor?.user_id || null,
        action_type: AuditAction.DELETE,
        entity_type: 'land_parcels',
        entity_id: upin,
        changes: {
          action: 'soft_delete_parcel',
          original_file_number: currentParcel.file_number,
          new_file_number: deletedParcel.file_number,
          sub_city_id: currentParcel.sub_city_id,
          tabia: currentParcel.tabia,
          ketena: currentParcel.ketena,
          block: currentParcel.block,
          total_area_m2: currentParcel.total_area_m2,
          active_owners_at_deletion: activeOwners,
          unpaid_bills_at_deletion: activeBilling,
          child_parcels_at_deletion: childParcels,
          active_leases_at_deletion: activeLease,
          active_encumbrances_at_deletion: activeEncumbrances,
          actor_id: actor?.user_id,
          actor_role: actor?.role,
          actor_username: actor?.username,
          deleted_at: deletedParcel.deleted_at,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Parcel soft deleted successfully',
      data: { 
        upin,
        original_file_number: currentParcel.file_number,
        new_file_number: deletedParcel.file_number,
        deleted_at: deletedParcel.deleted_at,
        is_deleted: deletedParcel.is_deleted,
        status: deletedParcel.status,
      },
    });
  } catch (error: any) {
    console.error('Delete parcel error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Parcel not found' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete parcel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const transferOwnership = async (
  req: Request<{ upin: string }, {}, TransferOwnershipBody>,
  res: Response
) => {
  const actor = (req as any).user; // Assuming AuthRequest extends Request
  
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

      // 4. Create event snapshot
      const snapshot = {
        timestamp: new Date().toISOString(),
        owners_before: activeOwners.map((po) => ({
          id: po.owner_id,
          name: po.owner.full_name,
        })),
        transfer_type,
        transfer_price,
        reference_no,
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
              data: { 
                tenure_type: "LEASE",
                updated_at: new Date()
              },
            })
          );
        }
      }

      // Handle FROM owner
      if (from_owner_id && fromOwnerRecord) {
        // Full transfer → retire the owner
        updates.push(
          tx.parcel_owners.update({
            where: { parcel_owner_id: fromOwnerRecord.parcel_owner_id },
            data: {
              is_active: false,
              retired_at: new Date(),
              updated_at: new Date(),
            },
          })
        );
      }

      // Handle TO owner
      if (existingToOwnerRecord) {
        // For existing owner, update acquired_at
        updates.push(
          tx.parcel_owners.update({
            where: { parcel_owner_id: existingToOwnerRecord.parcel_owner_id },
            data: {
              acquired_at: new Date(),
              updated_at: new Date(),
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

        // Create new ownership record
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

      // 6. Record transfer in history
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

      // Create audit log for ownership transfer
      await tx.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.UPDATE,
          entity_type: 'parcel_owners',
          entity_id: `${upin}_${to_owner_id}`,
          changes: {
            action: 'transfer_ownership',
            upin,
            from_owner_id,
            from_owner_name: historyEntry.from_owner?.full_name || null,
            to_owner_id,
            to_owner_name: historyEntry.to_owner?.full_name,
            transfer_type,
            transfer_price: historyEntry.transfer_price,
            reference_no: historyEntry.reference_no,
            parcel_tenure_updated: transfer_type !== "HEREDITY",
            actor_id: actor?.user_id,
            actor_role: actor?.role,
            actor_username: actor?.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: (req as any).ip || req.socket.remoteAddress,
        },
      });

      // Also audit the parcel update
      await tx.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.UPDATE,
          entity_type: 'land_parcels',
          entity_id: upin,
          changes: {
            action: 'parcel_ownership_updated',
            ownership_transfer: true,
            new_owner: to_owner_id,
            transfer_type,
            actor_id: actor?.user_id,
            actor_role: actor?.role,
            actor_username: actor?.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: (req as any).ip || req.socket.remoteAddress,
        },
      });

      // Get final active owners for response
      const finalOwners = await tx.parcel_owners.findMany({
        where: { upin, is_active: true, is_deleted: false },
        include: { owner: true }
      });

      return {
        history: historyEntry,
        action: existingToOwnerRecord ? "UPDATED_EXISTING_OWNER" : "NEW_OWNER_CREATED",
        transfer_kind: fromOwnerRecord ? "FULL" : "ADDITIONAL",
        final_active_owners: finalOwners.map(po => ({
          owner_id: po.owner_id,
          full_name: po.owner.full_name,
          acquired_at: po.acquired_at,
        }))
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const addParcelOwner = async (req: Request, res: Response) => {
  const { upin } = req.params as { upin: string };
  const { owner_id, acquired_at } = req.body as { 
    owner_id: string; 
    acquired_at?: string;
    [key: string]: any 
  };
  const actor = (req as any).user; // Assuming AuthRequest extends Request

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

    const result = await prisma.$transaction(async (tx) => {
      // 5. Check if there are any existing owners for this parcel
      const existingParcelOwners = await tx.parcel_owners.findMany({
        where: {
          upin,
          is_deleted: false,
          is_active: true,
          retired_at: null,
        },
      });

      // Determine if this is the first owner or a co-owner
      const isFirstOwner = existingParcelOwners.length === 0;
      const transferType = isFirstOwner ? "FIRST_OWNER" : "CO_OWNER_ADDITION";
      const actionType = isFirstOwner ? "first_owner_added" : "parcel_co_owner_added";

      // // 6. Check for existing active links for this specific owner
      // const existingOwnerLinks = existingParcelOwners.filter(link => 
      //   link.owner_id === owner_id
      // );

      // const activeLink = existingOwnerLinks.find(link => 
      //   link.is_active && !link.retired_at
      // );

      // if (activeLink) {
      //   throw new Error("ACTIVE_OWNER_EXISTS");
      // }

      // Determine acquired_at date
      const acquiredDate = acquired_at ? new Date(acquired_at) : new Date();
      
      // Validate acquired date is not in the future
      if (acquiredDate > new Date()) {
        throw new Error("FUTURE_ACQUISITION_DATE");
      }

      // 7. If this is the first owner, ensure acquired date is reasonable
      if (isFirstOwner && acquiredDate < new Date('1900-01-01')) {
        throw new Error("INVALID_ACQUISITION_DATE");
      }

      // 8. Create the parcel-owner link
      const parcelOwner = await tx.parcel_owners.create({
        data: {
          upin,
          owner_id,
          acquired_at: acquiredDate,
          is_active: true,
          retired_at: null,
        },
      });

      // 10. Create audit log for owner addition
      await tx.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.CREATE,
          entity_type: 'parcel_owners',
          entity_id: parcelOwner.parcel_owner_id,
          changes: {
            action: isFirstOwner ? 'add_first_owner' : 'add_co_owner',
            upin,
            owner_id,
            owner_name: existingOwner.full_name,
            owner_national_id: existingOwner.national_id,
            acquired_at: parcelOwner.acquired_at,
            is_first_owner: isFirstOwner,
            existing_owners_count: existingParcelOwners.length,
            actor_id: actor?.user_id,
            actor_role: actor?.role,
            actor_username: actor?.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: (req as any).ip || req.socket.remoteAddress,
        },
      });

      // 11. Also audit the parcel update
      await tx.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.UPDATE,
          entity_type: 'land_parcels',
          entity_id: upin,
          changes: {
            action: actionType,
            added_owner_id: owner_id,
            added_owner_name: existingOwner.full_name,
            is_first_owner: isFirstOwner,
            total_active_owners: existingParcelOwners.length + 1,
            actor_id: actor?.user_id,
            actor_role: actor?.role,
            actor_username: actor?.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: (req as any).ip || req.socket.remoteAddress,
        },
      });

      // 12. Create ownership history record
      const historyEntry = await tx.ownership_history.create({
        data: {
          upin,
          from_owner_id: isFirstOwner ? null : undefined, // First owner has no "from"
          to_owner_id: owner_id,
          transfer_type: transferType,
          event_snapshot: {
            parcel: parcel.upin,
            owner: existingOwner.full_name,
            owner_id: owner_id,
            acquired_at: acquiredDate,
            is_first_owner: isFirstOwner,
            existing_owners_before: existingParcelOwners.map(po => ({
              owner_id: po.owner_id,
            })),
            added_by: actor?.user_id,
            added_by_username: actor?.username,
          } as any,
          reference_no: `${transferType}-${Date.now()}`,
          transfer_date: new Date(),
        },
      });

      return { parcelOwner, historyEntry, isFirstOwner };
    });

    return res.status(201).json({
      success: true,
      message: result.isFirstOwner 
        ? "First owner added successfully" 
        : "Co-owner added successfully",
      data: {
        parcel_owner_id: result.parcelOwner.parcel_owner_id,
        upin: result.parcelOwner.upin,
        owner_id: result.parcelOwner.owner_id,
        owner_name: existingOwner.full_name,
        acquired_at: result.parcelOwner.acquired_at,
        is_first_owner: result.isFirstOwner,
        history_id: result.historyEntry.history_id,
      },
    });
  } catch (error: any) {
    console.error("Add parcel owner error:", error);

    const errorMessages: Record<string, string> = {
      ACTIVE_OWNER_EXISTS: "This owner is already an active owner of the parcel",
      FUTURE_ACQUISITION_DATE: "Acquisition date cannot be in the future",
      INVALID_ACQUISITION_DATE: "First owner acquisition date appears to be invalid",
      DUPLICATE_ACQUISITION_DATE: "Owner already linked to this parcel with the same acquisition date",
    };

    let message = errorMessages[error.message];

    if (!message) {
      if (error.code === 'P2002') {
        const constraint = error.meta?.target;
        if (constraint?.includes('parcel_owners_upin_owner_id_acquired_at_key')) {
          message = "Owner already linked to this parcel with the same acquisition date";
        } else {
          message = "Duplicate entry detected";
        }
      } else if (error.code === 'P2003') {
        message = "Foreign key constraint failed - parcel or owner not found";
      } else if (error.code === 'P2025') {
        message = "Related record not found";
      } else {
        message = "Failed to add owner";
      }
    }

    return res.status(400).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const subdivideParcel = async (req: AuthRequest, res: Response) => {
  const { upin } = req.params as { upin: string };
 const actor = (req as any).user;
  
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
      // 1. Get parent with its active owners
      const parent = await tx.land_parcels.findUnique({
        where: { upin },
        include: {
          owners: {
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
      const retiredParent = await tx.land_parcels.update({
        where: { upin },
        data: { 
          status: 'RETIRED',
          updated_at: new Date(),
        },
      });

      const createdChildren = [];
      const createdOwnerships = [];

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

        // Copy all active owners from parent to this child
        for (const parcelOwner of parent.owners) {
          const newOwner = await tx.parcel_owners.create({
            data: {
              upin: child.upin,
              owner_id: parcelOwner.owner_id,
              acquired_at: new Date(),
              is_active: true,
            },
          });
          createdOwnerships.push({
            child_upin: child.upin,
            owner_id: parcelOwner.owner_id,
            owner_name: parcelOwner.owner.full_name,
            parcel_owner_id: newOwner.parcel_owner_id,
          });
        }

        createdChildren.push(child);
      }

      // 6. Create comprehensive audit log
      await tx.audit_logs.create({
        data: {
          user_id: actor.user_id,
          action_type: AuditAction.UPDATE,
          entity_type: 'land_parcels',
          entity_id: upin,
          changes: {
            action: 'subdivide_parcel',
            parent_upin: upin,
            parent_area: parentArea,
            parent_status_after: 'RETIRED',
            child_count: childParcels.length,
            children: childParcels.map(c => ({
              upin: c.upin,
              file_number: c.file_number,
              area_m2: c.total_area_m2,
              land_use: c.land_use,
              land_grade: c.land_grade,
            })),
            total_child_area: totalChildArea,
            owners_copied: parent.owners.map(po => ({
              owner_id: po.owner_id,
              owner_name: po.owner.full_name,
            })),
            ownerships_created: createdOwnerships.length,
            actor_id: actor.user_id,
            actor_role: actor.role,
            actor_username: actor.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: req.ip || req.socket.remoteAddress,
        },
      });

      // 7. Create audit logs for each child parcel creation
      for (const child of createdChildren) {
        await tx.audit_logs.create({
          data: {
            user_id: actor.user_id,
            action_type: AuditAction.CREATE,
            entity_type: 'land_parcels',
            entity_id: child.upin,
            changes: {
              action: 'create_child_parcel_from_subdivision',
              parent_upin: upin,
              upin: child.upin,
              file_number: child.file_number,
              area_m2: child.total_area_m2,
              land_use: child.land_use,
              land_grade: child.land_grade,
              sub_city_id: child.sub_city_id,
              tabia: child.tabia,
              ketena: child.ketena,
              block: child.block,
              actor_id: actor.user_id,
              actor_role: actor.role,
              actor_username: actor.username,
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date(),
            ip_address: req.ip || req.socket.remoteAddress,
          },
        });
      }

      // 8. Create ownership history for the subdivision
      await tx.ownership_history.create({
        data: {
          upin,
          transfer_type: "SUBDIVISION",
          event_snapshot: {
            parent_parcel: {
              upin: parent.upin,
              area_m2: parentArea,
              owners: parent.owners.map(po => ({
                owner_id: po.owner_id,
                owner_name: po.owner.full_name,
              })),
            },
            child_parcels: createdChildren.map(c => ({
              upin: c.upin,
              file_number: c.file_number,
              area_m2: c.total_area_m2,
            })),
            performed_by: {
              user_id: actor.user_id,
              username: actor.username,
              role: actor.role,
            },
            timestamp: new Date().toISOString(),
          } as any,
          reference_no: `SUBDIVISION-${Date.now()}`,
          transfer_date: new Date(),
        },
      });

      return { 
        parent: retiredParent, 
        children: createdChildren,
        ownerships: createdOwnerships 
      };
    });

    return res.status(201).json({
      success: true,
      message: "Parcel subdivided successfully. Parent retired, children created with copied owners.",
      data: {
        parent_upin: upin,
        parent_status: 'RETIRED',
        child_count: result.children.length,
        child_parcels: result.children.map(c => ({
          upin: c.upin,
          file_number: c.file_number,
          total_area_m2: Number(c.total_area_m2),
          land_use: c.land_use,
          land_grade: Number(c.land_grade),
        })),
        owners_copied: result.ownerships.length,
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
  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    const { upin, type, issuing_entity, reference_number, status, registration_date } = req.body;

    // Validate required fields
    if (!upin || !type || !issuing_entity) {
      return res.status(400).json({
        success: false,
        message: 'upin, type, and issuing_entity are required',
      });
    }

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

    // Create audit log for encumbrance creation
    await prisma.audit_logs.create({
      data: {
        user_id: actor?.user_id || null,
        action_type: AuditAction.CREATE,
        entity_type: 'encumbrances',
        entity_id: encumbrance.encumbrance_id,
        changes: {
          action: 'create_encumbrance',
          upin,
          type,
          issuing_entity,
          reference_number,
          status: encumbrance.status,
          registration_date: encumbrance.registration_date,
          parcel_file_number: parcel.file_number,
          parcel_sub_city_id: parcel.sub_city_id,
          actor_id: actor?.user_id,
          actor_role: actor?.role,
          actor_username: actor?.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    // Also audit the parcel encumbrance addition
    await prisma.audit_logs.create({
      data: {
        user_id: actor?.user_id || null,
        action_type: AuditAction.UPDATE,
        entity_type: 'land_parcels',
        entity_id: upin,
        changes: {
          action: 'add_encumbrance_to_parcel',
          encumbrance_id: encumbrance.encumbrance_id,
          encumbrance_type: type,
          issuing_entity,
          status: encumbrance.status,
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
      message: 'Encumbrance created successfully',
      data: {
        encumbrance_id: encumbrance.encumbrance_id,
        upin: encumbrance.upin,
        type: encumbrance.type,
        issuing_entity: encumbrance.issuing_entity,
        reference_number: encumbrance.reference_number,
        status: encumbrance.status,
        registration_date: encumbrance.registration_date,
        created_at: encumbrance.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create encumbrance error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Reference number already exists',
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Invalid parcel reference',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create encumbrance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateEncumbrance = async (
  req: Request<{ encumbrance_id: string }, {}, UpdateEncumbranceBody>,
  res: Response
) => {
  const { encumbrance_id } = req.params;
  const { type, issuing_entity, reference_number, status, registration_date } = req.body;
  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    // Validate at least one field
    if (!type && !issuing_entity && !reference_number && !status && !registration_date) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update',
      });
    }

    // Get current encumbrance data for audit log
    const currentEncumbrance = await prisma.encumbrances.findUnique({
      where: { 
        encumbrance_id,
        is_deleted: false 
      },
      include: {
        land_parcel: {
          select: {
            upin: true,
            file_number: true,
          }
        }
      }
    });

    if (!currentEncumbrance) {
      return res.status(404).json({
        success: false,
        message: 'Encumbrance not found',
      });
    }

    // Check reference number uniqueness if changing
    if (reference_number && reference_number !== currentEncumbrance.reference_number) {
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
    const changesForAudit: any = {};

    // Track changes for audit log
    if (type && type !== currentEncumbrance.type) {
      updates.type = type;
      changesForAudit.type = {
        from: currentEncumbrance.type,
        to: type
      };
    }

    if (issuing_entity && issuing_entity !== currentEncumbrance.issuing_entity) {
      updates.issuing_entity = issuing_entity;
      changesForAudit.issuing_entity = {
        from: currentEncumbrance.issuing_entity,
        to: issuing_entity
      };
    }

    if (reference_number !== undefined && reference_number !== currentEncumbrance.reference_number) {
      updates.reference_number = reference_number;
      changesForAudit.reference_number = {
        from: currentEncumbrance.reference_number,
        to: reference_number
      };
    }

    if (status && status !== currentEncumbrance.status) {
      updates.status = status;
      changesForAudit.status = {
        from: currentEncumbrance.status,
        to: status
      };
    }

    if (registration_date) {
      const newDate = new Date(registration_date);
      if (newDate.getTime() !== currentEncumbrance.registration_date.getTime()) {
        updates.registration_date = newDate;
        changesForAudit.registration_date = {
          from: currentEncumbrance.registration_date,
          to: newDate
        };
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes detected. Provide different values to update.',
      });
    }

    const encumbrance = await prisma.encumbrances.update({
      where: { encumbrance_id },
      data: {
        ...updates,
        updated_at: new Date(),
      },
    });

    // Create audit log only if there were actual changes
    if (Object.keys(changesForAudit).length > 0) {
      await prisma.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.UPDATE,
          entity_type: 'encumbrances',
          entity_id: encumbrance_id,
          changes: {
            action: 'update_encumbrance',
            upin: currentEncumbrance.upin,
            parcel_file_number: currentEncumbrance.land_parcel?.file_number,
            changed_fields: changesForAudit,
            actor_id: actor?.user_id,
            actor_role: actor?.role,
            actor_username: actor?.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: (req as any).ip || req.socket.remoteAddress,
        },
      });

      // Also audit the parcel if encumbrance status changed
      if (changesForAudit.status) {
        await prisma.audit_logs.create({
          data: {
            user_id: actor?.user_id || null,
            action_type: AuditAction.UPDATE,
            entity_type: 'land_parcels',
            entity_id: currentEncumbrance.upin,
            changes: {
              action: 'update_parcel_encumbrance_status',
              encumbrance_id,
              encumbrance_type: currentEncumbrance.type,
              previous_status: changesForAudit.status.from,
              new_status: changesForAudit.status.to,
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
    }

    return res.status(200).json({
      success: true,
      message: 'Encumbrance updated successfully',
      data: {
        encumbrance_id: encumbrance.encumbrance_id,
        upin: encumbrance.upin,
        type: encumbrance.type,
        issuing_entity: encumbrance.issuing_entity,
        reference_number: encumbrance.reference_number,
        status: encumbrance.status,
        registration_date: encumbrance.registration_date,
        updated_at: encumbrance.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Update encumbrance error:', error);
    
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
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update encumbrance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteEncumbrance = async (req: Request<{ encumbrance_id: string }>, res: Response) => {
  const { encumbrance_id } = req.params;
  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    const existingEncumbrance = await prisma.encumbrances.findUnique({
      where: { encumbrance_id },
      include: {
        land_parcel: {
          select: {
            upin: true,
            file_number: true,
          }
        }
      }
    });

    if (!existingEncumbrance) {
      return res.status(404).json({
        success: false,
        message: 'Encumbrance not found',
      });
    }

    if (existingEncumbrance.is_deleted) {
      return res.status(400).json({
        success: false,
        message: 'Encumbrance is already deleted',
      });
    }

    // Check if encumbrance is active and warn about deletion
    if (existingEncumbrance.status === 'ACTIVE') {
      // Optionally return a warning or require confirmation
      // For now, we'll proceed but note it in the audit log
    }

    const deletedEncumbrance = await prisma.encumbrances.update({
      where: { encumbrance_id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
        status: 'RELEASED', // Update status when deleted
      },
    });

    // Create audit log for encumbrance deletion
    await prisma.audit_logs.create({
      data: {
        user_id: actor?.user_id || null,
        action_type: AuditAction.DELETE,
        entity_type: 'encumbrances',
        entity_id: encumbrance_id,
        changes: {
          action: 'soft_delete_encumbrance',
          upin: existingEncumbrance.upin,
          parcel_file_number: existingEncumbrance.land_parcel?.file_number,
          type: existingEncumbrance.type,
          issuing_entity: existingEncumbrance.issuing_entity,
          reference_number: existingEncumbrance.reference_number,
          previous_status: existingEncumbrance.status,
          new_status: deletedEncumbrance.status,
          was_active_at_deletion: existingEncumbrance.status === 'ACTIVE',
          actor_id: actor?.user_id,
          actor_role: actor?.role,
          actor_username: actor?.username,
          deleted_at: deletedEncumbrance.deleted_at,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    // Also audit the parcel encumbrance removal
    await prisma.audit_logs.create({
      data: {
        user_id: actor?.user_id || null,
        action_type: AuditAction.UPDATE,
        entity_type: 'land_parcels',
        entity_id: existingEncumbrance.upin,
        changes: {
          action: 'remove_encumbrance_from_parcel',
          encumbrance_id,
          encumbrance_type: existingEncumbrance.type,
          issuing_entity: existingEncumbrance.issuing_entity,
          previous_status: existingEncumbrance.status,
          new_status: deletedEncumbrance.status,
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
      message: 'Encumbrance deleted successfully',
      data: {
        encumbrance_id: deletedEncumbrance.encumbrance_id,
        upin: deletedEncumbrance.upin,
        type: deletedEncumbrance.type,
        status: deletedEncumbrance.status,
        deleted_at: deletedEncumbrance.deleted_at,
        is_deleted: deletedEncumbrance.is_deleted,
      },
    });
  } catch (error: any) {
    console.error('Delete encumbrance error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Encumbrance not found',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to delete encumbrance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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