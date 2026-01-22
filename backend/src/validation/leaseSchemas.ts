// src/validation/leaseSchemas.ts

import { z } from 'zod';

// Reusable param schema for lease_id
const LeaseIdParamSchema = z.object({
  lease_id: z
    .string()
    .uuid({ message: 'Invalid lease ID – must be a valid UUID' }),
});

// POST /leases - Create lease agreement
export const CreateLeaseSchema = z.object({
  body: z.object({
    upin: z
      .string()
      .trim()
      .min(1, { message: 'UPIN is required and cannot be empty' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'Invalid UPIN format – only letters, numbers, hyphens, and underscores allowed',
      }),


    total_lease_amount: z.coerce
      .number()
      .positive({ message: 'Total lease amount must be greater than 0' }),


    down_payment_amount: z.coerce
      .number()
      .min(0, { message: 'Down payment cannot be negative' }),

    price_per_m2: z.coerce
      .number()
      .positive({ message: 'Price per m² must be greater than 0' }),

    lease_period_years: z.coerce
      .number()
      .int()
      .positive({ message: 'Lease period (years) must be a positive integer' }),

    payment_term_years: z.coerce
      .number()
      .int()
      .positive({ message: 'Payment term (years) must be a positive integer' }),

    legal_framework: z
      .string()
      .trim()
      .min(1, { message: 'Legal framework is required and cannot be empty' }),

    contract_date: z.coerce.date({ message: 'Invalid contract date format' }),

    start_date: z.coerce.date({ message: 'Invalid start date format' }),

  
  }),
  params: z.object({}),
  query: z.object({}),
});

// PUT /leases/:lease_id - Update lease agreement
export const UpdateLeaseSchema = z.object({
  params: LeaseIdParamSchema,
  body: z
    .object({
      total_lease_amount: z.coerce.number().positive().optional(),
      down_payment_amount: z.coerce.number().min(0).optional(),
      price_per_m2: z.coerce.number().positive().optional(),
      lease_period_years: z.coerce.number().int().positive().optional(),
      payment_term_years: z.coerce.number().int().positive().optional(),
      legal_framework: z.string().trim().min(1).optional(),
      contract_date: z.coerce.date().optional(),
      start_date: z.coerce.date().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update the lease agreement',
    }),
  query: z.object({}),
});

// DELETE /leases/:lease_id - Soft delete
export const DeleteLeaseSchema = z.object({
  params: LeaseIdParamSchema,
  body: z.object({}),
  query: z.object({}),
});