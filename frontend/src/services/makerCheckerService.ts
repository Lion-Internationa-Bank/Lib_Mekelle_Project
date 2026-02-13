// src/services/makerCheckerService.ts
import apiFetch, { type ApiResponse } from './api';
import { 
  type ApprovalRequest, 
  type ActionType, 
  type RequestStatus, 
  type UserRole 
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
}

export interface RequestDetails extends ApprovalRequest {
  // Already includes all fields from ApprovalRequest
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

// src/services/makerCheckerService.ts - Updated API functions

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
): Promise<ApiResponse<PendingRequest[]>> => {
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

  return apiFetch<PendingRequest[]>(`/maker-checker/requests?${queryParams}`, {
    method: 'GET',
  });
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
): Promise<ApiResponse<PendingRequest[]>> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.entity_type && { entity_type: filters.entity_type }),
    ...(filters?.action_type && { action_type: filters.action_type }),
    ...(filters?.sortBy && { sortBy: filters.sortBy }),
    ...(filters?.sortOrder && { sortOrder: filters.sortOrder })
  });

  return apiFetch<PendingRequest[]>(`/maker-checker/makers/${makerId}/pending-requests?${queryParams}`, {
    method: 'GET',
  });
};

// Get request details
export const getRequestDetails = async (requestId: string): Promise<ApiResponse<RequestDetails>> => {
  const response:ApiResponse<RequestDetails> =  await apiFetch (`/maker-checker/requests/${requestId}`, {
    method: 'GET',
  });
  if (!response.success) throw new Error(response.error || "Failed to fetch parcels");
  console.log("Response from get request details",response)
  return response;
};

// Approve request
export const approveRequest = async (
  requestId: string, 
  params?: ApprovalParams
): Promise<ApiResponse<ApprovalResponse>> => {
  return apiFetch<ApprovalResponse>(`/maker-checker/requests/${requestId}/approve`, {
    method: 'POST',
    body: params ? JSON.stringify(params) : JSON.stringify({}),
  });
};

// Reject request
export const rejectRequest = async (
  requestId: string, 
  params: RejectionParams
): Promise<ApiResponse<RejectionResponse>> => {
  return apiFetch<RejectionResponse>(`/maker-checker/requests/${requestId}/reject`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

// Optional: Get approval logs for a request
export const getRequestLogs = async (requestId: string): Promise<ApiResponse<any[]>> => {
  return apiFetch<any[]>(`/maker-checker/requests/${requestId}/logs`, {
    method: 'GET',
  });
};

// Optional: Get requests by status
export const getRequestsByStatus = async (
  status: RequestStatus,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<{ requests: ApprovalRequest[], total: number, page: number, limit: number }>> => {
  return apiFetch<{ requests: ApprovalRequest[], total: number, page: number, limit: number }>(
    `/maker-checker/requests?status=${status}&page=${page}&limit=${limit}`,
    {
      method: 'GET',
    }
  );
};

// Optional: Get my submitted requests
export const getMyRequests = async (
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<{ requests: ApprovalRequest[], total: number, page: number, limit: number }>> => {
  return apiFetch<{ requests: ApprovalRequest[], total: number, page: number, limit: number }>(
    `/api/v1/maker-checker/requests/my?page=${page}&limit=${limit}`,
    {
      method: 'GET',
    }
  );
};