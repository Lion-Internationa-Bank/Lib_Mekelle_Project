const API_BASE = "http://localhost:5000/api/v1";

export interface OwnedParcel {
  share_ratio: string;
  acquired_at: string;
  parcel: {
    upin: string;
    file_number: string;
    sub_city: string;
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
  const res = await fetch(`${API_BASE}/owners/with-parcels?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch owners");
  return res.json();
};

export interface CreateOwnerBody {
  full_name: string;
  national_id: string;
  tin_number?: string;
  phone_number?: string;
}

export interface CreateOwnerResponse {
  success: boolean;
  data: {
    owner_id: string;
    owner: {
      owner_id: string;
      full_name: string;
      national_id: string;
      tin_number: string | null;
      phone_number: string | null;
    };
  };
}

export const createOwnerOnly = async (data: CreateOwnerBody): Promise<CreateOwnerResponse> => {
  const res = await fetch(`${API_BASE}/owners/only`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create owner");
  }
  return json;
};

export const updateOwnerApi = async (
  owner_id: string,
  data: { full_name?: string; national_id?: string; tin_number?: string; phone_number?: string }
) => {
  const res = await fetch(`${API_BASE}/owners/${owner_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update owner");
  }
  return json;
};

export const deleteOwnerApi = async (owner_id: string) => {
  const res = await fetch(`${API_BASE}/owners/${owner_id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to delete owner");
  }
  return json;
};
