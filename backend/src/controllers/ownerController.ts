import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';


export const createOwner = async (req: Request, res: Response) => {
  const {
    full_name,
    national_id,
    tin_number,
    phone_number,
    upin,           // parcel UPIN to link
    share_ratio,    // required
    acquired_at,    // optional
  } = req.body;

  try {
    // 1. BASIC INPUT VALIDATION (outside transaction)
    if (!upin) {
      return res.status(400).json({
        success: false,
        message: 'UPIN is required to link owner to parcel',
      });
    }

    if (!share_ratio || share_ratio <= 0 || share_ratio > 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid share_ratio (0.0-1.0) is required',
      });
    }

    // 2. ALL-OR-NOTHING: Everything inside transaction
    const result = await prisma.$transaction(async (tx) => {
      // **STEP 1: Check current active shares WITHIN transaction**
      const activeOwners = await tx.parcel_owners.findMany({
        where: { 
          upin, 
          is_active: true 
        },
      });

      const currentActiveShares = activeOwners.reduce(
        (sum, po) => sum + Number(po.share_ratio), 
        0
      );

      const newTotalShares = currentActiveShares + (share_ratio as number);

      // **VALIDATE inside transaction - ROLLBACK if violation**
      if (newTotalShares > 1.0) {
        throw new Error(
          `Share ratio violation: New total would be ${newTotalShares.toFixed(4)} > 1.0. ` +
          `Current active: ${currentActiveShares.toFixed(4)}, Adding: ${share_ratio}`
        );
      }

      // **STEP 2: Create owner**
      const owner = await tx.owners.create({
        data: {
          full_name,
          national_id,
          tin_number,
          phone_number,
        },
      });

      // **STEP 3: Link to parcel**
      const parcelOwner = await tx.parcel_owners.create({
        data: {
          upin,
          owner_id: owner.owner_id,
          share_ratio: share_ratio as number,
          acquired_at: acquired_at ? new Date(acquired_at) : new Date(),
        },
      });

      return { 
        owner, 
        parcelOwner,
        share_validation: {
          current_active_shares: currentActiveShares,
          added_share: share_ratio,
          new_total_shares: newTotalShares,
        }
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Owner created and linked to parcel successfully',
      data: {
        owner_id: result.owner.owner_id,
      },
    });
  } catch (error: any) {
    console.error('Create owner error:', error);
    
    // **Share ratio violation (thrown inside transaction)**
    if (error.message.includes('Share ratio violation')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    // **Constraint violations**
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: error.meta?.target === 'owners_national_id_key' 
          ? 'National ID already exists' 
          : 'Duplicate record',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create owner',
    });
  }
};



export const onlyCreateOwner= async (req: Request, res: Response) => {
  const {
    full_name,
    national_id,
    tin_number,
    phone_number,

  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.owners.create({
        data: {
          full_name,
          national_id,
          tin_number,
          phone_number,
        },
      });

      return owner;
    });

    return res.status(201).json({
      success: true,
      data: {
        owner_id: result.owner_id,
        owner: result,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create owner',
    });
  }
};



export const updateOwner = async (req: Request<{ owner_id: string }>, res: Response) => {
  try {
    const { owner_id } = req.params;
    const { full_name, phone_number, tin_number ,national_id} = req.body;

    const updates: any = {};
    if (full_name) updates.full_name = full_name;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (tin_number !== undefined) updates.tin_number = tin_number;
    if(national_id ! == undefined) updates.national_id =national_id;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    const owner = await prisma.owners.update({
      where: { owner_id },
      data: updates,
    });

    return res.status(200).json({
      success: true,
      message: 'Owner updated successfully',
      data: owner,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'TIN or National ID already exists' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update owner' });
  }
};

export const deleteOwner = async (req: Request<{ owner_id: string }>, res: Response) => {
  try {
    const { owner_id } = req.params;

    // Check if owner has active parcel ownership
    const activeOwnership = await prisma.parcel_owners.count({
      where: { owner_id, is_active: true },
    });
    console.log("activeOwnership",activeOwnership)

    if (activeOwnership > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete owner with active parcel ownership',
      });
    }

    await prisma.owners.update({
      where: { owner_id },
      data: { deleted_at: new Date(),
             is_deleted:true,
       }, // Soft delete
    });

    return res.status(200).json({
      success: true,
      message: 'Owner marked as deleted',
      data: { owner_id },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }
    return res.status(500).json({ success: false, message: 'Failed to delete owner' });
  }
};

export const getOwnersWithParcels = async (req: Request, res: Response) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 100);
    const skip = (page - 1) * limit;

    // Search term (optional)
    const search = req.query.search?.toString().trim() || '';

    // Build search condition for owners
    const ownerWhere: any = {
      is_deleted: false,
      ...(search && {
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { national_id: { contains: search, mode: 'insensitive' } },
          { phone_number: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, owners] = await prisma.$transaction([
      // Count total matching owners
      prisma.owners.count({
        where: ownerWhere,
      }),

      // Fetch paginated owners with their active owned parcels
      prisma.owners.findMany({
        where: ownerWhere,
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
              },
            },
            select: {
              share_ratio: true,
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
        owners, // Array of owners with their owned parcels
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

export const searchOwnersLite = async (req: Request, res: Response) => {
  try {
    // Search term
    const search = req.query.search?.toString().trim() || '';

    // Fixed limit for performance (auto-limited)
    const LIMIT = 10;

    // Build search condition
    const where: any = {
      is_deleted: false,
      ...(search && {
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { national_id: { contains: search, mode: 'insensitive' } },
          { phone_number: { contains: search, mode: 'insensitive' } },
          { tin_number: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const owners = await prisma.owners.findMany({
      where,
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
        owners, // Array of matching owners (max 50)
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