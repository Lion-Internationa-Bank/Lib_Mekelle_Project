// src/validation/billSchemas.ts
import { z } from 'zod';

export const DownloadBillsSchema = z.object({
  query: z.object({
    subcityId: z.string().uuid().optional(),
    status: z.enum(['PAID', 'UNPAID', 'OVERDUE']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional()
  })
});

export type DownloadBillsQuery = z.infer<typeof DownloadBillsSchema>['query'];