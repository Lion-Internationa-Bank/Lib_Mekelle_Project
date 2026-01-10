import type { ParcelFormData } from "../validation/schemas";

const API_BASE = import.meta.env.VITE_API_URL;

export type CreateParcelData = ParcelFormData;

export const createParcel = async (data: CreateParcelData) => {
  const response = await fetch(`${API_BASE}/parcels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create parcel");
  return response.json();
};

export const createOwner = async (data: any) => {
  const response = await fetch(`${API_BASE}/owners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create owner");
  return response.json();
};

export const createLease = async (data: any) => {
  const response = await fetch(`${API_BASE}/leases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create lease");
  return response.json();
};


export const uploadDocument = async (formData: FormData) => {
  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData, // ✅ FormData - no Content-Type header
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload document");
  }
  return response.json();
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
  const url = new URL(`${API_BASE}/parcels`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch parcels");
  return response.json();
};
