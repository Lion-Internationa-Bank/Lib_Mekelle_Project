// src/validation/makerCheckerSchemas.ts
import { z } from 'zod';

// ============= ENUMS =============

export const EntityTypeEnum = z.enum([
  'WIZARD_SESSION',
  'LAND_PARCELS',
  'OWNERS',
  'LEASE_AGREEMENTS',
  'ENCUMBRANCES',
  'APPROVAL_REQUEST',
  'USERS',
  'CONFIGURATIONS',
  'RATE_CONFIGURATION',
  'SUBCITY',
  'REVENUE'
]);

export const ActionTypeEnum = z.enum([
  'CREATE',
  'UPDATE',
  'DELETE',
  'TRANSFER',
  'SUBDIVIDE',
  'MERGE',
  'TERMINATE',
  'EXTEND',
  'ADD_OWNER',
  'SUSPEND',
  'ACTIVATE',
  'DEACTIVATE'
]);

export const RequestStatusEnum = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'RETURNED',
  'CANCELLED',
  'FAILED'
]);

export const WizardStepEnum = z.enum([
  'parcel',
  'parcel-docs',
  'owner',
  'owner-docs',
  'lease',
  'lease-docs'
]);

export const WizardDocStepEnum = z.enum([
  'parcel-docs',
  'owner-docs',
  'lease-docs'
]);

// ============= REQUEST SCHEMAS =============

// Create approval request
export const createApprovalRequestSchema = z.object({
  body: z.object({
    entity_type: EntityTypeEnum,
    entity_id: z.string().min(1, 'Entity ID is required'),
    action_type: ActionTypeEnum,
    request_data: z.record(z.string(), z.any()),
    comments: z.string().max(500).optional(),
    sub_city_id: z.string().uuid().optional(),
    approver_role: z.enum(['CITY_APPROVER', 'SUBCITY_APPROVER', 'REVENUE_APPROVER']).optional()
  })
});

// Approve request
export const approveRequestSchema = z.object({
  params: z.object({
    request_id: z.string().uuid('Invalid request ID')
  }),
  body: z.object({
    comments: z.string().max(500).optional()
  })
});

// Reject request
export const rejectRequestSchema = z.object({
  params: z.object({
    request_id: z.string().uuid('Invalid request ID')
  }),
  body: z.object({
    rejection_reason: z.string().min(1, 'Rejection reason is required').max(1000)
  })
});

// Return request (for approver to send back to maker)
export const returnRequestSchema = z.object({
  params: z.object({
    request_id: z.string().uuid('Invalid request ID')
  }),
  body: z.object({
    return_reason: z.string().min(1, 'Return reason is required').max(1000),
    comments: z.string().max(500).optional()
  })
});

// Update approval request (maker updates their request)
export const updateApprovalRequestSchema = z.object({
  params: z.object({
    request_id: z.string().uuid('Invalid request ID')
  }),
  body: z.object({
    request_data: z.record(z.string(), z.any()).optional(),
    comments: z.string().max(500).optional()
  })
});

// ============= WIZARD SCHEMAS =============

// Create wizard session
export const createWizardSessionSchema = z.object({
  body: z.object({
    sub_city_id: z.string().uuid().optional()
  })
});

// Save wizard step
export const saveWizardStepSchema = z.object({
  params: z.object({
    session_id: z.string().uuid('Invalid session ID')
  }),
  body: z.object({
    step: WizardStepEnum,
    data: z.record(z.string(), z.any())
  })
});

// Upload document
export const uploadDocumentSchema = z.object({
  params: z.object({
    session_id: z.string().uuid('Invalid session ID')
  }),
  body: z.object({
    step: WizardDocStepEnum,
    document_type: z.string().min(1, 'Document type is required')
  })
});

// Submit wizard session for approval
export const submitWizardSchema = z.object({
  params: z.object({
    session_id: z.string().uuid('Invalid session ID')
  }),
  body: z.object({}).optional()
});

// ============= QUERY PARAMETER SCHEMAS =============

// Base pagination schema
const paginationSchema = z.object({
  page: z.string().optional()
    .transform(val => val ? parseInt(val) : 1)
    .refine(val => val > 0, 'Page must be greater than 0'),
  limit: z.string().optional()
    .transform(val => val ? parseInt(val) : 10)
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
});

// Maker pending requests query
export const validateMakerPendingRequestsQuery = z.object({
  query: paginationSchema.extend({
    status: RequestStatusEnum.optional().default('PENDING'),
    entity_type: EntityTypeEnum.optional(),
    action_type: ActionTypeEnum.optional(),
    sortBy: z.enum([
      'created_at', 
      'updated_at', 
      'status', 
      'entity_type', 
      'action_type'
    ]).optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
});

// Approver pending requests query
export const validateApproverPendingRequestsQuery = z.object({
  query: paginationSchema.extend({
    status: RequestStatusEnum.optional().default('PENDING'),
    entity_type: EntityTypeEnum.optional(),
    action_type: ActionTypeEnum.optional(),
    maker_id: z.string().uuid().optional(),
    from_date: z.string().datetime().optional(),
    to_date: z.string().datetime().optional(),
    sortBy: z.enum([
      'created_at', 
      'updated_at', 
      'status', 
      'entity_type', 
      'action_type', 
      'approved_at',
      'rejected_at'
    ]).optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
});

// Get maker's pending requests by maker ID
export const validateGetMakerPendingRequests = z.object({
  params: z.object({
    maker_id: z.string().uuid('Invalid maker ID format')
  }),
  query: paginationSchema.extend({
    status: RequestStatusEnum.optional(),
    entity_type: EntityTypeEnum.optional(),
    action_type: ActionTypeEnum.optional(),
    sortBy: z.enum([
      'created_at', 
      'updated_at', 
      'status', 
      'entity_type', 
      'action_type'
    ]).optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
});

// Get request details
export const validateGetRequestDetails = z.object({
  params: z.object({
    request_id: z.string().uuid('Invalid request ID')
  })
});

// ============= TYPE INFERENCES =============

export type EntityType = z.infer<typeof EntityTypeEnum>;
export type ActionType = z.infer<typeof ActionTypeEnum>;
export type RequestStatus = z.infer<typeof RequestStatusEnum>;
export type WizardStep = z.infer<typeof WizardStepEnum>;
export type WizardDocStep = z.infer<typeof WizardDocStepEnum>;

export type CreateApprovalRequestInput = z.infer<typeof createApprovalRequestSchema>['body'];
export type ApproveRequestInput = z.infer<typeof approveRequestSchema>['body'];
export type RejectRequestInput = z.infer<typeof rejectRequestSchema>['body'];
export type ReturnRequestInput = z.infer<typeof returnRequestSchema>['body'];
export type UpdateApprovalRequestInput = z.infer<typeof updateApprovalRequestSchema>['body'];
export type CreateWizardSessionInput = z.infer<typeof createWizardSessionSchema>['body'];
export type SaveWizardStepInput = z.infer<typeof saveWizardStepSchema>['body'];
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>['body'];

export type MakerPendingRequestsQuery = z.infer<typeof validateMakerPendingRequestsQuery>['query'];
export type ApproverPendingRequestsQuery = z.infer<typeof validateApproverPendingRequestsQuery>['query'];
export type GetMakerPendingRequestsParams = z.infer<typeof validateGetMakerPendingRequests>['params'];
export type GetMakerPendingRequestsQuery = z.infer<typeof validateGetMakerPendingRequests>['query'];