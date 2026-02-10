// src/types/makerChecker.ts
export interface ApprovalRequest {
  success: boolean;
  data:{
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
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejected_at?: string;
  deleted_at?: string;
  is_deleted: boolean;
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
  
}

export interface PendingRequest {
  success: Boolean;
  data: {
    request_id: string;
  entity_type: EntityType;
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
  
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}