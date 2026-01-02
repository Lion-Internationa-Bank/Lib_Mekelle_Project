// src/validators/leaseValidator.ts
import { z } from 'zod';

const decimalLike = z.union([z.number(), z.string()]);

export const createLeaseSchema = z.object({
  params: z.object({
    upin: z.string().min(1),
  }),
  body: z.object({
    lease_period_years: z.union([z.number(), z.string()]),
    price_per_m2: decimalLike,
    total_lease_value: decimalLike.optional(),
    down_payment_amount: decimalLike.optional(),
    annual_installment: decimalLike.optional(),
    payment_term_years: z.union([z.number(), z.string()]).optional(),
    contract_date: z.string().min(1),
    legal_framework: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),

    // holder info
    holder_full_name: z.string().min(1),
    holder_identity_type: z.string().min(1),
    holder_identity_number: z.string().min(1),
    holder_contact_phone: z.string().optional(),
    holder_email: z.string().email().optional(),
    holder_address: z.string().optional(),

    // agreement document info (optional)
    document_type: z.string().optional(),
    document_file_name: z.string().optional(),
    document_file_path: z.string().optional(),
    document_file_size_kb: z.union([z.number(), z.string()]).optional(),
    document_description: z.string().optional(),
  }),
});


export const leaseParamsSchema = z.object({
  params: z.object({
    upin: z.string().min(1),
    lease_id: z.string().min(1),
  }),
});

export const updateLeaseSchema = z.object({
  params: z.object({
    upin: z.string().min(1),
    lease_id: z.string().min(1),
  }),
  body: z
    .object({
      lease_period_years: z.union([z.number(), z.string()]).optional(),
      price_per_m2: decimalLike.optional(),
      total_lease_value: decimalLike.optional(),
      down_payment_amount: decimalLike.optional(),
      annual_installment: decimalLike.optional(),
      payment_term_years: z.union([z.number(), z.string()]).nullable().optional(),
      contract_date: z.string().optional(),
      legal_framework: z.string().nullable().optional(),
      start_date: z.string().nullable().optional(),
      end_date: z.string().nullable().optional(),
      current_holder_id: z.string().nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});

export const leaseHistoryParamsSchema = z.object({
  params: z.object({
    upin: z.string().min(1),
    lease_id: z.string().min(1),
  }),
});
