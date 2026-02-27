import { z } from 'zod';

// Schema for encumbrances with date filter
export const GetEncumbrancesSchema = z.object({
  query: z.object({
    from_date: z.coerce
      .date()
      .transform(date => date ? new Date(date) : undefined),
    to_date: z.coerce
      .date()
      .transform(date => date ? new Date(date) : undefined),
    status: z.enum(['ACTIVE', 'RELEASED']).optional(),
    type: z.string().optional()
  }),
});

// Schema for land parcels with filters
export const GetLandParcelsSchema = z.object({
  query: z.object({
    landUse: z.string().optional(),
    tenureType: z.string().optional(),
    tabia: z.string().optional(),
    ketena: z.string().optional(),
    block: z.string().optional(),
    minArea: z.coerce
      .number()
      .positive()
      .optional(),
    maxArea: z.coerce
      .number()
      .positive()
      .optional(),
    landGrade: z.coerce
      .number()
      .min(0)
      .max(10)
      .optional(),
      tender:z.string().optional(),
    status: z.enum(['ACTIVE', 'RETIRED', 'PENDING']).optional(),
    subCityId: z.string().uuid().optional()
  }),
});

// Schema for owners with multiple parcels
export const GetOwnersWithMultipleParcelsSchema = z.object({
  query: z.object({
    minParcels: z.coerce
      .number()
      .int()
      .min(2)
      .optional()
      .default(2),
    subCityId: z.string().uuid().optional(),
  }),
});



export const GetLeaseAnnualInstallmentRangeSchema = z.object({
  query: z.object({
    min: z.coerce
      .number()
      .positive({ message: 'Minimum value must be positive' })
      .min(0, { message: 'Minimum value cannot be negative' }),
    
    max: z.coerce
      .number()
      .positive({ message: 'Maximum value must be positive' })
      .min(0, { message: 'Maximum value cannot be negative' }),
    
    subCityId: z.string().uuid().optional(),
  }),

});

export type GetLeaseAnnualInstallmentRange = z.infer<typeof GetLeaseAnnualInstallmentRangeSchema>['query'];
// Export types
export type GetEncumbrancesQuery = z.infer<typeof GetEncumbrancesSchema>['query'];
export type GetLandParcelsQuery = z.infer<typeof GetLandParcelsSchema>['query'];
export type GetOwnersWithMultipleParcelsQuery = z.infer<typeof GetOwnersWithMultipleParcelsSchema>['query'];
