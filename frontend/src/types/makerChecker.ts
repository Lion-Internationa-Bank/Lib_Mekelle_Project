// src/types/makerChecker.ts

// ============= UNION TYPES =============

export type EntityType = 
  | 'WIZARD_SESSION'
  | 'LAND_PARCELS'
  | 'OWNERS'
  | 'LEASE_AGREEMENTS'
  | 'ENCUMBRANCES'
  | 'APPROVAL_REQUEST';

export type ActionType = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'TRANSFER'
  | 'SUBDIVIDE'
  | 'MERGE'
  | 'TERMINATE'
  | 'EXTEND'
  | 'ADD_OWNER';

export type RequestStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'CANCELLED'
  | 'FAILED';

export type UserRole = 
  | 'CITY_ADMIN'
  | 'SUBCITY_NORMAL'
  | 'SUBCITY_AUDITOR'
  | 'REVENUE_ADMIN'
  | 'REVENUE_USER'
  | 'SUBCITY_ADMIN';

// ============= CONSTANTS =============

export const ENTITY_TYPES: EntityType[] = [
  'WIZARD_SESSION',
  'LAND_PARCELS',
  'OWNERS',
  'LEASE_AGREEMENTS',
  'ENCUMBRANCES',
  'APPROVAL_REQUEST'
];

export const ACTION_TYPES: ActionType[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'TRANSFER',
  'SUBDIVIDE',
  'MERGE',
  'TERMINATE',
  'EXTEND',
  'ADD_OWNER'
];

export const REQUEST_STATUSES: RequestStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'RETURNED',
  'CANCELLED',
  'FAILED'
];

export const USER_ROLES: UserRole[] = [
  'CITY_ADMIN',
  'SUBCITY_NORMAL',
  'SUBCITY_AUDITOR',
  'REVENUE_ADMIN',
  'REVENUE_USER',
  'SUBCITY_ADMIN'
];

export const APPROVER_ROLES: UserRole[] = [
  'CITY_ADMIN',
  'REVENUE_ADMIN',
  'SUBCITY_ADMIN'
];

// ============= PAGINATION TYPES =============

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

// ============= FILTER TYPES =============

