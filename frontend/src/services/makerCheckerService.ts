import apiFetch, { type ApiResponse } from './api';
import { 
  type ApprovalRequest, 
  type ActionType, 
  type RequestStatus, 
  type UserRole,
  type PaginationMetadata
} from '../types/makerChecker';

// Types for API responses
export interface PendingRequest {
  request_id: string;
  entity_type: string;
  action_type: ActionType;
  status: RequestStatus;
  created_at: string;
  maker: {
    user_id: string;
    username: string;
    full_name: string;
    role: UserRole;
  };
  sub_city?: {
    sub_city_id: string;
    name: string;
  };
}

// export interface RequestDetails extends ApprovalRequest {
  
//   // Already includes all fields from ApprovalRequest
// }
// 
// In your makerCheckerService.ts, update the RequestDetails interface:

export interface RequestDetails {
  request_id: string;
  entity_id: string;
  request_data: any;
  status: string;
  maker_id: string;
  maker_role: UserRole;
  approver_role: UserRole;
  approver_id?: string;
  sub_city_id?: string;
  rejection_reason?: string ;
  comments?: string | null; // This maps to maker_comments
  approver_comments?: string ;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  submitted_at?: string ;
  approved_at?: string ;
  rejected_at?: string ;
  deleted_at?: string ;
  is_deleted: boolean;
  action_type: string;
  entity_type: string;
  maker: {
    user_id: string;
    username: string;
    full_name: string;
    role: UserRole;
  };
  sub_city?: {
    sub_city_id: string;
    name: string;
  };
  approver?: {
    user_id: string;
    username: string;
    full_name: string;
    role: UserRole;
  };
}

export interface ApprovalParams {
  comments?: string;
}

export interface RejectionParams {
  rejection_reason: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: {
    approval: any;
    execution: any;
  };
}

export interface RejectionResponse {
  success: boolean;
  message: string;
  data?: {
    approval: any;
    wizard_session_updated?: boolean;
  };
}

// Backend response structure with nested data and pagination
interface BackendListResponse<T> {
  data: T;
  pagination: PaginationMetadata;
}

interface BackendSingleResponse<T> {
  data: T;
}

// Extended ApiResponse with pagination for the frontend
export interface ApiResponseWithPagination<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMetadata;
  message?: string;
  error?: string;
}

// Get pending requests for approvers (with pagination and filters)
export const getPendingRequests = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    entity_type?: string;
    action_type?: string;
    maker_id?: string;
    from_date?: string;
    to_date?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<ApiResponseWithPagination<PendingRequest[]>> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.entity_type && { entity_type: filters.entity_type }),
    ...(filters?.action_type && { action_type: filters.action_type }),
    ...(filters?.maker_id && { maker_id: filters.maker_id }),
    ...(filters?.from_date && { from_date: filters.from_date }),
    ...(filters?.to_date && { to_date: filters.to_date }),
    ...(filters?.sortBy && { sortBy: filters.sortBy }),
    ...(filters?.sortOrder && { sortOrder: filters.sortOrder })
  });

  // apiFetch returns ApiResponse<BackendListResponse<PendingRequest[]>>
  const response = await apiFetch<BackendListResponse<PendingRequest[]>>(`/maker-checker/requests?${queryParams}`, {
    method: 'GET',
  });
  
  // Transform the response to unwrap the nested data
  if (response.success && response.data) {
    return {
      success: true,
      data: response.data.data, // This is the array of PendingRequest
      pagination: response.data.pagination, // This is the pagination object
      message: response.message
    };
  }
  
  return {
    success: false,
    data: [],
    error: response.error || 'Failed to fetch pending requests'
  };
};

// Get maker's own pending requests (with pagination and filters)
export const getMakerPendingRequests = async (
  makerId: string,
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    entity_type?: string;
    action_type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<ApiResponseWithPagination<PendingRequest[]>> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.entity_type && { entity_type: filters.entity_type }),
    ...(filters?.action_type && { action_type: filters.action_type }),
    ...(filters?.sortBy && { sortBy: filters.sortBy }),
    ...(filters?.sortOrder && { sortOrder: filters.sortOrder })
  });

  const response = await apiFetch<BackendListResponse<PendingRequest[]>>(`/maker-checker/makers/${makerId}/pending-requests?${queryParams}`, {
    method: 'GET',
  });
  
  // Transform the response to unwrap the nested data
  if (response.success && response.data) {
    return {
      success: true,
      data: response.data.data, // This is the array of PendingRequest
      pagination: response.data.pagination, // This is the pagination object
      message: response.message
    };
  }
  
  return {
    success: false,
    data: [],
    error: response.error || 'Failed to fetch maker pending requests'
  };
};

