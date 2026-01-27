// src/services/parcelDetailApi.ts
import type {
  EditParcelFormData,
  EditOwnerFormData,
  EditShareFormData,
  TransferOwnershipFormData,
  EditLeaseFormData,
  EncumbranceFormData,
} from "../validation/schemas";
import apiFetch from './api';

// ------------ Shared DTOs from backend ------------

export type ParcelDocument = {
  doc_id: string;
  doc_type: string;
  file_url: string;
  file_name: string;
  upload_date: string;
  is_verified: boolean;
};
export type Subcity = {
  name:string;
  description:string;
}

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
  annual_lease_fee: number;
  total_lease_amount: number;
  down_payment_amount: number;
  annual_installment: number;
  price_per_m2: number;
  lease_period_years: number;
  payment_term_years: number;
  start_date: string;
  expiry_date: string;
  contract_date: string;
  legal_framework: string;
  documents: ParcelDocument[];
};

export type OwnershipHistoryEntry = {
  history_id: string;
  transfer_type: string;
  transfer_date: string;
  transfer_price: string | null;
  reference_no: string | null;
  from_owner_id: string | null;
  to_owner_id: string | null;
  to_owner_name: string | null;
  from_owner_name: string | null;
  event_snapshot: {
    timestamp: string;
    final_total: number;
    owners_before: Array<{
      id: string;
      name: string;
      share: number;
    }>;
    previous_total: number;
  };
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
  amount_due: Number;
  amount_paid: Number;
  penalty_amount: Number;
  payment_status: string;
  bank_reference:string
  due_date:string;
  interest_amount:Number;
  base_payment:Number;
  installment_number:Number;
  remaining_amount:Number;
  transactions: BillingTransaction[];
};

export type BillingSummary = Record<string, BillingRecord[]>;

export interface ParcelDetail {
  upin: string;
  file_number: string;
  sub_city: Subcity;
  tabia: string;
  ketena: string;
  block: string;
  total_area_m2: string;
  land_use: string;
  land_grade: string;
  tenure_type: string;
  boundary_coords: string | null;
  boundary_north:string| null;
  boundary_south: string | null,
  boundary_west: string | null,
  boundary_east: string | null,
  created_at: string;
  updated_at: string;
  owners: ParcelOwner[];
  lease_agreement: LeaseAgreement | null;
  buildings: Building[];
  encumbrances: Encumbrance[];
  history: OwnershipHistoryEntry[];
  documents: ParcelDocument[];
  billing_records: BillingRecord[];
  billing_summary: BillingSummary;
}

export interface ParcelDetailResponse {
  success: boolean;
  data: ParcelDetail;
}

// ------------ Lite owner + enums ------------

// export type TransferType = "SALE" | "GIFT" | "HEREDITY" | "CONVERSION";

export interface LiteOwner {
  owner_id: string;
  full_name: string;
  national_id: string;
  phone_number: string | null;
  tin_number: string | null;
}

// ------------ Fetch parcel detail ------------

export const fetchParcelDetail = async (
  upin: string
): Promise<ParcelDetailResponse> => {
  const apiRes = await apiFetch<ParcelDetailResponse>(`/parcels/${encodeURIComponent(upin)}`);
  if (!apiRes.success) throw new Error(apiRes.error || "Failed to fetch parcel detail");
  return apiRes.data!;
};

// ------------ Update parcel (uses EditParcelFormData) ------------

