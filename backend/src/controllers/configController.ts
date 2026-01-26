// src/controllers/configController.ts
import { type Request, type Response } from 'express';
import prisma from '../config/prisma.ts';
import { ConfigCategory ,AuditAction} from '../generated/prisma/enums.ts';
import {type AuthRequest  } from '../middlewares/authMiddleware.ts';

const CONFIG_KEYS: Record<ConfigCategory, string> = {
  LAND_TENURE: 'land_tenure_options',
  LAND_USE: 'land_use_options',
  ENCUMBRANCE_TYPE: 'encumbrance_type_options',
  TRANSFER_TYPE: 'transfer_type_options',
  REVENUE_TYPE: 'revenue_type_options',
  DOCUMENT_TYPE: 'document_type_options',
  PAYMENT_METHOD: 'payment_method_options',
  GENERAL: 'general_options',
  REVENUE_RATES: 'revenue_rates',
};

// Helper to get config by category
const getConfigByCategory = async (category: ConfigCategory) => {
  const key = CONFIG_KEYS[category];
  return await prisma.configurations.findUnique({
    where: { key },
  });
};

// GET /api/v1/city-admin/configs/:category
export const getConfig = async (req: Request<{ category: ConfigCategory }>, res: Response) => {
  const { category } = req.params;

  const config = await getConfigByCategory(category);

  if (!config) {
    return res.status(404).json({ message: `No configuration found for ${category}` });
  }

  res.json({
    category,
    key: config.key,
    options: config.value,
    description: config.description,
    is_active: config.is_active,
  });
};

// POST /api/v1/city-admin/configs/:category

