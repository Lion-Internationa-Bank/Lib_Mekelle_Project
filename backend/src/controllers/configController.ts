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
  const { options, description } = req.body;

  const key = CONFIG_KEYS[category]; 

  if (!key) {
    return res.status(400).json({ message: 'Invalid configuration key' });
  }

  try {
    const updated = await prisma.configurations.upsert({
      where: { key },
      update: {
        value: options,
        description: description || null,
        updated_at: new Date(),
      },
      create: {
        key,
        value: options,
        category,
        description: description || null,
        is_active: true,
      },
    });

    // Optional: Log the config change
    await prisma.audit_logs.create({
      data: {
        user_id: req.user!.user_id,
        action_type: AuditAction.CONFIG_CHANGE,
        entity_type: 'CONFIGURATION',
        entity_id: updated.config_id,
        changes: { category, key, options },
      },
    });

    res.status(200).json({
      message: 'Configuration updated successfully',
      config: {
        category,
        key: updated.key,
        options: updated.value,
        description: updated.description,
      },
    });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ message: 'Failed to update configuration' });
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

  const subCity = await prisma.sub_cities.create({
    data: {
      name,
      description: description || null,
    },
  });

  res.status(201).json({
    message: 'Sub-city created successfully',
    sub_city: {
      sub_city_id: subCity.sub_city_id,
      name: subCity.name,
      description: subCity.description,
    },
  });
};

// PATCH /api/v1/city-admin/sub-cities/:id
export const updateSubCity = async (req: AuthRequest & { params: { id: string } }, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const updated = await prisma.sub_cities.update({
    where: { sub_city_id: id },
    data: {
      name: name || undefined,
      description: description ?? null,
      updated_at: new Date(),
    },
  });

  res.json({
    message: 'Sub-city updated successfully',
    sub_city: {
      sub_city_id: updated.sub_city_id,
      name: updated.name,
      description: updated.description,
    },
  });
};

// DELETE /api/v1/city-admin/sub-cities/:id (soft delete)
export const deleteSubCity = async (req: AuthRequest & { params: { id: string } }, res: Response) => {
  const { id } = req.params;

  await prisma.sub_cities.update({
    where: { sub_city_id: id },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
    },
  });

  res.json({ message: 'Sub-city deleted successfully' });
};