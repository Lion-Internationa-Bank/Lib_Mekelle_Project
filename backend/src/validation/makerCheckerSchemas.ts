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