// src/validators/parcelValidator.ts

import { z } from 'zod';

export const createParcelSchema = z.object({
  body: z.object({
    upin: z.string().min(1, 'UPIN is required').trim(),
    file_number: z.string().optional(),
    sub_city: z.string().optional(),
    tabia: z.string().optional(),
    block: z.string().optional(),
    ketena: z.string().optional(),
    total_area_m2: z.coerce.number().positive('Total area must be greater than 0'),
    land_use: z.string().optional(),
    sub_land_use_code: z.string().optional(),
    tenure_type: z.string().min(1, 'Tenure type is required'),
    land_grade: z.string().optional(),
    permitted_height: z.coerce.number().optional(),
    boundary_north: z.string().optional(),
    boundary_east: z.string().optional(),
    boundary_south: z.string().optional(),
    boundary_west: z.string().optional(),
    document_type: z.string().optional().default('Cadastral Map'),
    description: z.string().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});



export const updateParcelSchema = z.object({
  body: z.object({
    file_number: z.string().optional(),
    sub_city: z.string().optional(),
    // etc. all optional fields
  }),
});

export const listParcelsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    upin: z.string().optional(),
  }),
});
