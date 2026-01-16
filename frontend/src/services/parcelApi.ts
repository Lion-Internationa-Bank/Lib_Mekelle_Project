import type { ParcelFormData } from "../validation/schemas";
import apiFetch, { type ApiResponse } from './api'; // Adjust path if needed

export type CreateParcelData = ParcelFormData;

// Assuming backend returns { success: boolean, data: any } for creates
export const createParcel = async (data: CreateParcelData) => {
  const response: ApiResponse<any> = await apiFetch('/parcels', {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.success) throw new Error(response.error || "Failed to create parcel");
  return response.data; // returns the backend's full response { success: true, data: ... }
};

export const createOwner = async (data: any) => {
  const response: ApiResponse<any> = await apiFetch('/owners', {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.success) throw new Error(response.error || "Failed to create owner");
  return response.data;
};

export const createLease = async (data: any) => {
  const response: ApiResponse<any> = await apiFetch('/leases', {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.success) throw new Error(response.error || "Failed to create lease");
  return response.data;
};

export const uploadDocument = async (formData: FormData) => {
  const response: ApiResponse<any> = await apiFetch('/upload', {
    method: "POST",
    body: formData,
  });
  if (!response.success) throw new Error(response.error || "Failed to upload document");
  return response.data;
};

export interface Parcel {
  upin: string;
  file_number: string;
  sub_city: string;
  ketena: string;
  total_area_m2: number;
  land_use: string;
  tenure_type: string;
  encumbrance_status: "Encumbered" | "Clear";
  owners: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ParcelsResponse {
  success: boolean;
  data: {
    parcels: Parcel[];
    pagination: Pagination;
  };
}

export const fetchParcels = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sub_city?: string;
  ketena?: string;
  tenure_type?: string;
  land_use?: string;
}): Promise<ParcelsResponse> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.append(key, String(value));
    }
  });

  const endpoint = `/parcels?${query.toString()}`;
  const response: ApiResponse<ParcelsResponse> = await apiFetch(endpoint);
  if (!response.success) throw new Error(response.error || "Failed to fetch parcels");
  return response.data!; // Returns the backend's { success: true, data: { parcels, pagination } }
};