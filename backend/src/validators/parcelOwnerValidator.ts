// src/validators/parcelOwnerValidator.ts
import { z } from 'zod';

export const listParcelOwnersParamsSchema = z.object({
  params: z.object({
    parcel_id: z.string().min(1),
  }),
});

export const createParcelOwnerSchema = z.object({
  params: z.object({
    parcel_id: z.string().min(1),
  }),
  body: z.object({
    owner_id: z.string().min(1), // UUID of owners.owner_id
    ownership_share: z.union([z.number()]), // will be cast to Decimal
    start_date: z.string().min(1), // e.g. "2025-01-01"
    end_date: z.string().optional(),
  }),
});

export const getParcelOwnerParamsSchema = z.object({
  params: z.object({
    parcel_id: z.string().min(1),
    owner_id: z.string().min(1),
  }),
});

export const updateParcelOwnerSchema = z.object({
  params: z.object({
    parcel_id: z.string().min(1),
    owner_id: z.string().min(1),
  }),
  body: z
    .object({
      ownership_share: z.union([z.number(), z.string()]).optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional().nullable(),
    })
    .refine(
      (body) =>
        body.ownership_share !== undefined ||
        body.start_date !== undefined ||
        body.end_date !== undefined,
      { message: 'At least one field must be provided to update' }
    ),
});