// Get request details
// Get request details
export const getRequestDetails = async (requestId: string): Promise<ApiResponse<RequestDetails>> => {
  const response = await apiFetch<BackendSingleResponse<RequestDetails>>(`/maker-checker/requests/${requestId}`, {
    method: 'GET',
  });
  
  console.log("Response from get request details", response);
  
  // Transform the response to unwrap data.data
  if (response.success && response.data) {
    return {
      success: true,
      data: response.data.data, // This should match RequestDetails interface
      message: response.message
    };
  }
  
  return {
    success: false,
    error: response.error || 'Failed to fetch request details'
  };
};

// Approve request
export const approveRequest = async (
  requestId: string, 
  params?: ApprovalParams
): Promise<ApiResponse<ApprovalResponse>> => {
  const response = await apiFetch<BackendSingleResponse<ApprovalResponse>>(`/maker-checker/requests/${requestId}/approve`, {
    method: 'POST',
    body: params ? JSON.stringify(params) : JSON.stringify({}),
  });
  
  // Transform the response to unwrap the nested data
  if (response.success && response.data) {
    return {
      success: true,
      data: response.data.data, // This is the ApprovalResponse
      message: response.message
    };
  }
  
  return {
    success: false,
    error: response.error || 'Failed to approve request'
  };
};

// Reject request
export const rejectRequest = async (
  requestId: string, 
  params: RejectionParams
): Promise<ApiResponse<RejectionResponse>> => {
  const response = await apiFetch<BackendSingleResponse<RejectionResponse>>(`/maker-checker/requests/${requestId}/reject`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  
  // Transform the response to unwrap the nested data
  if (response.success && response.data) {
    return {
      success: true,
      data: response.data.data, // This is the RejectionResponse
      message: response.message
    };
  }
  
  return {
    success: false,
    error: response.error || 'Failed to reject request'
  };
};

// Get approval logs for a request
export const getRequestLogs = async (requestId: string): Promise<ApiResponse<any[]>> => {
  const response = await apiFetch<BackendSingleResponse<any[]>>(`/maker-checker/requests/${requestId}/logs`, {
    method: 'GET',
  });
  
  // Transform the response to unwrap the nested data
  if (response.success && response.data) {
    return {
      success: true,
      data: response.data.data, // This is the array of logs
      message: response.message
    };
  }
  
  return {
    success: false,
    error: response.error || 'Failed to fetch request logs'
  };
};

// Get requests by status
export const getRequestsByStatus = async (
  status: RequestStatus,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<{ requests: ApprovalRequest[], total: number, page: number, limit: number }>> => {
  const response = await apiFetch<BackendSingleResponse<{ requests: ApprovalRequest[], total: number, page: number, limit: number }>>(
    `/maker-checker/requests?status=${status}&page=${page}&limit=${limit}`,
    {
      method: 'GET',
    }
  );
  
  // Transform the response to unwrap the nested data
  if (response.success && response.data) {
    return {
      success: true,
      data: response.data.data, // This is the object with requests, total, page, limit
      message: response.message
    };
  }
  
  return {
    success: false,
    error: response.error || 'Failed to fetch requests by status'
  };
};

// Get my submitted requests
export const getMyRequests = async (
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<{ requests: ApprovalRequest[], total: number, page: number, limit: number }>> => {
  const response = await apiFetch<BackendSingleResponse<{ requests: ApprovalRequest[], total: number, page: number, limit: number }>>(
    `/maker-checker/requests/my?page=${page}&limit=${limit}`,
    {
      method: 'GET',
    }
  );
  
  // Transform the response to unwrap the nested data
  if (response.success && response.data) {
    return {
      success: true,
      data: response.data.data, // This is the object with requests, total, page, limit
      message: response.message
    };
  }
  
  return {
    success: false,
    error: response.error || 'Failed to fetch my requests'
  };
};