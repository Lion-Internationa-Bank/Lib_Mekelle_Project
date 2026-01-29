import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';
import { 
  AuditAction, 
} from '../generated/prisma/enums.ts';
import {type AuthRequest } from '../middlewares/authMiddleware.ts';


export const createOwner = async (req: Request, res: Response) => {
  const actor = (req as any).user; // Assuming AuthRequest extends Request
  
  const {
    full_name,
    national_id,
    tin_number,
    phone_number,
    upin,           // parcel UPIN to link
    acquired_at,    // optional
  } = req.body;

  try {
    // 1. BASIC INPUT VALIDATION
    if (!upin) {
      return res.status(400).json({
        success: false,
        message: 'UPIN is required to link owner to parcel',
      });
    }

    if (!full_name || !national_id || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'full_name, national_id, and phone_number are required',
      });
    }

    // 2. TRANSACTION: Everything inside transaction
    const result = await prisma.$transaction(async (tx) => {
      // **STEP 1: Check parcel exists**
      const parcel = await tx.land_parcels.findUnique({
        where: { 
          upin,
          is_deleted: false 
        },
      });

      if (!parcel) {
        throw new Error('PARCEL_NOT_FOUND');
      }

      // **STEP 2: Check current active owners**
      const activeOwners = await tx.parcel_owners.findMany({
        where: { 
          upin, 
          is_active: true,
          is_deleted: false,
        },
      });

      // **STEP 3: Create owner**
      const owner = await tx.owners.create({
        data: {
          full_name,
          national_id,
          tin_number,
          phone_number,
        },
      });

      // **STEP 4: Link to parcel**
      const parcelOwner = await tx.parcel_owners.create({
        data: {
          upin,
          owner_id: owner.owner_id,
          acquired_at: acquired_at ? new Date(acquired_at) : new Date(),
          is_active: true,
        },
      });

      // **STEP 5: Create audit log for owner creation**
      await tx.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.CREATE,
          entity_type: 'owners',
          entity_id: owner.owner_id,
          changes: {
            action: 'create_owner_and_link_to_parcel',
            owner_id: owner.owner_id,
            full_name: owner.full_name,
            national_id: owner.national_id,
            tin_number: owner.tin_number,
            phone_number: owner.phone_number,
            linked_parcel_upin: upin,
            parcel_file_number: parcel.file_number,
            active_owners_count: activeOwners.length + 1,
            actor_id: actor?.user_id,
            actor_role: actor?.role,
            actor_username: actor?.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: (req as any).ip || req.socket.remoteAddress,
        },
      });

      // **STEP 6: Create audit log for parcel ownership addition**
      await tx.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.UPDATE,
          entity_type: 'land_parcels',
          entity_id: upin,
          changes: {
            action: 'add_owner_to_parcel',
            parcel_owner_id: parcelOwner.parcel_owner_id,
            owner_id: owner.owner_id,
            owner_name: owner.full_name,
            national_id: owner.national_id,
            acquired_at: parcelOwner.acquired_at,
            actor_id: actor?.user_id,
            actor_role: actor?.role,
            actor_username: actor?.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: (req as any).ip || req.socket.remoteAddress,
        },
      });

      return { 
        owner, 
        parcelOwner,
        activeOwnersBefore: activeOwners.length,
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Owner created and linked to parcel successfully',
      data: {
        owner_id: result.owner.owner_id,
        full_name: result.owner.full_name,
        national_id: result.owner.national_id,
        parcel_owner_id: result.parcelOwner.parcel_owner_id,
        upin: result.parcelOwner.upin,
        acquired_at: result.parcelOwner.acquired_at,
        created_at: result.owner.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create owner error:', error);

    const errorMessages: Record<string, string> = {
      PARCEL_NOT_FOUND: 'Parcel not found',
    };

    let message = errorMessages[error.message];
    
    if (!message) {
      if (error.code === 'P2002') {
        if (error.meta?.target === 'owners_national_id_key') {
          message = 'National ID already exists';
        } else if (error.meta?.target === 'owners_tin_number_key') {
          message = 'TIN number already exists';
        } else if (error.meta?.target?.includes('parcel_owners_upin_owner_id_acquired_at_key')) {
          message = 'Owner already linked to this parcel with the same acquisition date';
        } else {
          message = 'Duplicate record';
        }
      } else if (error.code === 'P2003') {
        message = 'Invalid parcel reference';
      } else if (error.message.includes('Share ratio violation')) {
        message = error.message;
      } else {
        message = 'Failed to create owner';
      }
    }

    const statusCode = errorMessages[error.message] || error.code === 'P2002' || error.message.includes('Share ratio violation') ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const onlyCreateOwner = async (req: Request, res: Response) => {
  const actor = (req as any).user; // Assuming AuthRequest extends Request
  
  const {
    full_name,
    national_id,
    tin_number,
    phone_number,
  } = req.body;

  try {
    if (!full_name || !national_id || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'full_name, national_id, and phone_number are required',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.owners.create({
        data: {
          full_name,
          national_id,
          tin_number,
          phone_number,
        },
      });

      // Create audit log for owner creation only
      await tx.audit_logs.create({
        data: {
          user_id: actor?.user_id || null,
          action_type: AuditAction.CREATE,
          entity_type: 'owners',
          entity_id: owner.owner_id,
          changes: {
            action: 'create_owner_only',
            owner_id: owner.owner_id,
            full_name: owner.full_name,
            national_id: owner.national_id,
            tin_number: owner.tin_number,
            phone_number: owner.phone_number,
            actor_id: actor?.user_id,
            actor_role: actor?.role,
            actor_username: actor?.username,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: (req as any).ip || req.socket.remoteAddress,
        },
      });

      return owner;
    });

    return res.status(201).json({
      success: true,
      message: 'Owner created successfully',
      data: {
        owner_id: result.owner_id,
        full_name: result.full_name,
        national_id: result.national_id,
        tin_number: result.tin_number,
        phone_number: result.phone_number,
        created_at: result.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create owner error:', error);
    
    if (error.code === 'P2002') {
      let message = 'Duplicate entry';
      if (error.meta?.target === 'owners_national_id_key') {
        message = 'National ID already exists';
      } else if (error.meta?.target === 'owners_tin_number_key') {
        message = 'TIN number already exists';
      }
      return res.status(409).json({
        success: false,
        message,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create owner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateOwner = async (req: Request<{ owner_id: string }>, res: Response) => {
  const { owner_id } = req.params;
  const { full_name, phone_number, tin_number, national_id } = req.body;
  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    // Get current owner data for audit log
    const currentOwner = await prisma.owners.findUnique({
      where: { 
        owner_id,
        is_deleted: false 
      },
    });

    if (!currentOwner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found',
      });
    }

    const updates: any = {};
    const changesForAudit: any = {};

    // Track changes for audit log
    if (full_name && full_name !== currentOwner.full_name) {
      updates.full_name = full_name;
      changesForAudit.full_name = {
        from: currentOwner.full_name,
        to: full_name
      };
    }

    if (phone_number !== undefined && phone_number !== currentOwner.phone_number) {
      updates.phone_number = phone_number;
      changesForAudit.phone_number = {
        from: currentOwner.phone_number,
        to: phone_number
      };
    }

    if (tin_number !== undefined && tin_number !== currentOwner.tin_number) {
      updates.tin_number = tin_number;
      changesForAudit.tin_number = {
        from: currentOwner.tin_number,
        to: tin_number
      };
    }

    if (national_id !== undefined && national_id !== currentOwner.national_id) {
      updates.national_id = national_id;
      changesForAudit.national_id = {
        from: currentOwner.national_id,
        to: national_id
      };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update or no changes detected',
      });
    }

    const owner = await prisma.owners.update({
      where: { owner_id },
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
          entity_type: 'owners',
          entity_id: owner_id,
          changes: {
            action: 'update_owner',
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
      message: 'Owner updated successfully',
      data: {
        owner_id: owner.owner_id,
        full_name: owner.full_name,
        national_id: owner.national_id,
        tin_number: owner.tin_number,
        phone_number: owner.phone_number,
        updated_at: owner.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Update owner error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Owner not found' 
      });
    }
    
    if (error.code === 'P2002') {
      let message = 'Duplicate entry';
      if (error.meta?.target === 'owners_national_id_key') {
        message = 'National ID already exists';
      } else if (error.meta?.target === 'owners_tin_number_key') {
        message = 'TIN number already exists';
      }
      return res.status(409).json({ 
        success: false, 
        message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update owner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteOwner = async (req: Request<{ owner_id: string }>, res: Response) => {
  const { owner_id } = req.params;
  const actor = (req as any).user; // Assuming AuthRequest extends Request

  try {
    // Get current owner data for audit log
    const currentOwner = await prisma.owners.findUnique({
      where: { owner_id },
      include: {
        parcels: {
          where: { is_active: true, is_deleted: false },
          select: { upin: true }
        }
      }
    });

    if (!currentOwner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found',
      });
    }

    if (currentOwner.is_deleted) {
      return res.status(400).json({
        success: false,
        message: 'Owner is already deleted',
      });
    }

    // Check if owner has active parcel ownership
    const activeOwnership = await prisma.parcel_owners.count({
      where: { 
        owner_id, 
        is_active: true,
        is_deleted: false,
      },
    });

    if (activeOwnership > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete owner with active parcel ownership',
        data: { active_parcels: activeOwnership }
      });
    }

    const deletedOwner = await prisma.owners.update({
      where: { owner_id },
      data: { 
        deleted_at: new Date(),
        is_deleted: true,
        updated_at: new Date(),
        national_id: `${currentOwner.national_id}_deleted_${Date.now()}`,
        tin_number: currentOwner.tin_number ? `${currentOwner.tin_number}_deleted_${Date.now()}` : null,
      },
    });

    // Create audit log for owner deletion
    await prisma.audit_logs.create({
      data: {
        user_id: actor?.user_id || null,
        action_type: AuditAction.DELETE,
        entity_type: 'owners',
        entity_id: owner_id,
        changes: {
          action: 'soft_delete_owner',
          full_name: currentOwner.full_name,
          original_national_id: currentOwner.national_id,
          new_national_id: deletedOwner.national_id,
          original_tin_number: currentOwner.tin_number,
          new_tin_number: deletedOwner.tin_number,
          phone_number: currentOwner.phone_number,
          active_parcels_at_deletion: activeOwnership,
          actor_id: actor?.user_id,
          actor_role: actor?.role,
          actor_username: actor?.username,
          deleted_at: deletedOwner.deleted_at,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Owner soft deleted successfully',
      data: { 
        owner_id: deletedOwner.owner_id,
        full_name: deletedOwner.full_name,
        original_national_id: currentOwner.national_id,
        new_national_id: deletedOwner.national_id,
        deleted_at: deletedOwner.deleted_at,
        is_deleted: deletedOwner.is_deleted,
      },
    });
  } catch (error: any) {
    console.error('Delete owner error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Owner not found' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete owner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getOwnersWithParcels = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 100);
    const skip = (page - 1) * limit;

    // Search term (optional)
    const search = req.query.search?.toString().trim() || '';

    // Build where condition
    const whereCondition: any = {
      is_deleted: false,
      ...(search && {
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { national_id: { contains: search, mode: 'insensitive' } },
          { phone_number: { contains: search, mode: 'insensitive' } },
        ],
      }),
      // Filter owners who have at least one parcel in the specified sub_city (if applicable)
      ...(user.sub_city_id && {
        parcels: {
          some: {
            is_active: true,
            is_deleted: false,
            parcel: {
              is_deleted: false,
              sub_city_id: user.sub_city_id,
            },
          },
        },
      }),
    };

    const [total, owners] = await prisma.$transaction([
      // Count total matching owners
      prisma.owners.count({
        where: whereCondition,
      }),

      // Fetch paginated owners with their active owned parcels
      prisma.owners.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { full_name: 'asc' },
        select: {
          owner_id: true,
          full_name: true,
          national_id: true,
          tin_number: true,
          phone_number: true,
          parcels: {
            where: {
              is_active: true,
              is_deleted: false,
              parcel: {
                is_deleted: false,
                // Apply sub_city filter to parcels as well
                ...(user.sub_city_id && { sub_city_id: user.sub_city_id }),
              },
            },
            select: {
              acquired_at: true,
              parcel: {
                select: {
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
                },
              },
            },
            orderBy: { acquired_at: 'desc' },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        owners,
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
  } catch (error: any) {
    console.error('Error fetching owners with parcels:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch owners and their land parcels',
      error: error.message,
    });
  }
};

export const searchOwnersLite = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const subcityId = user.sub_city_id;
    const search = req.query.search?.toString().trim() || '';
    const LIMIT = 10;

    // If user doesn't have a subcity assigned, return empty
    if (!subcityId) {
      return res.status(200).json({
        success: true,
        data: {
          owners: [],
        },
      });
    }

    // Find owner IDs that have parcels in this subcity
    const ownersInSubCity = await prisma.owners.findMany({
      where: {
        is_deleted: false,
        parcels: {
          some: {
            is_active: true,
            is_deleted: false,
            parcel: {
              is_deleted: false,
              sub_city_id: subcityId,
            },
          },
        },
        // Add search filter directly here to avoid second query
        ...(search && {
          OR: [
            { full_name: { contains: search, mode: 'insensitive' } },
            { national_id: { contains: search, mode: 'insensitive' } },
            { phone_number: { contains: search, mode: 'insensitive' } },
            { tin_number: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      take: LIMIT,
      orderBy: { full_name: 'asc' },
      select: {
        owner_id: true,
        full_name: true,
        national_id: true,
        phone_number: true,
        tin_number: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        owners: ownersInSubCity,
      },
    });
  } catch (error: any) {
    console.error('Error searching owners:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search owners',
      error: error.message,
    });
  }
};