export const updateParcelApi = async (
  upin: string,
  data: EditParcelFormData
) => {
  const apiRes = await apiFetch<any>(`/parcels/${encodeURIComponent(upin)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to update parcel");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to update parcel");
  }
  return json;
};

// ------------ Delete parcel ------------

export const deleteParcelApi = async (upin: string) => {
  const apiRes = await apiFetch<any>(`/parcels/${encodeURIComponent(upin)}`, {
    method: "DELETE",
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to delete parcel");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to delete parcel");
  }
  return json;
};

// ------------ Update owner (uses EditOwnerFormData) ------------

export const updateOwnerApi = async (
  owner_id: string,
  data: EditOwnerFormData
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

// ------------ Update parcel owner share (uses EditShareFormData) ------------

export const updateOwnerShareApi = async (
  parcel_owner_id: string,
  share_ratio: EditShareFormData["share_ratio"]
) => {
  const apiRes = await apiFetch<any>(`/parcels/owners/${parcel_owner_id}/share`, {
    method: "PUT",
    body: JSON.stringify({ share_ratio }),
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to update share");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to update share");
  }
  return json;
};

// ------------ Update lease (uses EditLeaseFormData) ------------

export const updateLeaseApi = async (
  lease_id: string,
  data: EditLeaseFormData
) => {
  const apiRes = await apiFetch<any>(`/leases/${lease_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to update lease");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to update lease");
  }
  return json;
};

// ------------ Encumbrance create/update (uses EncumbranceFormData) ------------

export const createEncumbranceApi = async (
  data: EncumbranceFormData & { upin: string }
) => {
  const apiRes = await apiFetch<any>(`/parcels/encumbrances`, {
    method: "POST",
    body: JSON.stringify({
      upin: data.upin,
      type: data.type,
      issuing_entity: data.issuing_entity,
      reference_number: data.reference_number || undefined,
      registration_date:
        data.registration_date && data.registration_date !== ""
          ? data.registration_date
          : undefined,
      status: "ACTIVE",
    }),
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to create encumbrance");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to create encumbrance");
  }
  return json;
};

export const updateEncumbranceApi = async (
  encumbrance_id: string,
  data: EncumbranceFormData
) => {
  const apiRes = await apiFetch<any>(`/parcels/encumbrances/${encumbrance_id}`, {
    method: "PUT",
    body: JSON.stringify({
      type: data.type,
      issuing_entity: data.issuing_entity,
      reference_number: data.reference_number ?? undefined,
      status: data.status,
      registration_date:
        data.registration_date && data.registration_date !== ""
          ? data.registration_date
          : undefined,
    }),
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to update encumbrance");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to update encumbrance");
  }
  return json;
};

// ------------ Owners search (lite) ------------

export const searchOwnersLiteApi = async (search: string) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const apiRes = await apiFetch<any>(`/owners/search-lite?${params.toString()}`);
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to search owners");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to search owners");
  }
  return json.data.owners as LiteOwner[];
};

// ------------ Ownership transfer (uses TransferOwnershipFormData) ------------

export const transferOwnershipApi = async (
  upin: string,
  body: TransferOwnershipFormData
) => {
  const apiRes = await apiFetch<any>(`/parcels/${encodeURIComponent(upin)}/transfer`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to transfer ownership");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to transfer ownership");
  }
  return json.data as {
    history: { history_id: string };
    newOwnership: any;
    transfer_type: string;
    message:any;
  };
};




export const addCoOwnerToParcel = async (
  upin: string,
  owner_id: string,
  acquired_at?: string
) => {
  const apiRes = await apiFetch<any>(`/parcels/${encodeURIComponent(upin)}/owners`, {
    method: "POST",
    body: JSON.stringify({
      owner_id,
      acquired_at: acquired_at || undefined,
    }),
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to add co-owner");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to add co-owner");
  }
  return json.data;
};


// src/services/parcelDetailApi.ts
export const subdivideParcel = async (
  upin: string,
  childParcels: Array<{
    upin: string;
    file_number: string;
    total_area_m2: number;
    boundary_coords?: any;
    boundary_north?: string;
    boundary_east?: string;
    boundary_south?: string;
    boundary_west?: string;
  }>
) => {
  const apiRes = await apiFetch<any>(`/parcels/${encodeURIComponent(upin)}/subdivide`, {
    method: "POST",
    body: JSON.stringify({ childParcels}),
  });
  if (!apiRes.success) {
    throw new Error(apiRes.error || "Failed to subdivide parcel");
  }
  const json = apiRes.data;
  if (!json.success) {
    throw new Error(json.message || "Failed to subdivide parcel");
  }
  return json.data;
};