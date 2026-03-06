// src/types/makerChecker.ts

// ============= UNION TYPES =============

export type EntityType = 
  | 'WIZARD_SESSION'
  | 'LAND_PARCELS'
  | 'OWNERS'
  | 'LEASE_AGREEMENTS'
  | 'ENCUMBRANCES'
  | 'APPROVAL_REQUEST'
  | 'USERS'
  | 'CONFIGURATIONS'
  | 'RATE_CONFIGURATION'
  | 'SUBCITY'
  | 'REVENUE';

export type ActionType = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'TRANSFER'
  | 'SUBDIVIDE'
  | 'MERGE'
  | 'TERMINATE'
  | 'EXTEND'
  | 'ADD_OWNER'
  | 'SUSPEND'
  | 'ACTIVATE'
  | 'DEACTIVATE';

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
  | 'SUBCITY_ADMIN'
  | 'SUBCITY_APPROVER'
  | 'CITY_APPROVER'
  | 'REVENUE_APPROVER';

// ============= CONSTANTS =============

export const ENTITY_TYPES: EntityType[] = [
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
  'ADD_OWNER',
  'SUSPEND',
  'ACTIVATE',
  'DEACTIVATE'
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
  'SUBCITY_ADMIN',
  'SUBCITY_APPROVER',
  'CITY_APPROVER',
  'REVENUE_APPROVER'
];

export const ADMIN_ROLES: UserRole[] = [
  'CITY_ADMIN',
  'SUBCITY_ADMIN',
  'REVENUE_ADMIN'
];

export const APPROVER_ROLES: UserRole[] = [
  'SUBCITY_APPROVER',
  'CITY_APPROVER',
  'REVENUE_APPROVER'
];

