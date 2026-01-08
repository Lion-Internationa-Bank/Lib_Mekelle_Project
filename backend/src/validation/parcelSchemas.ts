// src/validation/parcelSchemas.ts

import { z } from 'zod';

// Reusable param schemas
const UPINParamSchema = z.object({
  upin: z
    .string()
    .trim()
    .min(1, { message: 'UPIN is required and cannot be empty' })
    .regex(/^[A-Za-z0-9\-_]+$/, {
      message: 'UPIN can only contain letters, numbers, hyphens, and underscores',
    }),
});

const ParcelOwnerIdParamSchema = z.object({
  parcel_owner_id: z
    .string()
    .uuid({ message: 'Invalid parcel owner ID – must be a valid UUID' }),
});

const EncumbranceIdParamSchema = z.object({
  encumbrance_id: z
    .string()
    .uuid({ message: 'Invalid encumbrance ID – must be a valid UUID' }),
});

// Query schema for getParcels
export const GetParcelsQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, { message: 'Page must be a positive integer' })
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional()
    .default(1),

  limit: z
    .string()
    .regex(/^\d+$/, { message: 'Limit must be a positive integer' })
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional()
    .default(10),

  search: z.string().trim().optional(),
  sub_city: z.string().trim().optional(),
  ketena: z.string().trim().optional(),
  land_use: z.string().trim().optional(),
  tenure_type: z.enum(['OLD_POSSESSION', 'LEASE']).optional(),
});

// Create Parcel
export const CreateParcelSchema = z.object({
  
  body: z.object({
    upin: z
      .string()
      .trim()
      .min(1, { message: 'UPIN is required and cannot be empty' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'UPIN can only contain letters, numbers, hyphens, and underscores',
      }),

    file_number: z.string().trim().min(1, { message: 'File number cannot be empty' }).optional(),

    sub_city: z
      .string()
      .trim()
      .min(1, { message: 'Sub-city is required and cannot be empty' }),

    tabia: z
      .string()
      .trim()
      .min(1, { message: 'Tabia/Woreda is required and cannot be empty' }),

    ketena: z.string().trim().optional(),
    block: z.string().trim().optional(),

    total_area_m2: z.coerce.number().positive({ message: 'Total area must be greater than 0' }),

    land_use: z
      .string()
      .trim()
      .min(1, { message: 'Land use type is required and cannot be empty' }),

    land_grade: z.coerce
      .number()
      .min(0, { message: 'Land grade cannot be negative' })
      .optional(),

    tenure_type: z.enum(['OLD_POSSESSION', 'LEASE']).default('OLD_POSSESSION'),

    geometry_data: z.any().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Update Parcel
export const UpdateParcelSchema = z.object({
  params: UPINParamSchema,
  body: z
    .object({
      file_number: z.string().trim().min(1).optional(),
      sub_city: z.string().trim().min(1).optional(),
      tabia: z.string().trim().min(1).optional(),
      ketena: z.string().trim().optional(),
      block: z.string().trim().optional(),
      total_area_m2: z.coerce.number().positive().optional(),
      land_use: z.string().trim().min(1).optional(),
      land_grade: z.coerce.number().min(0).optional(),
      tenure_type: z.enum(['OLD_POSSESSION', 'LEASE']).optional(),
      geometry_data: z.any().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update the parcel',
    }),
  query: z.object({}),
});

// Transfer Ownership
export const TransferOwnershipSchema = z.object({
  params: UPINParamSchema,
  body: z.object({
    from_owner_id: z
      .string()
      .uuid({ message: 'Invalid from_owner_id – must be a valid UUID' })
      .optional(),

    to_owner_id: z
      .string()
      .uuid({ message: 'Invalid to_owner_id – must be a valid UUID' })
      .min(1, { message: 'New owner (to_owner_id) is required' }),

    to_share_ratio: z.coerce
      .number()
      .gt(0, { message: 'Share ratio must be greater than 0' })
      .lte(1, { message: 'Share ratio cannot exceed 1.0 (100%)' }),

    transfer_type: z.enum(['SALE', 'GIFT', 'HEREDITY', 'CONVERSION'], {
      message: 'Transfer type must be one of: SALE, GIFT, HEREDITY, or CONVERSION',
    }),

    transfer_price: z.coerce
      .number()
      .min(0, { message: 'Transfer price cannot be negative' })
      .optional(),

    reference_no: z.string().trim().optional(),
  }),
  query: z.object({}),
});

// Update Owner Share
export const UpdateParcelOwnerShareSchema = z.object({
  params: ParcelOwnerIdParamSchema,
  body: z.object({
    share_ratio: z.coerce
      .number()
      .gt(0, { message: 'Share ratio must be greater than 0' })
      .lte(1, { message: 'Share ratio cannot exceed 1.0 (100%)' }),
  }),
  query: z.object({}),
});

// Create Encumbrance
export const CreateEncumbranceSchema = z.object({
  body: z.object({
    upin: z
      .string()
      .trim()
      .min(1, { message: 'UPIN is required and cannot be empty' }),

    type: z.enum(['MORTGAGE', 'COURT_FREEZE', 'GOVT_RESERVATION'], {
      message: 'Encumbrance type must be MORTGAGE, COURT_FREEZE, or GOVT_RESERVATION',
    }),

    issuing_entity: z
      .string()
      .trim()
      .min(1, { message: 'Issuing entity is required and cannot be empty' }),

    reference_number: z.string().trim().optional(),

    status: z.enum(['ACTIVE']).default('ACTIVE').optional(),

    registration_date: z.coerce.date().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Update Encumbrance
export const UpdateEncumbranceSchema = z.object({
  params: EncumbranceIdParamSchema,
  body: z
    .object({
      type: z.enum(['MORTGAGE', 'COURT_FREEZE', 'GOVT_RESERVATION']).optional(),
      issuing_entity: z.string().trim().min(1).optional(),
      reference_number: z.string().trim().nullable().optional(),
      status: z.enum(['ACTIVE', 'RELEASED']).optional(),
      registration_date: z.coerce.date().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update the encumbrance',
    }),
  query: z.object({}),
});

export const DeleteEncumbranceSchema = z.object({
  params: EncumbranceIdParamSchema,
  body: z.object({}),
  query: z.object({}),
});

export const GetEncumbrancesByUpinSchema = z.object({
  params: UPINParamSchema,
  body: z.object({}),
  query: z.object({}),
});

