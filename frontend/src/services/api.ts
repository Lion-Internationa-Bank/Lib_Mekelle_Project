
const API_BASE = import.meta.env.VITE_API_URL;


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
