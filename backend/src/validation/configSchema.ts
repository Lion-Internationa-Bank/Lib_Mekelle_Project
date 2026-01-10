// src/validation/configSchema.ts
import { z } from 'zod';
import { ConfigCategory } from '../generated/prisma/enums.ts';

const configOptionSchema = z.object({
  value: z.string().trim().min(1, 'Option value is required'),
  description: z.string().optional(),
});

export const configListSchema = z.object({
  body: z.object({
    options: z
      .array(configOptionSchema)
      .min(1, 'At least one option is required'),
    description: z.string().optional(),
  }),
});

export const configUpdateSchema = z.object({
  body: z.object({
    options: z.array(configOptionSchema).min(1),
    description: z.string().optional(),
  }),
});

// Sub-city validation
export const createSubCitySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Sub-city name must be at least 2 characters')
      .max(100, 'Sub-city name too long'),
    description: z.string().optional(),
  }),
});

export const updateSubCitySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid sub-city ID'),
  }),
});

export const subCityIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sub-city ID'),
  }),
});