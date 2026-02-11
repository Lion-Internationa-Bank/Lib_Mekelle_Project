import { toast } from 'sonner';
import type {
  UpdateOwnerFormData,
} from "../validation/schemas";
import type { SubCity } from "./cityAdminService";
import apiFetch from './api';


export interface CreateOwnerResponse {
  success: boolean;
  message: string;
  data: {
    owner_id?: string;
    approval_request_id?: string;
    entity_type: string;
    action_type: string;
    status: string;
    approver_role: string;
    estimated_processing: string;
    submitted_at: string;
    document_upload?: {
      allowed: boolean;
      endpoint: string;
      allowed_types: string[];
      max_files: number;
      max_size_mb: number;
      current_count: number;
    };
    maker_info?: {
      user_id: string;
      role: string;
    };
  };
}




export interface CreateOwnerOnlyData {
  full_name: string;
  national_id: string;
  tin_number?: string;
  phone_number: string;
}


export interface OwnedParcel {
  share_ratio: string;
  acquired_at: string;
  parcel: {
    upin: string;
    file_number: string;
    sub_city: SubCity;
    tabia: string;
    ketena: string;
    block: string;
    total_area_m2: string;
    land_use: string;
    land_grade: string;
    tenure_type: string;
  };
}

export interface OwnerWithParcels {
  owner_id: string;
  full_name: string;
  national_id: string;
  tin_number: string | null;
  phone_number: string | null;
  parcels: OwnedParcel[];
}

export interface OwnersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface OwnersResponse {
  success: boolean;
  data: {
    owners: OwnerWithParcels[];
    pagination: OwnersPagination;
  };
}

export const fetchOwnersWithParcels = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<OwnersResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  const apiRes = await apiFetch<OwnersResponse>(`/owners/with-parcels?${query.toString()}`);
  if (!apiRes.success) throw new Error(apiRes.error || "Failed to fetch owners");
  return apiRes.data!;
};


export const createOwnerOnly = async (data: CreateOwnerOnlyData): Promise<CreateOwnerResponse> => {
  const apiRes = await apiFetch<any>('/owners/only', {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to create owner");
  }
  
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to create owner");
  }
  
  // Handle different success responses
  if (json.data.approval_request_id) {
    // Approval required
    toast.info(json.message || 'Owner creation request submitted for approval');
  } else {
    // Immediate execution
    toast.success(json.message || 'Owner created successfully');
  }
  
  return json;
};
export const updateOwnerApi = async (
  owner_id: string,
  data: UpdateOwnerFormData
) => {
  const apiRes = await apiFetch<any>(`/owners/${owner_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to update owner");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to update owner");
  }
  return json;
};

export const deleteOwnerApi = async (owner_id: string) => {
  const apiRes = await apiFetch<any>(`/owners/${owner_id}`, {
    method: "DELETE",
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to delete owner");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to delete owner");
  }
  return json;
};






