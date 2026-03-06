// Backend response wrapper (what your API returns)
export interface BackendResponse<T> {
  success: boolean;
  data: T;  // The actual data (could be another wrapper)
  message?: string;
  error?: string;
}

// API response after unwrapping (for your service layer)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Session API data (what the backend returns for session operations)
export interface SessionApiData {
  session_id: string;
  existing?: boolean;
}

// Document API data
export interface DocumentApiData {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
}

// Validation API data
export interface ValidationApiData {
  valid: boolean;
  missing: string[];
}

// Submit API data
export interface SubmitApiData {
  requiresApproval: boolean;
  approval_request_id?: string;
  message: string;
  history_id?: string;
}

// Delete API data
export interface DeleteApiData {
  success: boolean;
  message: string;
}

// Document data for frontend state
export interface DocumentData {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
}

// Session data for frontend state
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

// Save step data
export interface SaveStepData {
  step: string;
  data: any;
}


export interface WizardSession {
  session_id: string;
  user_id: string;
  user_role: string;
  sub_city_id: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'MERGED';
  parcel_data: any | null;  // Can be null
  parcel_docs: DocumentData[] | null;  // Can be null
  owner_data: Array<{
    owner_id?: string;
    full_name: string;
    tin_number: string;
    acquired_at: string;
    national_id: string;
    phone_number: string;
  }> | null;
  owner_docs: DocumentData[] | null;
  lease_data: {
    start_date: string;
    price_per_m2: number;
    contract_date?: string;
    other_payment?: number;
    demarcation_fee?: number;
    legal_framework: string;
    lease_period_years: number;
    payment_term_years: number;
    total_lease_amount: number;
    down_payment_amount: number;
    engineering_service_fee?: number;
    contract_registration_fee?: number;
  } | null;
  lease_docs: DocumentData[] | null;
  approval_request_id: string | null;
  current_step: string;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  expires_at: string;
  completed_at: string | null;
  approval_request?: {
    request_id: string;
    entity_id: string;
    request_data: any;
    status: string;
    maker_id: string;
    maker_role: string;
    approver_role: string;
    sub_city_id: string;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    approved_at: string | null;
    rejected_at: string | null;
    deleted_at: string | null;
    is_deleted: boolean;
    action_type: string;
    entity_type: string;
    comments: string;
    maker?: {
      user_id: string;
      username: string;
      full_name: string;
    };
  } | null;
  user?: {
    user_id: string;
    username: string;
    full_name: string;
    role: string;
  };
  sub_city?: {
    sub_city_id: string;
    name: string;
  };
}
// Validation result
export interface ValidationResult {
  valid: boolean;
  missing: string[];
}

// Submit result
export interface SubmitResult {
  success: boolean;
  requiresApproval: boolean;
  immediateResult?: any;
  approvalRequestId?: string;
  message: string;
}

// Approval request
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