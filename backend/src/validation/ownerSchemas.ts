// src/validation/ownerSchemas.ts

import { z } from 'zod';

// Reusable param schema
const OwnerIdParamSchema = z.object({
  owner_id: z
    .string()
    .uuid({ message: 'Invalid owner ID – must be a valid UUID' }),
});

// Query schema for getOwnersWithParcels
export const GetOwnersWithParcelsQuerySchema = z.object({
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
    .pipe(z.number().int().positive().max(100))
    .optional()
    .default(10),

  search: z.string().trim().optional(),
});

// Query schema for searchOwnersLite
export const SearchOwnersLiteQuerySchema = z.object({
  search: z.string().trim().optional(),
});

// POST /owners - Create owner + link to parcel
export const CreateOwnerSchema = z.object({
  body: z.object({
    full_name: z
      .string()
      .trim()
      .min(1, { message: 'Full name is required and cannot be empty' }),

    national_id: z
      .string()
      .trim()
      .min(1, { message: 'National ID is required and cannot be empty' }),

    tin_number: z.string().trim().optional(),

    phone_number: z
      .string()
      .trim()
      .min(1, { message: 'Phone number is required and cannot be empty' }),

    upin: z
      .string()
      .trim()
      .min(1, { message: 'UPIN is required to link owner to parcel' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'Invalid UPIN format',
      }),

    share_ratio: z.coerce
      .number()
      .gt(0, { message: 'Share ratio must be greater than 0' })
      .lte(1, { message: 'Share ratio cannot exceed 1.0 (100%)' }),

    acquired_at: z.coerce.date().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

// POST /owners/only - Create owner only (no parcel link)
export const OnlyCreateOwnerSchema = z.object({
  body: z.object({
    full_name: z
      .string()
      .trim()
      .min(1, { message: 'Full name is required and cannot be empty' }),

    national_id: z
      .string()
      .trim()
      .min(1, { message: 'National ID is required and cannot be empty' }),

    tin_number: z.string().trim().optional(),

    phone_number: z
      .string()
      .trim()
      .min(1, { message: 'Phone number is required and cannot be empty' }),
  }),
  params: z.object({}),
  query: z.object({}),
});

// PUT /owners/:owner_id - Update owner
export const UpdateOwnerSchema = z.object({
  params: OwnerIdParamSchema,
  body: z
    .object({
      full_name: z.string().trim().min(1).optional(),
      national_id: z.string().trim().min(1).optional(),
      tin_number: z.string().trim().nullable().optional(),
      phone_number: z.string().trim().min(1).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
  query: z.object({}),
});

// DELETE /owners/:owner_id
export const DeleteOwnerSchema = z.object({
  params: OwnerIdParamSchema,
 
});