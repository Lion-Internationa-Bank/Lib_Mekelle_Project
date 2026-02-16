// src/controllers/parcelController.ts

import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';
import { 
  UserRole, 
  AuditAction, 
  ConfigCategory, 
  PaymentStatus, 
  EncumbranceStatus,
  EntityType,
  ActionType
} from '../generated/prisma/enums.ts';
import {type AuthRequest } from '../middlewares/authMiddleware.ts';
import { MakerCheckerService } from '../services/makerCheckerService.ts';
import { AuditService } from '../services/auditService.ts';

// Initialize services
const auditService = new AuditService();
const makerCheckerService = new MakerCheckerService(auditService);

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


// Define interfaces
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
  boundary_east?: any;
}

interface UpdateParcelBody {
  file_number?: string;
  sub_city_id?: string;
  tabia?: string;
  ketena?: string;
  block?: string;
  total_area_m2?: number;
  land_use?: string;
  land_grade?: number;
  tenure_type?: string;
  boundary_coords?: any;
  boundary_north?: any;
  boundary_south?: any;
  boundary_west?: any;
  boundary_east?: any;
  status?: string;
}

interface TransferOwnershipBody {
  from_owner_id?: string;
  to_owner_id: string;
  to_share_ratio: number;
  transfer_type: string;
  transfer_price?: number;
  reference_no?: string;
  document_id?: string;
}

interface AddParcelOwnerBody {
  owner_id: string;
  acquired_at?: string;
}

interface SubdivideParcelBody {
  childParcels: Array<{
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
  }>;
}

interface CreateEncumbranceBody {
  upin: string;
  type: string;
  issuing_entity: string;
  reference_number?: string;
  status?: EncumbranceStatus;
  registration_date?: string;
}

interface UpdateEncumbranceBody {
  type?: string;
  issuing_entity?: string;
  reference_number?: string;
  status?: EncumbranceStatus;
  registration_date?: string;
}

interface DeleteParcelBody {
  reason?: string;
}


// ---- CREATE PARCEL (Approval Request) ----

