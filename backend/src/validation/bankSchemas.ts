// src/validation/bankSchemas.ts
import { z } from 'zod';

export const BankCallbackSchema = z.object({
  body: z.object({
    transactionId: z
      .string()
      .trim()
      .min(1, { message: 'Transaction ID is required and cannot be empty' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'Invalid transaction ID format – only letters, numbers, hyphens, and underscores allowed',
      }),
    upin: z
      .string()
      .trim()
      .min(1, { message: 'UPIN is required and cannot be empty' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'Invalid UPIN format – only letters, numbers, hyphens, and underscores allowed',
      }),
    
    number: z.coerce
      .number()
      .int({ message: 'Number must be an integer' })
      .min(1, { message: 'Number must be at least 1' })
      .max(10, { message: 'Number cannot exceed 10 (maximum 10 bills at once)' }),
    
    amountPaid: z.coerce
      .number()
      .positive({ message: 'Amount paid must be greater than 0' })
      .optional(),
    
    paymentDate: z.coerce
      .date({ message: 'Invalid payment date format' })
      .optional()
      .default(() => new Date()),
    
    receiptSerialNo: z
      .string()
      .trim()
      .min(1, { message: 'Receipt serial number cannot be empty if provided' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'Invalid receipt serial number format – only letters, numbers, hyphens, and underscores allowed',
      })
      .optional(),
    
    paymentMethod: z
      .string()
      .trim()
      .min(1, { message: 'Payment method cannot be empty if provided' })
      .regex(/^[A-Za-z0-9\s\-_]+$/, {
        message: 'Invalid payment method format – only letters, numbers, spaces, hyphens, and underscores allowed',
      })
      .optional()
      .default('BANK_TRANSFER'),
    
    bankBranch: z
      .string()
      .trim()
      .min(1, { message: 'Bank branch cannot be empty if provided' })
      .optional(),
    
    bankAccount: z
      .string()
      .trim()
      .min(1, { message: 'Bank account cannot be empty if provided' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'Invalid bank account format – only letters, numbers, hyphens, and underscores allowed',
      })
      .optional(),
    
    notes: z
      .string()
      .trim()
      .max(500, { message: 'Notes cannot exceed 500 characters' })
      .optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Schema for getting unpaid bills
export const GetUnpaidBillsSchema = z.object({
  params: z.object({
    upin: z
      .string()
      .trim()
      .min(1, { message: 'UPIN is required and cannot be empty' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'Invalid UPIN format – only letters, numbers, hyphens, and underscores allowed',
      }),
  }),
//   query: z.object({}),
//   body: z.object({}),
});

// Schema for getting transactions by UPIN
export const GetTransactionsByUpinSchema = z.object({
  params: z.object({
    upin: z
      .string()
      .trim()
      .min(1, { message: 'UPIN is required and cannot be empty' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'Invalid UPIN format – only letters, numbers, hyphens, and underscores allowed',
      }),
  }),
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, { message: 'Page must be at least 1' })
      .optional()
      .default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, { message: 'Limit must be at least 1' })
      .max(100, { message: 'Limit cannot exceed 100' })
      .optional()
      .default(10),
  }),
  body: z.object({}),
});

// Schema for getting transaction by ID
export const GetTransactionByIdSchema = z.object({
  params: z.object({
    transactionId: z
      .string()
      .trim()
      .min(1, { message: 'Transaction ID is required and cannot be empty' })
      .regex(/^[A-Za-z0-9\-_]+$/, {
        message: 'Invalid transaction ID format – only letters, numbers, hyphens, and underscores allowed',
      }),
  }),
  query: z.object({}),
  body: z.object({}),
});

// Export types for use in controllers
export type BankCallbackBody = z.infer<typeof BankCallbackSchema>['body'];
export type GetUnpaidBillsParams = z.infer<typeof GetUnpaidBillsSchema>['params'];
export type GetTransactionsByUpinParams = z.infer<typeof GetTransactionsByUpinSchema>['params'];
export type GetTransactionsByUpinQuery = z.infer<typeof GetTransactionsByUpinSchema>['query'];
export type GetTransactionByIdParams = z.infer<typeof GetTransactionByIdSchema>['params'];