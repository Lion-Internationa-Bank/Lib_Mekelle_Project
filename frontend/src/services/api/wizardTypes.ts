// src/services/api/wizardTypes.ts
export interface SaveStepData {
  step: string;
  data: any;
}

export interface DocumentData {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface SessionData {
  session_id: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'MERGED';
  current_step: string;
  parcel_data: any;
  parcel_docs: DocumentData[];
  owner_data: any;
  owner_docs: DocumentData[];
  lease_data: any;
  lease_docs: DocumentData[];
  user_id: string;
  sub_city_id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  approval_request?: {
    request_id: string;
    status: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  missing: string[];
}

export interface SubmitResult {
  success: boolean;
  requiresApproval: boolean;
  immediateResult?: any;
  approvalRequestId?: string;
  message: string;
}

export interface ApprovalRequest {
  request_id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  maker_id: string;
  approver_role: string;
  sub_city_id?: string;
  created_at: string;
  request_data?: any;
  maker?: {
    user_id: string;
    username: string;
    full_name: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiDataWrapper<T> {
  data: T;
  success?: boolean;
  message?: string;
  error?: string;
}