export const REGULAR_USER_ROLES: UserRole[] = [
  'SUBCITY_NORMAL',
  'SUBCITY_AUDITOR',
  'REVENUE_USER'
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

export interface ApproverInfo {
  user_id: string;
  username: string;
  full_name: string;
  role: UserRole;
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
  approver_id?: string;
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
  approver?: ApproverInfo;
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
  approver_role?: UserRole;
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

export interface ApproverStatistics {
  approver_id: string;
  approver_name: string;
  totalReviewed: number;
  approvedCount: number;
  rejectedCount: number;
  returnedCount: number;
  averageResponseTime: number;
}

// ============= REQUEST CREATION TYPES =============

export interface CreateApprovalRequestPayload {
  entity_type: EntityType;
  entity_id: string;
  action_type: ActionType;
  request_data: any;
  maker_comments?: string;
  metadata?: Record<string, any>;
  sub_city_id?: string;
  approver_role?: UserRole;
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

export const isAdminRole = (role: UserRole): boolean => {
  return ADMIN_ROLES.includes(role);
};

export const isApproverRole = (role: UserRole): boolean => {
  return APPROVER_ROLES.includes(role);
};

export const isRegularUserRole = (role: UserRole): boolean => {
  return REGULAR_USER_ROLES.includes(role);
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
  const entityNames: Record<EntityType, string> = {
    'WIZARD_SESSION': 'Wizard Session',
    'LAND_PARCELS': 'Land Parcel',
    'OWNERS': 'Owner',
    'LEASE_AGREEMENTS': 'Lease Agreement',
    'ENCUMBRANCES': 'Encumbrance',
    'APPROVAL_REQUEST': 'Approval Request',
    'USERS': 'User',
    'CONFIGURATIONS': 'Configuration',
    'RATE_CONFIGURATION': 'Rate Configuration',
    'SUBCITY': 'Sub-city',
    'REVENUE': 'Revenue'
  };
  return entityNames[entityType] || entityType;
};

export const getActionDisplayName = (actionType: ActionType): string => {
  const actionNames: Record<ActionType, string> = {
    'CREATE': 'Create',
    'UPDATE': 'Update',
    'DELETE': 'Delete',
    'TRANSFER': 'Transfer',
    'SUBDIVIDE': 'Subdivide',
    'MERGE': 'Merge',
    'TERMINATE': 'Terminate',
    'EXTEND': 'Extend',
    'ADD_OWNER': 'Add Owner',
    'SUSPEND': 'Suspend',
    'ACTIVATE': 'Activate',
    'DEACTIVATE': 'Deactivate'
  };
  return actionNames[actionType] || actionType;
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    'CITY_ADMIN': 'City Admin',
    'SUBCITY_NORMAL': 'Sub-city Normal',
    'SUBCITY_AUDITOR': 'Sub-city Auditor',
    'REVENUE_ADMIN': 'Revenue Admin',
    'REVENUE_USER': 'Revenue User',
    'SUBCITY_ADMIN': 'Sub-city Admin',
    'SUBCITY_APPROVER': 'Sub-city Approver',
    'CITY_APPROVER': 'City Approver',
    'REVENUE_APPROVER': 'Revenue Approver'
  };
  return roleNames[role] || role;
};

export const getEntityIcon = (entityType?: EntityType | null): string => {
  if (!entityType) return '📋';
  
  const icons: Record<EntityType, string> = {
    'WIZARD_SESSION': '🪄',
    'LAND_PARCELS': '🏞️',
    'OWNERS': '👤',
    'LEASE_AGREEMENTS': '📄',
    'ENCUMBRANCES': '🔒',
    'APPROVAL_REQUEST': '✅',
    'USERS': '👥',
    'CONFIGURATIONS': '⚙️',
    'RATE_CONFIGURATION': '📊',
    'SUBCITY': '🏛️',
    'REVENUE': '💰'
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
    'TRANSFER': 'bg-purple-100 text-purple-800',
    'SUBDIVIDE': 'bg-orange-100 text-orange-800',
    'MERGE': 'bg-indigo-100 text-indigo-800',
    'TERMINATE': 'bg-red-100 text-red-800',
    'EXTEND': 'bg-green-100 text-green-800',
    'ADD_OWNER': 'bg-teal-100 text-teal-800',
    'SUSPEND': 'bg-orange-100 text-orange-800',
    'ACTIVATE': 'bg-green-100 text-green-800',
    'DEACTIVATE': 'bg-gray-100 text-gray-800'
  };
  return colors[actionType] || 'bg-gray-100 text-gray-800';
};

export const getEntityCategory = (entityType: EntityType): 'city' | 'subcity' | 'revenue' | 'system' => {
  const categories: Record<EntityType, 'city' | 'subcity' | 'revenue' | 'system'> = {
    'WIZARD_SESSION': 'subcity',
    'LAND_PARCELS': 'subcity',
    'OWNERS': 'subcity',
    'LEASE_AGREEMENTS': 'subcity',
    'ENCUMBRANCES': 'subcity',
    'APPROVAL_REQUEST': 'system',
    'USERS': 'system',
    'CONFIGURATIONS': 'city',
    'RATE_CONFIGURATION': 'revenue',
    'SUBCITY': 'city',
    'REVENUE': 'revenue'
  };
  return categories[entityType];
};

export const getRequiredApproverRole = (entityType: EntityType, makerRole: UserRole): UserRole | null => {
  // City-level entities
  if (entityType === 'CONFIGURATIONS' || entityType === 'SUBCITY') {
    return 'CITY_APPROVER';
  }
  
  // Revenue-level entities
  if (entityType === 'RATE_CONFIGURATION' || entityType === 'REVENUE') {
    return 'REVENUE_APPROVER';
  }
  
  // Sub-city level entities
  if (['WIZARD_SESSION', 'LAND_PARCELS', 'OWNERS', 'LEASE_AGREEMENTS', 'ENCUMBRANCES'].includes(entityType)) {
    return 'SUBCITY_APPROVER';
  }
  
  // User management based on maker role
  if (entityType === 'USERS') {
    if (makerRole === 'CITY_ADMIN') return 'CITY_APPROVER';
    if (makerRole === 'SUBCITY_ADMIN') return 'SUBCITY_APPROVER';
    if (makerRole === 'REVENUE_ADMIN') return 'REVENUE_APPROVER';
  }
  
  return null;
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
  description: string;
}

export const RequestBuilderConfigs: Record<string, RequestBuilderConfig> = {
  // Land Parcels
  LAND_PARCELS_CREATE: {
    entityType: 'LAND_PARCELS',
    actionType: 'CREATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Create new land parcel'
  },
  LAND_PARCELS_UPDATE: {
    entityType: 'LAND_PARCELS',
    actionType: 'UPDATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Update land parcel'
  },
  LAND_PARCELS_TRANSFER: {
    entityType: 'LAND_PARCELS',
    actionType: 'TRANSFER',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Transfer parcel ownership'
  },
  LAND_PARCELS_SUBDIVIDE: {
    entityType: 'LAND_PARCELS',
    actionType: 'SUBDIVIDE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Subdivide parcel'
  },
  LAND_PARCELS_MERGE: {
    entityType: 'LAND_PARCELS',
    actionType: 'MERGE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Merge parcels'
  },
  LAND_PARCELS_TERMINATE: {
    entityType: 'LAND_PARCELS',
    actionType: 'TERMINATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Terminate parcel'
  },
  
  // Owners
  OWNERS_CREATE: {
    entityType: 'OWNERS',
    actionType: 'CREATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Create new owner'
  },
  OWNERS_UPDATE: {
    entityType: 'OWNERS',
    actionType: 'UPDATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Update owner'
  },
  OWNERS_ADD_OWNER: {
    entityType: 'OWNERS',
    actionType: 'ADD_OWNER',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Add owner to parcel'
  },
  
  // Lease Agreements
  LEASE_CREATE: {
    entityType: 'LEASE_AGREEMENTS',
    actionType: 'CREATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Create lease agreement'
  },
  LEASE_UPDATE: {
    entityType: 'LEASE_AGREEMENTS',
    actionType: 'UPDATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Update lease agreement'
  },
  LEASE_EXTEND: {
    entityType: 'LEASE_AGREEMENTS',
    actionType: 'EXTEND',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Extend lease agreement'
  },
  LEASE_TERMINATE: {
    entityType: 'LEASE_AGREEMENTS',
    actionType: 'TERMINATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Terminate lease agreement'
  },
  
  // Encumbrances
  ENCUMBRANCES_CREATE: {
    entityType: 'ENCUMBRANCES',
    actionType: 'CREATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Create encumbrance'
  },
  ENCUMBRANCES_UPDATE: {
    entityType: 'ENCUMBRANCES',
    actionType: 'UPDATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Update encumbrance'
  },
  ENCUMBRANCES_TERMINATE: {
    entityType: 'ENCUMBRANCES',
    actionType: 'TERMINATE',
    requireSubCity: true,
    requireApproverRole: 'SUBCITY_APPROVER',
    description: 'Terminate encumbrance'
  },
  
  // Users
  USERS_CREATE: {
    entityType: 'USERS',
    actionType: 'CREATE',
    requireSubCity: false,
    requireApproverRole: 'CITY_APPROVER',
    description: 'Create new user'
  },
  USERS_UPDATE: {
    entityType: 'USERS',
    actionType: 'UPDATE',
    requireSubCity: false,
    requireApproverRole: 'CITY_APPROVER',
    description: 'Update user'
  },
  USERS_SUSPEND: {
    entityType: 'USERS',
    actionType: 'SUSPEND',
    requireSubCity: false,
    requireApproverRole: 'CITY_APPROVER',
    description: 'Suspend user'
  },
  USERS_ACTIVATE: {
    entityType: 'USERS',
    actionType: 'ACTIVATE',
    requireSubCity: false,
    requireApproverRole: 'CITY_APPROVER',
    description: 'Activate user'
  },
  
  // Configurations
  CONFIGURATIONS_CREATE: {
    entityType: 'CONFIGURATIONS',
    actionType: 'CREATE',
    requireSubCity: false,
    requireApproverRole: 'CITY_APPROVER',
    description: 'Create configuration'
  },
  CONFIGURATIONS_UPDATE: {
    entityType: 'CONFIGURATIONS',
    actionType: 'UPDATE',
    requireSubCity: false,
    requireApproverRole: 'CITY_APPROVER',
    description: 'Update configuration'
  },
  
  // Rate Configurations
  RATE_CONFIGURATION_CREATE: {
    entityType: 'RATE_CONFIGURATION',
    actionType: 'CREATE',
    requireSubCity: false,
    requireApproverRole: 'REVENUE_APPROVER',
    description: 'Create rate configuration'
  },
  RATE_CONFIGURATION_UPDATE: {
    entityType: 'RATE_CONFIGURATION',
    actionType: 'UPDATE',
    requireSubCity: false,
    requireApproverRole: 'REVENUE_APPROVER',
    description: 'Update rate configuration'
  },
  RATE_CONFIGURATION_DEACTIVATE: {
    entityType: 'RATE_CONFIGURATION',
    actionType: 'DEACTIVATE',
    requireSubCity: false,
    requireApproverRole: 'REVENUE_APPROVER',
    description: 'Deactivate rate configuration'
  },
  
  // Sub-cities
  SUBCITY_CREATE: {
    entityType: 'SUBCITY',
    actionType: 'CREATE',
    requireSubCity: false,
    requireApproverRole: 'CITY_APPROVER',
    description: 'Create sub-city'
  },
  SUBCITY_UPDATE: {
    entityType: 'SUBCITY',
    actionType: 'UPDATE',
    requireSubCity: false,
    requireApproverRole: 'CITY_APPROVER',
    description: 'Update sub-city'
  },
  
  // Revenue
  REVENUE_CREATE: {
    entityType: 'REVENUE',
    actionType: 'CREATE',
    requireSubCity: false,
    requireApproverRole: 'REVENUE_APPROVER',
    description: 'Create revenue record'
  },
  REVENUE_UPDATE: {
    entityType: 'REVENUE',
    actionType: 'UPDATE',
    requireSubCity: false,
    requireApproverRole: 'REVENUE_APPROVER',
    description: 'Update revenue record'
  }
};