export const createParcel = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  
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
    if (!upin || !file_number || !tabia || !ketena || !block || !total_area_m2 || land_grade === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const subcityId = user.sub_city_id;
    
    if (!subcityId) {
      return res.status(400).json({
        success: false,
        message: "User must be assigned to a sub-city",
      });
    }

    // Check if sub_city exists
    const subCity = await prisma.sub_cities.findFirst({
      where: {
        sub_city_id: subcityId,
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

    // Create approval request instead of executing immediately
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'LAND_PARCELS',
      entityId: upin,
      actionType: 'CREATE',
      requestData: {
        upin,
        file_number,
        sub_city_id: subcityId,
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
        boundary_east
      },
      makerId: user.user_id,
      makerRole: user.role,
      subCityId: subcityId,
      comments: req.body.comments || `Request to create parcel ${upin}`
    });

    // Create audit log for request creation
    await prisma.audit_logs.create({
      data: {
        user_id: user.user_id,
        action_type: AuditAction.CREATE,
        entity_type: 'APPROVAL_REQUEST',
        changes: {
          action: 'create_parcel_request',
          upin,
          file_number,
          sub_city_id: subcityId,
          tabia,
          ketena,
          block,
          total_area_m2,
          request_status: 'PENDING',
          approver_role: user.role,
          actor_id: user.user_id,
          actor_role: user.role,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Parcel creation request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        upin,
        file_number,
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        estimated_processing: 'Within 24-48 hours'
      }
    });
  } catch (error: any) {
    console.error('Create parcel request error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A pending approval request already exists for this parcel',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create parcel approval request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// ---- UPDATE PARCEL (Approval Request) ----

export const updateParcel = async (req: AuthRequest, res: Response) => {
  const upin = req.params.upin as string;
  const data = req.body as UpdateParcelBody;
  const actor = req.user!;

  try {
    // Get ALL current parcel data
    const currentParcel = await prisma.land_parcels.findFirst({
      where: { 
        upin: upin, 
        is_deleted: false 
      },
      select: {
        upin: true,
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
        parent_upin: true,
        created_at: true,
        updated_at: true,
        sub_city: {
          select: {
            name: true
          }
        }
      }
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
    const changesForRequest: any = {};

    // Process and validate update fields
    for (const key in data) {
      if (allowedUpdates[key as keyof typeof allowedUpdates]) {
        const newValue = data[key as keyof UpdateParcelBody];
        const currentValue = currentParcel[key as keyof typeof currentParcel];
        
        // Skip if value is the same
        if (JSON.stringify(currentValue) === JSON.stringify(newValue)) {
          continue;
        }
        
        // Validation for specific fields
        if (key === 'sub_city_id' && newValue) {
          const subCityExists = await prisma.sub_cities.findFirst({
            where: {
              sub_city_id: newValue,
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
        
        if (key === 'file_number' && newValue && newValue !== currentParcel.file_number) {
          const existingFileNumber = await prisma.land_parcels.findFirst({
            where: {
              file_number: newValue,
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
        
        updates[key] = newValue;
        changesForAudit[key] = {
          from: currentValue,
          to: newValue
        };
        changesForRequest[key] = newValue;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes detected. The requested values are the same as current values.',
        data: {
          current_data: currentParcel,
          requested_changes: data
        }
      });
    }

    // Prepare complete original data for frontend
    const originalDataForRequest = {
      upin: currentParcel.upin,
      file_number: currentParcel.file_number,
      sub_city_id: currentParcel.sub_city_id,
      sub_city_name: currentParcel.sub_city?.name,
      tabia: currentParcel.tabia,
      ketena: currentParcel.ketena,
      block: currentParcel.block,
      total_area_m2: currentParcel.total_area_m2,
      land_use: currentParcel.land_use,
      land_grade: currentParcel.land_grade,
      tenure_type: currentParcel.tenure_type,
      boundary_coords: currentParcel.boundary_coords,
      boundary_north: currentParcel.boundary_north,
      boundary_south: currentParcel.boundary_south,
      boundary_west: currentParcel.boundary_west,
      boundary_east: currentParcel.boundary_east,
      status: currentParcel.status,
      parent_upin: currentParcel.parent_upin,
      created_at: currentParcel.created_at,
      updated_at: currentParcel.updated_at
    };

    // Create approval request
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'LAND_PARCELS',
      entityId: upin,
      actionType: 'UPDATE',
      requestData: {
        // Only the changed fields
        changes: changesForRequest,
        // Complete original data
        current_data: originalDataForRequest
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id || undefined,
      comments: req.body.comments || `Request to update parcel ${upin}`
    });

    // Create audit log for update request
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.UPDATE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest!.request_id,
        changes: {
          action: 'update_parcel_request',
          upin,
          changed_fields: Object.keys(changesForAudit),
          changes_detail: changesForAudit,
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest!.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: req.ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Parcel update request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest!.request_id,
        upin,
        changes_requested: Object.keys(changesForAudit),
        original_data_summary: {
          file_number: currentParcel.file_number,
          sub_city: currentParcel.sub_city?.name,
          total_area_m2: currentParcel.total_area_m2,
          status: currentParcel.status
        },
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest!.approver_role,
        estimated_processing: 'Within 24-48 hours'
      }
    });
  } catch (error: any) {
    console.error('Update parcel request error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Parcel not found' 
      });
    }

    if (error.message?.includes("pending approval request already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create parcel update request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
;

// ---- DELETE PARCEL (Approval Request) ----

export const deleteParcel = async (req: AuthRequest, res: Response) => {
  const  upin  = req.params as string ;
  const data = req.body as DeleteParcelBody;
  const actor = (req as any).user;

  try {
    // Get current parcel data for validation
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

    // Validate deletion constraints (for information purposes)
    const validationChecks = await Promise.all([
      // Check if parcel has active owners
      prisma.parcel_owners.count({
        where: { 
          upin, 
          is_active: true,
          is_deleted: false,
        },
      }),
      // Check if parcel has active billing records
      prisma.billing_records.count({
        where: { 
          upin, 
          is_deleted: false,
          payment_status: { in: [PaymentStatus.UNPAID, PaymentStatus.OVERDUE] }
        },
      }),
      // Check if parcel has child parcels
      prisma.land_parcels.count({
        where: { 
          parent_upin: upin,
          is_deleted: false
        }
      }),
      // Check if parcel has active lease
      prisma.lease_agreements.count({
        where: { 
          upin,
          is_deleted: false,
          status: 'ACTIVE'
        }
      }),
      // Check if parcel has active encumbrances
      prisma.encumbrances.count({
        where: { 
          upin,
          is_deleted: false,
          status: 'ACTIVE'
        }
      })
    ]);

    const [activeOwners, activeBilling, childParcels, activeLease, activeEncumbrances] = validationChecks;

    // Create approval request
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'LAND_PARCELS',
      entityId: upin,
      actionType: 'DELETE',
      requestData: {
        reason: data.reason,
        parcel_details: {
          file_number: currentParcel.file_number,
          sub_city_id: currentParcel.sub_city_id,
          total_area_m2: currentParcel.total_area_m2,
          status: currentParcel.status
        },
        validation_checks: {
          active_owners: activeOwners,
          active_billing: activeBilling,
          child_parcels: childParcels,
          active_lease: activeLease,
          active_encumbrances: activeEncumbrances,
          can_delete: (
            activeOwners === 0 &&
            activeBilling === 0 &&
            childParcels === 0 &&
            activeLease === 0 &&
            activeEncumbrances === 0
          )
        }
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id,
      comments: data.reason || `Request to delete parcel ${upin}`
    });

    // Create audit log for delete request
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.DELETE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest.request_id,
        changes: {
          action: 'delete_parcel_request',
          upin,
          original_file_number: currentParcel.file_number,
          reason: data.reason,
          validation_checks: {
            active_owners: activeOwners,
            active_billing: activeBilling,
            child_parcels: childParcels,
            active_lease: activeLease,
            active_encumbrances: activeEncumbrances
          },
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          actor_username: actor.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Parcel deletion request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        upin,
        original_file_number: currentParcel.file_number,
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        estimated_processing: 'Within 24-48 hours',
        validation_warnings: {
          has_active_owners: activeOwners > 0,
          has_unpaid_bills: activeBilling > 0,
          has_child_parcels: childParcels > 0,
          has_active_lease: activeLease > 0,
          has_active_encumbrances: activeEncumbrances > 0
        }
      }
    });
  } catch (error: any) {
    console.error('Delete parcel request error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Parcel not found' 
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A pending approval request already exists for this parcel deletion'
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create parcel deletion request',
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
  req: AuthRequest,
  res: Response
) => {
  try {
    const  upin  = req.params.upin as string;

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
            demarcation_fee:true,
            engineering_service_fee:true,
            contract_registration_fee:true,
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



// ---- TRANSFER OWNERSHIP (Approval Request) ----

export const transferOwnership = async (
  req: AuthRequest,
  res: Response
) => {
  const actor = (req as any).user;
  const { upin } = req.params; 
  const {
    from_owner_id,
    to_owner_id,
    transfer_type,
    transfer_price,
    reference_no,
  } = req.body;

  try {
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

    // Check if parcel exists
    const parcel = await prisma.land_parcels.findFirst({
      where: { upin, is_deleted: false },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    // Check if TO owner exists
    const toOwner = await prisma.owners.findUnique({
      where: { owner_id: to_owner_id, is_deleted: false },
    });

    if (!toOwner) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    // Check if FROM owner exists and is active (if specified)
    let fromOwner = null;
    if (from_owner_id) {
      fromOwner = await prisma.owners.findUnique({
        where: { owner_id: from_owner_id, is_deleted: false },
      });

      if (!fromOwner) {
        return res.status(404).json({
          success: false,
          message: "Seller not found",
        });
      }

      // Check if FROM owner is currently an owner of the parcel
      const isCurrentOwner = await prisma.parcel_owners.findFirst({
        where: {
          upin:upin,
          owner_id: from_owner_id,
          is_active: true,
          is_deleted: false,
        },
      });

      if (!isCurrentOwner) {
        return res.status(400).json({
          success: false,
          message: "Seller is not currently an active owner of this parcel",
        });
      }
    }

    // Create approval request
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.LAND_PARCELS,
      entityId: upin as string,
      actionType: ActionType.TRANSFER,
      requestData: {
        from_owner_id,
        to_owner_id,
        transfer_type,
        transfer_price,
        reference_no,
        parcel_details: {
          upin: parcel.upin,
          file_number: parcel.file_number,
          current_tenure_type: parcel.tenure_type
        },
        owner_details: {
          from_owner_name: fromOwner?.full_name,
          to_owner_name: toOwner.full_name
        }
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id,
      comments: `Request to transfer ownership of parcel ${upin}`
    });

    // Create audit log for transfer request
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.UPDATE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest.request_id,
        changes: {
          action: 'transfer_ownership_request',
          upin,
          from_owner_id,
          from_owner_name: fromOwner?.full_name,
          to_owner_id,
          to_owner_name: toOwner.full_name,
          transfer_type,
          transfer_price,
          reference_no,
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          actor_username: actor.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Ownership transfer request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        upin,
        transfer_type,
        from_owner_id,
        from_owner_name: fromOwner?.full_name,
        to_owner_id,
        to_owner_name: toOwner.full_name,
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        estimated_processing: 'Within 24-48 hours',
        notes: transfer_type !== "HEREDITY" ? 'Will update parcel tenure to LEASE' : 'Heredity transfer - tenure unchanged'
      }
    });
  } catch (error: any) {
    console.error("Transfer ownership request error:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A pending approval request already exists for this ownership transfer"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create ownership transfer request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ---- ADD PARCEL OWNER (Approval Request) ----

export const addParcelOwner = async (req: Request, res: Response) => {
  const { upin } = req.params as { upin: string };
  const { owner_id, acquired_at } = req.body as AddParcelOwnerBody;
  const actor = (req as any).user;

  try {
    // 1. Required field validation
    if (!owner_id?.trim()) {
      return res.status(400).json({
        success: false,
        message: "owner_id is required",
      });
    }

    // 2. Get complete parcel information
    const parcel = await prisma.land_parcels.findUnique({
      where: { upin, is_deleted: false },
      select: {
        upin: true,
        file_number: true,
        tabia: true,
        ketena: true,
        block: true,
        total_area_m2: true,
        land_use: true,
        land_grade: true,
        tenure_type: true,
        status: true,
        sub_city: {
          select: {
            name: true
          }
        }
      }
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    // 3. Get complete owner information
    const owner = await prisma.owners.findUnique({
      where: { owner_id, is_deleted: false },
      select: {
        owner_id: true,
        full_name: true,
        national_id: true,
        tin_number: true,
        phone_number: true,
        sub_city: {
          select: {
            name: true
          }
        }
      }
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    // 4. Check existing active owners with their details
    const existingParcelOwners = await prisma.parcel_owners.findMany({
      where: {
        upin,
        is_deleted: false,
        is_active: true,
        retired_at: null,
      },
      select: {
        owner: {
          select: {
            full_name: true,
            national_id: true
          }
        },
        acquired_at: true
      }
    });

    const isFirstOwner = existingParcelOwners.length === 0;

    // 5. Determine acquired_at date
    const acquiredDate = acquired_at ? new Date(acquired_at) : new Date();
    
    if (acquiredDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Acquisition date cannot be in the future',
      });
    }

    if (isFirstOwner && acquiredDate < new Date('1900-01-01')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid acquisition date for first owner',
      });
    }

    // 6. Create approval request with complete data
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.LAND_PARCELS,
      entityId: upin,
      actionType: ActionType.ADD_OWNER,
      requestData: {
        owner_id,
        acquired_at: acquiredDate.toISOString(),
        is_first_owner: isFirstOwner,
        parcel_details: {
          upin: parcel.upin,
          file_number: parcel.file_number,
          tabia: parcel.tabia,
          ketena: parcel.ketena,
          block: parcel.block,
          total_area_m2: parcel.total_area_m2,
          land_use: parcel.land_use,
          land_grade: parcel.land_grade,
          tenure_type: parcel.tenure_type,
          status: parcel.status,
          sub_city_name: parcel.sub_city?.name
        },
        owner_details: {
          full_name: owner.full_name,
          national_id: owner.national_id,
          tin_number: owner.tin_number,
          phone_number: owner.phone_number,
          owner_sub_city: owner.sub_city?.name
        },
        existing_owners: existingParcelOwners.map(po => ({
          full_name: po.owner.full_name,
          national_id: po.owner.national_id,
          acquired_at: po.acquired_at
        }))
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id,
      comments: req.body.comments || `Request to add owner ${owner.full_name} to parcel ${upin}`
    });

    // Create audit log for add owner request
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.CREATE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest.request_id,
        changes: {
          action: 'add_parcel_owner_request',
          upin,
          owner_id,
          owner_name: owner.full_name,
          is_first_owner: isFirstOwner,
          acquired_at: acquiredDate.toISOString(),
          existing_owners_count: existingParcelOwners.length,
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          actor_username: actor.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: isFirstOwner 
        ? 'First owner addition request submitted for approval' 
        : 'Co-owner addition request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        upin,
        owner_id,
        owner_name: owner.full_name,
        is_first_owner: isFirstOwner,
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        estimated_processing: 'Within 24-48 hours'
      }
    });
  } catch (error: any) {
    console.error("Add parcel owner request error:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A pending approval request already exists for this owner addition"
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create add owner request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ---- SUBDIVIDE PARCEL (Approval Request) ----

export const subdivideParcel = async (req: AuthRequest, res: Response) => {
  const { upin } = req.params as { upin: string };
  const actor = (req as any).user;
  const { childParcels } = req.body as SubdivideParcelBody;

  try {
    // Validate child parcels
    if (!Array.isArray(childParcels) || childParcels.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two child parcels are required',
      });
    }

    // Get parent parcel for validation
    const parent = await prisma.land_parcels.findUnique({
      where: { upin, is_deleted: false },
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

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent parcel not found',
      });
    }

    if (parent.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Only active parcels can be subdivided',
      });
    }

    // Validate child parcels
    for (const childData of childParcels) {
      if (!childData.upin?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Child UPIN is required',
        });
      }
      if (!childData.file_number?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Child file number is required',
        });
      }
      if (!childData.total_area_m2 || Number(childData.total_area_m2) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Child area must be greater than 0',
        });
      }
      
      // Check for duplicate UPIN
      const existingParcel = await prisma.land_parcels.findUnique({
        where: { upin: childData.upin },
      });
      
      if (existingParcel) {
        return res.status(409).json({
          success: false,
          message: `UPIN already exists: ${childData.upin}`,
        });
      }
    }

    // Area validation
    const totalChildArea = childParcels.reduce(
      (sum: number, c) => sum + Number(c.total_area_m2), 
      0
    );
    const parentArea = Number(parent.total_area_m2);
    
    if (Math.abs(totalChildArea - parentArea) > 0.1) {
      return res.status(400).json({
        success: false,
        message: 'Total child areas must match parent area (within 0.1 m² tolerance)',
      });
    }

    // Create approval request
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'LAND_PARCELS',
      entityId: upin,
      actionType: 'SUBDIVIDE',
      requestData: {
        childParcels: childParcels.map(p => ({
          ...p,
          // Add placeholder for documents
          documents: [] // Will be populated by document uploads
        })),
        parent_details: {
          upin: parent.upin,
          file_number: parent.file_number,
          total_area_m2: parent.total_area_m2,
          owners_count: parent.owners.length,
          tenure_type: parent.tenure_type
        },
        validation: {
          parent_area: parentArea,
          total_child_area: totalChildArea,
          area_match: Math.abs(totalChildArea - parentArea) <= 0.1
        },
        // Store list of all parcels for document association
        parcels: [
          { upin: parent.upin, type: 'PARENT', file_number: parent.file_number },
          ...childParcels.map(p => ({ 
            upin: p.upin, 
            type: 'CHILD', 
            file_number: p.file_number 
          }))
        ]
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id,
      comments: req.body.comments || `Request to subdivide parcel ${upin} into ${childParcels.length} parcels`
    });

    // Create audit log for subdivision request
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.UPDATE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest.request_id,
        changes: {
          action: 'subdivide_parcel_request',
          parent_upin: upin,
          parent_area: parentArea,
          child_count: childParcels.length,
          total_child_area: totalChildArea,
          owners_to_copy: parent.owners.length,
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          actor_username: actor.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: req.ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Parcel subdivision request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        parent_upin: upin,
        child_count: childParcels.length,
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        estimated_processing: 'Within 24-48 hours',
        notes: 'Parent will be retired, children will be created with copied owners'
      }
    });
  } catch (error: any) {
    console.error("Subdivision request error:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A pending approval request already exists for this subdivision"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create subdivision request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


export const createEncumbrance = async (
  req: Request<{}, {}, CreateEncumbranceBody>,
  res: Response
) => {
  const actor = (req as any).user;

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

    // Create approval request instead of executing immediately
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'ENCUMBRANCES',
      entityId: `${upin}_${type}_${issuing_entity}`, // Unique identifier for the request
      actionType: 'CREATE',
      requestData: {
        upin,
        type,
        issuing_entity,
        reference_number,
        status: status || EncumbranceStatus.ACTIVE,
        registration_date: registration_date ? new Date(registration_date) : new Date(),
        parcel_file_number: parcel.file_number,
        parcel_sub_city_id: parcel.sub_city_id
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id,
      comments: `Request to create ${type} encumbrance for parcel ${upin}`
    });

    // Create audit log for request creation
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.CREATE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest.request_id,
        changes: {
          action: 'create_encumbrance_request',
          upin,
          type,
          issuing_entity,
          reference_number,
          status: status || EncumbranceStatus.ACTIVE,
          registration_date: registration_date ? new Date(registration_date).toISOString() : new Date().toISOString(),
          parcel_file_number: parcel.file_number,
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          actor_username: actor.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Encumbrance creation request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        upin,
        type,
        issuing_entity,
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        estimated_processing: 'Within 24-48 hours'
      }
    });
  } catch (error: any) {
    console.error('Create encumbrance request error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A pending approval request already exists for this encumbrance',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create encumbrance approval request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const updateEncumbrance = async (
  req: AuthRequest,
  res: Response
) => {
  const encumbrance_id = req.params.encumbrance_id as string;
  const { type, issuing_entity, reference_number, status, registration_date } = req.body;
  const actor = req.user!;

  try {
    // Validate at least one field is provided
    if (!type && !issuing_entity && !reference_number && !status && !registration_date) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update',
      });
    }

    // Get ALL current encumbrance data
    const currentEncumbrance = await prisma.encumbrances.findUnique({
      where: { 
        encumbrance_id,
        is_deleted: false 
      },
      select: {
        encumbrance_id: true,
        upin: true,
        type: true,
        issuing_entity: true,
        reference_number: true,
        status: true,
        registration_date: true,
        created_at: true,
        updated_at: true,
        land_parcel: {
          select: {
            upin: true,
            file_number: true,
            sub_city: {
              select: {
                name: true
              }
            }
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

    // Prepare updates and track changes
    const updates: any = {};
    const changesForAudit: any = {};
    const changesForRequest: any = {};

    // Check reference number uniqueness if changing
    if (reference_number !== undefined && reference_number !== currentEncumbrance.reference_number) {
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
      updates.reference_number = reference_number;
      changesForAudit.reference_number = {
        from: currentEncumbrance.reference_number,
        to: reference_number
      };
      changesForRequest.reference_number = reference_number;
    }

    if (type && type !== currentEncumbrance.type) {
      updates.type = type;
      changesForAudit.type = {
        from: currentEncumbrance.type,
        to: type
      };
      changesForRequest.type = type;
    }

    if (issuing_entity && issuing_entity !== currentEncumbrance.issuing_entity) {
      updates.issuing_entity = issuing_entity;
      changesForAudit.issuing_entity = {
        from: currentEncumbrance.issuing_entity,
        to: issuing_entity
      };
      changesForRequest.issuing_entity = issuing_entity;
    }

    if (status && status !== currentEncumbrance.status) {
      updates.status = status;
      changesForAudit.status = {
        from: currentEncumbrance.status,
        to: status
      };
      changesForRequest.status = status;
    }

    if (registration_date) {
      const newDate = new Date(registration_date);
      if (newDate.getTime() !== currentEncumbrance.registration_date.getTime()) {
        updates.registration_date = newDate;
        changesForAudit.registration_date = {
          from: currentEncumbrance.registration_date,
          to: newDate
        };
        changesForRequest.registration_date = newDate.toISOString();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes detected. The requested values are the same as current values.',
        data: {
          current_data: currentEncumbrance,
          requested_changes: req.body
        }
      });
    }

    // Prepare complete original data for frontend
    const originalDataForRequest = {
      encumbrance_id: currentEncumbrance.encumbrance_id,
      upin: currentEncumbrance.upin,
      type: currentEncumbrance.type,
      issuing_entity: currentEncumbrance.issuing_entity,
      reference_number: currentEncumbrance.reference_number,
      status: currentEncumbrance.status,
      registration_date: currentEncumbrance.registration_date.toISOString(),
      created_at: currentEncumbrance.created_at,
      updated_at: currentEncumbrance.updated_at,
      parcel_file_number:currentEncumbrance.land_parcel.file_number,
      parcle_sub_city_name:currentEncumbrance.land_parcel.sub_city.name,
    };

    // Create approval request
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'ENCUMBRANCES',
      entityId: encumbrance_id,
      actionType: 'UPDATE',
      requestData: {
        // Only the changed fields
        changes: changesForRequest,
        // Complete original data
        current_data: originalDataForRequest
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id || undefined,
      comments: req.body.comments || `Request to update encumbrance ${encumbrance_id}`
    });

    // Create audit log for update request
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.UPDATE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest!.request_id,
        changes: {
          action: 'update_encumbrance_request',
          encumbrance_id,
          upin: currentEncumbrance.upin,
          changed_fields: Object.keys(changesForAudit),
          changes_detail: changesForAudit,
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest!.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: req.ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Encumbrance update request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest!.request_id,
        encumbrance_id,
        upin: currentEncumbrance.upin,
        changes_requested: Object.keys(changesForAudit),
        original_data_summary: {
          type: currentEncumbrance.type,
          issuing_entity: currentEncumbrance.issuing_entity,
          status: currentEncumbrance.status
        },
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest!.approver_role,
        estimated_processing: 'Within 24-48 hours'
      }
    });
  } catch (error: any) {
    console.error('Update encumbrance request error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Encumbrance not found',
      });
    }

    if (error.message?.includes("pending approval request already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create encumbrance update request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteEncumbrance = async (req: AuthRequest, res: Response) => {
  const  encumbrance_id  = req.params as string;
  const { reason } = req.body;
  const actor = (req as any).user;

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

    // Create approval request for deletion
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'ENCUMBRANCES',
      entityId: encumbrance_id,
      actionType: 'DELETE',
      requestData: {
        encumbrance_details: {
          upin: existingEncumbrance.upin,
          type: existingEncumbrance.type,
          issuing_entity: existingEncumbrance.issuing_entity,
          reference_number: existingEncumbrance.reference_number,
          status: existingEncumbrance.status,
          registration_date: existingEncumbrance.registration_date,
          parcel_file_number: existingEncumbrance.land_parcel?.file_number
        },
        reason: reason || 'No reason provided',
        new_status: 'RELEASED'
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id,
      comments: reason || `Request to delete encumbrance ${encumbrance_id}`
    });

    // Create audit log for deletion request
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.DELETE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest.request_id,
        changes: {
          action: 'delete_encumbrance_request',
          encumbrance_id,
          upin: existingEncumbrance.upin,
          type: existingEncumbrance.type,
          issuing_entity: existingEncumbrance.issuing_entity,
          reference_number: existingEncumbrance.reference_number,
          current_status: existingEncumbrance.status,
          proposed_status: 'RELEASED',
          is_active_at_request: existingEncumbrance.status === 'ACTIVE',
          reason: reason || 'No reason provided',
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          actor_username: actor.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Encumbrance deletion request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        encumbrance_id,
        upin: existingEncumbrance.upin,
        type: existingEncumbrance.type,
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        warning: existingEncumbrance.status === 'ACTIVE' 
          ? 'This encumbrance is currently ACTIVE. Deletion will mark it as RELEASED.'
          : undefined,
        estimated_processing: 'Within 24-48 hours'
      }
    });
  } catch (error: any) {
    console.error('Delete encumbrance request error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Encumbrance not found',
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A pending approval request already exists for this encumbrance deletion'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create encumbrance deletion request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getEncumbrancesByParcel = async (req: AuthRequest, res: Response) => {
  try {
    const upin  = req.params as string;

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



