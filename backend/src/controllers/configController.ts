// src/controllers/configController.ts
import { type Request, type Response } from 'express';
import prisma from '../config/prisma.ts';
import { ConfigCategory, AuditAction, ActionType, EntityType } from '../generated/prisma/enums.ts';
import { type AuthRequest } from '../middlewares/authMiddleware.ts';
import { MakerCheckerService } from '../services/makerCheckerService.ts';
import { AuditService } from '../services/auditService.ts';

// Initialize services
const auditService = new AuditService();
const makerCheckerService = new MakerCheckerService(auditService);

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

// POST /api/v1/city-admin/configs/:category - with maker-checker
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

    // Prepare request data
    const requestData = {
      key,
      category,
      options,
      description: description || null,
      is_active: is_active !== undefined ? is_active : true,
      previous_values: existingConfig ? {
        value: existingConfig.value,
        description: existingConfig.description,
        is_active: existingConfig.is_active,
      } : null
    };

    // Determine action type
    const actionType = existingConfig ? ActionType.UPDATE : ActionType.CREATE;

    // Create approval request
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.CONFIGURATIONS,
      entityId: existingConfig?.config_id || 'pending',
      actionType,
      requestData,
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: null, // Configurations are city-level
      comments: `${actionType === ActionType.CREATE ? 'Create' : 'Update'} ${category} configuration`
    });

    return res.status(202).json({
      success: true,
      message: `Configuration ${actionType === ActionType.CREATE ? 'creation' : 'update'} request submitted for approval`,
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.CONFIGURATIONS,
        action: actionType,
        approver_role: result.approvalRequest?.approver_role,
      }
    });
  } catch (error: any) {
    console.error('Config update error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sub-city Controllers - with maker-checker

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

// POST /api/v1/city-admin/sub-cities - with maker-checker
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
    // Check for duplicate name
    const existing = await prisma.sub_cities.findFirst({
      where: {
        name,
        is_deleted: false
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Sub-city name already exists'
      });
    }

    // Prepare request data
    const requestData = {
      name,
      description: description || null,
    };

    // Create approval request
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.SUBCITY,
      entityId: 'pending',
      actionType: ActionType.CREATE,
      requestData,
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: null, // Sub-cities are city-level
      comments: `Create new sub-city: ${name}`
    });

    return res.status(202).json({
      success: true,
      message: 'Sub-city creation request submitted for approval',
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.SUBCITY,
        action: ActionType.CREATE,
        approver_role: result.approvalRequest?.approver_role,
      }
    });
  } catch (error: any) {
    console.error('Create sub-city error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create sub-city',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// PATCH /api/v1/city-admin/sub-cities/:id - with maker-checker
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
    // Get current sub-city data
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

    // Check for duplicate name if name is being changed
    if (name && name !== currentSubCity.name) {
      const existing = await prisma.sub_cities.findFirst({
        where: {
          name,
          is_deleted: false,
          NOT: {
            sub_city_id: id
          }
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Sub-city name already exists'
        });
      }
    }

    // Prepare request data
    const requestData = {
      sub_city_id: id,
      name: name || currentSubCity.name,
      description: description !== undefined ? description : currentSubCity.description,
      previous_values: {
        name: currentSubCity.name,
        description: currentSubCity.description,
      }
    };

    // Create approval request
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.SUBCITY,
      entityId: id,
      actionType: ActionType.UPDATE,
      requestData,
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: null, // Sub-cities are city-level
      comments: `Update sub-city: ${currentSubCity.name}`
    });

    return res.status(202).json({
      success: true,
      message: 'Sub-city update request submitted for approval',
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.SUBCITY,
        action: ActionType.UPDATE,
        approver_role: result.approvalRequest?.approver_role,
      }
    });
  } catch (error: any) {
    console.error('Update sub-city error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Sub-city not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update sub-city',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE /api/v1/city-admin/sub-cities/:id (soft delete) - with maker-checker
export const deleteSubCity = async (req: AuthRequest & { params: { id: string } }, res: Response) => {
  const { id } = req.params;
  const actor = req.user!;
  const { reason } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Sub-city ID is required'
    });
  }

  try {
    // Get current sub-city data
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

    // Check dependencies
    const activeUsers = await prisma.users.count({
      where: {
        sub_city_id: id,
        is_deleted: false,
        is_active: true
      }
    });

    const landParcels = await prisma.land_parcels.count({
      where: {
        sub_city_id: id,
        is_deleted: false
      }
    });

    const approvalRequests = await prisma.approval_requests.count({
      where: {
        sub_city_id: id,
        status: 'PENDING',
        is_deleted: false
      }
    });

    // Prepare request data with dependency info
    const requestData = {
      sub_city_id: id,
      name: currentSubCity.name,
      description: currentSubCity.description,
      dependencies: {
        active_users: activeUsers,
        land_parcels: landParcels,
        pending_approvals: approvalRequests
      },
      reason: reason || 'Sub-city deletion requested'
    };

    // Create approval request
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.SUBCITY,
      entityId: id,
      actionType: ActionType.DELETE,
      requestData,
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: null, // Sub-cities are city-level
      comments: reason || `Delete sub-city: ${currentSubCity.name}`
    });

    return res.status(202).json({
      success: true,
      message: 'Sub-city deletion request submitted for approval',
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.SUBCITY,
        action: ActionType.DELETE,
        approver_role: result.approvalRequest?.approver_role,
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