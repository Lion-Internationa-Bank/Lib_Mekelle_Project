const API_BASE = "http://localhost:5000/api/v1";

export type ParcelDocument = {
  doc_id: string;
  doc_type: string;
  file_url: string;
  file_name: string;
  upload_date: string;
  is_verified: boolean;
};

export type ParcelOwner = {
  parcel_owner_id: string;
  share_ratio: string;
  acquired_at: string;
  owner: {
    owner_id: string;
    full_name: string;
    national_id: string;
    tin_number: string | null;
    phone_number: string | null;
    documents: ParcelDocument[];
  };
};

export type LeaseAgreement = {
  lease_id: string;
  annual_lease_fee: string;
  total_lease_amount: string;
  down_payment_amount: string;
  annual_installment: string;
  price_per_m2: string;
  lease_period_years: number;
  payment_term_years: number;
  start_date: string;
  expiry_date: string;
  contract_date: string;
  legal_framework: string;
  documents: ParcelDocument[];
};

export type Encumbrance = {
  encumbrance_id: string;
  type: string;
  issuing_entity: string;
  reference_number: string;
  status: string;
  registration_date: string;
  documents: ParcelDocument[];
};

export type Building = {
  building_id: string;
  usage_type: string;
  total_area: string;
  floor_count: number;
};

export type BillingTransaction = {
  transaction_id: string;
  revenue_type: string;
  receipt_serial_no: string;
  amount_paid: string;
  payment_date: string;
};

export type BillingRecord = {
  bill_id: string;
  fiscal_year: string;
  bill_type: string;
  amount_due: string;
  amount_paid: string;
  penalty_amount: string;
  payment_status: string;
  transactions: BillingTransaction[];
};

export type BillingSummary = Record<string, BillingRecord[]>;

export interface ParcelDetail {
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
  geometry_data: string | null;
  created_at: string;
  updated_at: string;
  owners: ParcelOwner[];
  lease_agreement: LeaseAgreement | null;
  buildings: Building[];
  encumbrances: Encumbrance[];
  documents: ParcelDocument[];
  billing_records: BillingRecord[];
  billing_summary: BillingSummary;
}

export interface ParcelDetailResponse {
  success: boolean;
  data: ParcelDetail;
}



export type TransferType = "SALE" | "GIFT" | "HEREDITY" | "CONVERSION";

export interface LiteOwner {
  owner_id: string;
  full_name: string;
  national_id: string;
  phone_number: string | null;
  tin_number: string | null;
}

export const fetchParcelDetail = async (upin: string): Promise<ParcelDetailResponse> => {
  const res = await fetch(`${API_BASE}/parcels/${encodeURIComponent(upin)}`);
  if (!res.ok) throw new Error("Failed to fetch parcel detail");
  return res.json();
};



export const updateParcelApi = async (upin: string, data: any) => {
  const res = await fetch(`${API_BASE}/parcels/${encodeURIComponent(upin)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to update parcel");
  return json;
};

export const deleteParcelApi = async (upin: string) => {
  const res = await fetch(`${API_BASE}/parcels/${encodeURIComponent(upin)}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to delete parcel");
  return json;
};

export const updateOwnerApi = async (
  owner_id: string,
  data: { full_name?: string; phone_number?: string; tin_number?: string; national_id?: string }
) => {
  const res = await fetch(`${API_BASE}/owners/${owner_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to update owner");
  return json;
};

export const updateLeaseApi = async (lease_id: string, data: any) => {
  const res = await fetch(`${API_BASE}/leases/${lease_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to update lease");
  return json;
};

export const updateEncumbranceApi = async (encumbrance_id: string, data: any) => {
  const res = await fetch(`${API_BASE}/parcels/encumbrances/${encumbrance_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to update encumbrance");
  return json;
};

// Adjust path to match your actual route for share update
export const updateOwnerShareApi = async (parcel_owner_id: string, share_ratio: number) => {
  const res = await fetch(`${API_BASE}/parcels/owners/${parcel_owner_id}/share`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ share_ratio }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to update share");
  return json;
};



// services/parcelDetailApi.ts (add this function)

export const createEncumbranceApi = async (data: {
  upin: string;
  type: string;
  issuing_entity: string;
  reference_number?: string;
  registration_date?: string;
}) => {
  const res = await fetch(`${API_BASE}/parcels/encumbrances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      status: "ACTIVE", // Always create as ACTIVE
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create encumbrance");
  }
  return json;
};





export const searchOwnersLiteApi = async (search: string) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const res = await fetch(`${API_BASE}/owners/search-lite?${params.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to search owners");
  }
  return json.data.owners as LiteOwner[];
};

export const transferOwnershipApi = async (upin: string, body: {
  from_owner_id: string;
  to_owner_id: string;
  to_share_ratio: number;
  transfer_type: TransferType;
  transfer_price?: number;
  reference_no?: string;
}) => {
  const res = await fetch(`${API_BASE}/parcels/${encodeURIComponent(upin)}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to transfer ownership");
  }
  return json.data as {
    history: { history_id: string };
    newOwnership: any;
    finalTotalShares: number;
    transfer_type: string;
    from_owner_remaining: number;
  };
};