export interface PendingRequestFilters {
  status?: RequestStatus;
  entity_type?: EntityType;
  action_type?: ActionType;
  maker_id?: string;
  from_date?: string;
  to_date?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MakerPendingRequestFilters {
  status?: RequestStatus;
  entity_type?: EntityType;
  action_type?: ActionType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============= BASE TYPES =============

export interface MakerInfo {
  user_id: string;
  username: string;
  full_name: string;
  role: UserRole;
}

export interface SubCityInfo {
  sub_city_id: string;
  name: string;
}

// ============= REQUEST TYPES =============

export interface ApprovalRequestData {
  request_id: string;
  entity_type: EntityType;
  entity_id: string;
  action_type: ActionType;
  request_data: any;
  status: RequestStatus;
  maker_id: string;
  maker_role: UserRole;
  approver_role: UserRole;
  sub_city_id?: string;
  rejection_reason?: string;
  maker_comments?: string;
  approver_comments?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  deleted_at?: string;
  is_deleted: boolean;
  maker: MakerInfo;
  sub_city?: SubCityInfo;
  approver?: MakerInfo;
}

export interface PendingRequestData {
  request_id: string;
  entity_type: EntityType;
  action_type: ActionType;
  status: RequestStatus;
  created_at: string;
  updated_at?: string;
  submitted_at?: string;
  maker: MakerInfo;
  sub_city?: SubCityInfo;
}

// ============= API WRAPPER TYPES =============

export interface ApprovalRequest {
  success: boolean;
  data: ApprovalRequestData;
}

export interface PendingRequest {
  success: boolean;
  data: PendingRequestData;
}

// ============= API RESPONSE TYPES =============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination?: PaginationMetadata;
  message?: string;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// ============= APPROVAL REQUEST DETAIL TYPES =============

export interface ApprovalRequestDetail extends ApprovalRequestData {
  audit_logs?: AuditLog[];
  workflow_history?: WorkflowHistoryItem[];
}

export interface AuditLog {
  audit_id: string;
  request_id: string;
  action: string;
  user_id: string;
  changes?: Record<string, any>;
  created_at: string;
  user?: MakerInfo;
}

export interface WorkflowHistoryItem {
  workflow_id: string;
  request_id: string;
  from_status: RequestStatus;
  to_status: RequestStatus;
  action: string;
  user_id: string;
  comments?: string;
  created_at: string;
  user?: MakerInfo;
}

// ============= APPROVAL ACTION TYPES =============

export interface ApproveRequestPayload {
  comments?: string;
}

export interface RejectRequestPayload {
  rejection_reason: string;
  comments?: string;
}

export interface ReturnRequestPayload {
  return_reason: string;
  comments?: string;
}

export interface ApprovalActionResult {
  success: boolean;
  message: string;
  request_id: string;
  status: RequestStatus;
}

// ============= STATISTICS TYPES =============

export interface RequestStatistics {
  total: number;
  byStatus: Record<RequestStatus, number>;
  byEntityType: Record<EntityType, number>;
  byActionType: Record<ActionType, number>;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  returnedCount: number;
  cancelledCount: number;
  failedCount: number;
  averageApprovalTime?: number;
}

export interface MakerStatistics {
  maker_id: string;
  maker_name: string;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvalRate: number;
}

// ============= REQUEST CREATION TYPES =============

export interface CreateApprovalRequestPayload {
  entity_type: EntityType;
  entity_id: string;
  action_type: ActionType;
  request_data: any;
  maker_comments?: string;
  metadata?: Record<string, any>;
}

export interface UpdateApprovalRequestPayload {
  request_data?: any;
  maker_comments?: string;
  metadata?: Record<string, any>;
}

// ============= TYPE GUARDS =============

export const isPendingRequest = (request: any): request is PendingRequestData => {
  return (
    request &&
    typeof request === 'object' &&
    'request_id' in request &&
    'entity_type' in request &&
    'status' in request &&
    'maker' in request
  );
};

export const isApprovalRequestDetail = (request: any): request is ApprovalRequestDetail => {
  return (
    request &&
    typeof request === 'object' &&
    'request_id' in request &&
    'entity_id' in request &&
    'request_data' in request
  );
};

// ============= HELPER FUNCTIONS =============

export const getStatusDisplayName = (status: RequestStatus): string => {
  const statusNames: Record<RequestStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    RETURNED: 'Returned',
    CANCELLED: 'Cancelled',
    FAILED: 'Failed'
  };
  return statusNames[status] || status;
};

export const getEntityDisplayName = (entityType: EntityType): string => {
  return entityType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export const getActionDisplayName = (actionType: ActionType): string => {
  return actionType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export const getRoleDisplayName = (role: UserRole): string => {
  return role
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};




// src/types/makerChecker.ts - Updated helper functions with null checks

// ============= HELPER FUNCTIONS =============



export const getEntityIcon = (entityType?: EntityType | null): string => {
  if (!entityType) return '📋';
  
  const icons: Record<EntityType, string> = {
    'WIZARD_SESSION': '🪄',
    'LAND_PARCELS': '🏞️',
    'OWNERS': '👤',
    'LEASE_AGREEMENTS': '📄',
    'ENCUMBRANCES': '🔒',
    'APPROVAL_REQUEST': '✅'
  };
  return icons[entityType] || '📋';
};

export const getStatusColor = (status?: RequestStatus | null): string => {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  const colors: Record<RequestStatus, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'RETURNED': 'bg-blue-100 text-blue-800',
    'CANCELLED': 'bg-gray-100 text-gray-800',
    'FAILED': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getActionColor = (actionType?: ActionType | null): string => {
  if (!actionType) return 'bg-gray-100 text-gray-800';
  
  const colors: Record<ActionType, string> = {
    'CREATE': 'bg-green-100 text-green-800',
    'UPDATE': 'bg-blue-100 text-blue-800',
    'DELETE': 'bg-red-100 text-red-800',
    'TRANSFER': 'bg-green-100 text-green-800',
    'SUBDIVIDE': 'bg-gray-100 text-gray-800',
    'MERGE': 'bg-gray-100 text-gray-800',
    'TERMINATE': 'bg-red-100 text-red-800',
    'EXTEND': 'bg-green-100 text-green-800',
    'ADD_OWNER': 'bg-green-100 text-green-800'
  };
  return colors[actionType] || 'bg-gray-100 text-gray-800';
};

// ============= DEFAULT VALUES =============

export const DEFAULT_PAGINATION: PaginationMetadata = {
  page: 1,
  limit: 12,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
};

export const DEFAULT_PAGE_SIZE_OPTIONS = [12, 24, 36, 48];
export const DEFAULT_SORT_FIELD = 'created_at';
export const DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'desc';

// ============= API RESPONSE TYPE ALIASES =============

export type GetPendingRequestsResponse = ApiResponse<PendingRequestData[]>;
export type GetMakerPendingRequestsResponse = ApiResponse<PendingRequestData[]>;
export type GetRequestDetailsResponse = ApiResponse<ApprovalRequestDetail>;
export type ApproveRequestResponse = ApiResponse<ApprovalActionResult>;
export type RejectRequestResponse = ApiResponse<ApprovalActionResult>;
export type ReturnRequestResponse = ApiResponse<ApprovalActionResult>;
export type CreateApprovalRequestResponse = ApiResponse<ApprovalRequestData>;
export type UpdateApprovalRequestResponse = ApiResponse<ApprovalRequestData>;

// ============= REQUEST BUILDER CONFIG =============

export interface RequestBuilderConfig {
  entityType: EntityType;
  actionType: ActionType;
  requireSubCity?: boolean;
  requireApproverRole?: UserRole;
}

export const RequestBuilderConfigs: Record<string, RequestBuilderConfig> = {
  LAND_PARCELS: {
    entityType: 'LAND_PARCELS',
    actionType: 'CREATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_ADMIN'
  },
  OWNERS: {
    entityType: 'OWNERS',
    actionType: 'CREATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_ADMIN'
  },
  LEASE_AGREEMENTS: {
    entityType: 'LEASE_AGREEMENTS',
    actionType: 'CREATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_ADMIN'
  },
  ENCUMBRANCES: {
    entityType: 'ENCUMBRANCES',
    actionType: 'CREATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_ADMIN'
  }
};