export const createOrUpdateConfig = async (
  req: AuthRequest & { params: { category: ConfigCategory } },
  res: Response
) => {
  const { category } = req.params;
  const { options, description, is_active } = req.body;
  const actor = req.user!;

  const key = CONFIG_KEYS[category]; 

  if (!key) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid configuration key' 
    });
  }

  try {
    // Check if config exists
    const existingConfig = await prisma.configurations.findUnique({
      where: { 
        key,
        is_deleted: false 
      }
    });

    const updated = await prisma.configurations.upsert({
      where: { key },
      update: {
        value: options,
        description: description !== undefined ? description : undefined,
        is_active: is_active !== undefined ? is_active : undefined,
        updated_at: new Date(),
      },
      create: {
        key,
        value: options,
        category,
        description: description || null,
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    // Create audit log for config change
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.CONFIG_CHANGE,
        entity_type: 'configurations',
        entity_id: updated.config_id,
        changes: {
          action: existingConfig ? 'update_config' : 'create_config',
          category,
          key,
          previous_value: existingConfig?.value || null,
          new_value: options,
          previous_description: existingConfig?.description || null,
          new_description: description || null,
          previous_is_active: existingConfig?.is_active || null,
          new_is_active: is_active !== undefined ? is_active : updated.is_active,
          actor_id: actor.user_id,
          actor_role: actor.role,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: req.ip || req.socket.remoteAddress,
      },
    });

    res.status(200).json({
      success: true,
      message: `Configuration ${existingConfig ? 'updated' : 'created'} successfully`,
      data: {
        config_id: updated.config_id,
        category: updated.category,
        key: updated.key,
        value: updated.value,
        description: updated.description,
        is_active: updated.is_active,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Config update error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Configuration key already exists'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Sub-city Controllers

// GET /api/v1/city-admin/sub-cities
export const getSubCities = async (_req: AuthRequest, res: Response) => {
  const subCities = await prisma.sub_cities.findMany({
    where: { is_deleted: false },
    select: {
      sub_city_id: true,
      name: true,
      description: true,
      created_at: true,
    },
    orderBy: { name: 'asc' },
  });

  res.json({ sub_cities: subCities });
};

// POST /api/v1/city-admin/sub-cities
export const createSubCity = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const actor = req.user!;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Sub-city name is required'
    });
  }

  try {
    const subCity = await prisma.sub_cities.create({
      data: {
        name,
        description: description || null,
      },
    });

    // Create audit log for sub-city creation
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.CREATE,
        entity_type: 'sub_cities',
        entity_id: subCity.sub_city_id,
        changes: {
          action: 'create_sub_city',
          name: subCity.name,
          description: subCity.description,
          actor_id: actor.user_id,
          actor_role: actor.role,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: req.ip || req.socket.remoteAddress,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Sub-city created successfully',
      data: {
        sub_city_id: subCity.sub_city_id,
        name: subCity.name,
        description: subCity.description,
        created_at: subCity.created_at,
        updated_at: subCity.updated_at,
        is_deleted: subCity.is_deleted,
      },
    });
  } catch (error: any) {
    console.error('Create sub-city error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Sub-city name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create sub-city',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// PATCH /api/v1/city-admin/sub-cities/:id
export const updateSubCity = async (req: AuthRequest & { params: { id: string } }, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const actor = req.user!;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Sub-city ID is required'
    });
  }

  try {
    // Get current sub-city data for audit log
    const currentSubCity = await prisma.sub_cities.findUnique({
      where: { 
        sub_city_id: id,
        is_deleted: false 
      }
    });

    if (!currentSubCity) {
      return res.status(404).json({
        success: false,
        message: 'Sub-city not found'
      });
    }

    const updated = await prisma.sub_cities.update({
      where: { 
        sub_city_id: id,
        is_deleted: false 
      },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        updated_at: new Date(),
      },
    });

    // Create audit log for sub-city update
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.UPDATE,
        entity_type: 'sub_cities',
        entity_id: updated.sub_city_id,
        changes: {
          action: 'update_sub_city',
          previous_name: currentSubCity.name,
          new_name: updated.name,
          previous_description: currentSubCity.description,
          new_description: updated.description,
          actor_id: actor.user_id,
          actor_role: actor.role,
          
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: req.ip || req.socket.remoteAddress,
      },
    });

    res.json({
      success: true,
      message: 'Sub-city updated successfully',
      data: {
        sub_city_id: updated.sub_city_id,
        name: updated.name,
        description: updated.description,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
        is_deleted: updated.is_deleted,
      },
    });
  } catch (error: any) {
    console.error('Update sub-city error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Sub-city not found'
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Sub-city name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update sub-city',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE /api/v1/city-admin/sub-cities/:id (soft delete)
export const deleteSubCity = async (req: AuthRequest & { params: { id: string } }, res: Response) => {
  const { id } = req.params;
  const actor = req.user!;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Sub-city ID is required'
    });
  }

  try {
    // Get current sub-city data for audit log
    const currentSubCity = await prisma.sub_cities.findUnique({
      where: { 
        sub_city_id: id,
        is_deleted: false 
      }
    });

    if (!currentSubCity) {
      return res.status(404).json({
        success: false,
        message: 'Sub-city not found'
      });
    }

    // Check if there are active users in this sub-city
    const activeUsers = await prisma.users.count({
      where: {
        sub_city_id: id,
        is_deleted: false,
        is_active: true
      }
    });

    if (activeUsers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete sub-city with ${activeUsers} active user(s). Deactivate or transfer users first.`
      });
    }

    // Check if there are land parcels in this sub-city
    const landParcels = await prisma.land_parcels.count({
      where: {
        sub_city_id: id,
        is_deleted: false
      }
    });

    if (landParcels > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete sub-city with ${landParcels} land parcel(s). Transfer parcels first.`
      });
    }

    const deletedSubCity = await prisma.sub_cities.update({
      where: { sub_city_id: id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
        name: `${currentSubCity.name}_deleted_${Date.now()}`, // Modify name to allow reuse
      },
    });

    // Create audit log for sub-city deletion
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.DELETE,
        entity_type: 'sub_cities',
        entity_id: deletedSubCity.sub_city_id,
        changes: {
          action: 'soft_delete_sub_city',
          original_name: currentSubCity.name,
          new_name: deletedSubCity.name,
          description: currentSubCity.description,
          actor_id: actor.user_id,
          actor_role: actor.role,
          active_users_count: activeUsers,
          land_parcels_count: landParcels,
          deleted_at: deletedSubCity.deleted_at,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: req.ip || req.socket.remoteAddress,
      },
    });

    res.json({
      success: true,
      message: 'Sub-city soft deleted successfully',
      data: {
        sub_city_id: deletedSubCity.sub_city_id,
        original_name: currentSubCity.name,
        new_name: deletedSubCity.name,
        deleted_at: deletedSubCity.deleted_at,
        is_deleted: deletedSubCity.is_deleted,
      }
    });
  } catch (error: any) {
    console.error('Delete sub-city error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Sub-city not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete sub-city',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};