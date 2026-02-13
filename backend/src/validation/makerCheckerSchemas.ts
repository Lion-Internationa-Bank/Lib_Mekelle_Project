// src/validation/makerCheckerSchemas.ts
import { z } from 'zod';

export const createApprovalRequestSchema = z.object({
  body: z.object({
    entity_type: z.enum(['LAND_PARCEL', 'OWNER', 'LEASE', 'WIZARD_SESSION', 'REVENUE']),
    entity_id: z.string().min(1, 'Entity ID is required'),
    action_type: z.enum(['CREATE', 'UPDATE', 'DELETE', 'BULK']),
    request_data: z.record(z.any(),z.any()),
    comments: z.string().max(500).optional()
  })
});

export const approveRequestSchema = z.object({
  params: z.object({
    request_id: z.string().uuid('Invalid request ID')
  }),
  body: z.object({
    comments: z.string().max(500).optional()
  })
});

export const rejectRequestSchema = z.object({
  params: z.object({
    request_id: z.string().uuid('Invalid request ID')
  }),
  body: z.object({
    rejection_reason: z.string().min(1, 'Rejection reason is required').max(1000)
  })
});

export const createWizardSessionSchema = z.object({
  body: z.object({})
});

export const saveWizardStepSchema = z.object({
  params: z.object({
    session_id: z.string().uuid('Invalid session ID')
  }),
  body: z.object({
    step: z.enum(['parcel', 'parcel-docs', 'owner', 'owner-docs', 'lease', 'lease-docs']),
    data: z.record(z.any(),z.any())
  })
});

export const uploadDocumentSchema = z.object({
  params: z.object({
    session_id: z.string().uuid('Invalid session ID')
  }),
  body: z.object({
    step: z.enum(['parcel-docs', 'owner-docs', 'lease-docs']),
    document_type: z.string().min(1, 'Document type is required')
  })
});

export const submitWizardSchema = z.object({
  params: z.object({
    session_id: z.string().uuid('Invalid session ID')
  }),
  body: z.object({})
});




// Add this validation schema for maker pending requests query parameters
export const validateMakerPendingRequestsQuery = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1)
      .refine(val => val > 0, 'Page must be greater than 0'),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional().default('PENDING'),
    entity_type: z.enum(['PROPERTY', 'REVENUE', 'CUSTOMER', 'TAX', 'PERMIT']).optional(),
    action_type: z.enum(['CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE']).optional(),
    sortBy: z.enum(['created_at', 'updated_at', 'status', 'entity_type', 'action_type', 'submitted_at'])
      .optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
});