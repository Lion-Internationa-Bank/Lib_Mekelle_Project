// Base filter interface
export interface BaseReportFilters {
  subCityId?: string;
  page?: number;
  limit?: number;
}

// Encumbrances Report Filters
export interface EncumbrancesReportFilters extends BaseReportFilters {
  from_sate?: string;
  to_sate?: string;
  status?: 'ACTIVE' | 'RELEASED';
  type?: string;
}

// Land Parcels Report Filters (updated)
export interface LandParcelsReportFilters extends BaseReportFilters {
  landUse?: string;
  tenureType?: string;
  tabia?: string;
  ketena?: string;
  block?: string;
  minArea?: number;
  maxArea?: number;
  landGrade?: number;
  status?: 'ACTIVE' | 'RETIRED' | 'PENDING';
  tender?: string;
}

// Owners with Multiple Parcels Filters
export interface OwnersMultipleParcelsFilters extends BaseReportFilters {
  minParcels?: number;
}

// Lease Annual Installment Range Filters
export interface LeaseInstallmentRangeFilters extends BaseReportFilters {
  min: number;
  max: number;
}

// Base Response Interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

interface Owner {
  full_name: string | null;
  phone_number: string | null;
  national_id: string | null;
  tin_number: string | null;
}

// Encumbrance Response Type
export interface EncumbranceReportItem {
  encumbrance_id: string;
  type: string;
  status: string;
  issuing_entity: string | null;
  reference_number: string | null;
  registration_date: string;
  land_parcel: {
    upin: string;
    file_number: string;
    tabia: string | null;
    ketena: string | null;
    block: string | null;
    total_area_m2: number | null;
    land_use: string | null;
    sub_city: {
      name: string | null;
    };
    owners: Array<{ owner: Owner }>;
  };
}

// Land Parcel Response Type (single declaration - this is the one to keep)
export interface LandParcelReportItem {
  upin: string;
  file_number: string;
  tabia: string | null;
  ketena: string | null;
  block: string | null;
  total_area_m2: number | null;
  land_use: string | null;
  land_grade: number | null;
  tender: string | null;
  boundary_east: string | null;
  boundary_north: string | null;
  boundary_south: string | null;
  boundary_west: string | null;
  status: string;
  tenure_type: string | null;
  sub_city: {
    name: string;
  };
  owners: Array<{
    acquired_at: string;
    owner: {
      owner_id: string;
      full_name: string;
      national_id: string | null;
      tin_number: string | null;
      phone_number: string | null;
    };
  }>;
  buildings?: Array<{
    building_id: string;
    usage_type: string | null;
    total_area: number;
    floor_count: number;
  }>;
  encumbrances?: Array<{
    encumbrance_id: string;
    type: string;
    status: string;
  }>;
  lease?: {
    lease_id: string;
    status: string;
    start_date: string;
    expiry_date: string | null;
    annual_lease_fee: number | null;
  } | null;
  valuation?: {
    valuation_id: string;
    taxable_value: number;
    appraisal_date: string;
  } | null;
}

// Owner with Multiple Parcels Response Type
export interface OwnerMultipleParcelsItem {
  owner_id: string;
  full_name: string;
  national_id: string | null;
  tin_number: string | null;
  phone_number: string | null;
  sub_city_name: string;
  parcel_count: number;
  parcels: Array<{
    upin: string;
    file_number: string;
    tabia: string | null;
    ketena: string | null;
    block: string | null;
    total_area_m2: number | null;
    land_use: string | null;
    tenure_type: string | null;
    status: string;
  }>;
}

// Lease Installment Response Type
export interface LeaseInstallmentItem {
  parcel: {
    upin: string;
    file_number: string;
    tabia: string | null;
    ketena: string | null;
    block: string | null;
    total_area_m2: number | null;
    land_use: string | null;
    tenure_type: string | null;
    status: string;
    sub_city_name: string;
  };
  lease: {
    lease_id: string;
    annual_installment: number;
    status: string;
    start_date: string;
    expiry_date: string | null;
  };
  owners: Array<{
    owner_id: string;
    full_name: string;
    national_id: string | null;
    tin_number: string | null;
    phone_number: string | null;
    acquired_at: string;
  }>;
}

// Add Bill Report Item type
export interface BillReportItem {
  upin: string;
  installment_number: number;
  fiscal_year: string | null;
  base_payment: number;
  amount_due: number;
  due_date: string;
  payment_status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'PARTIAL';
  interest_amount: number | null;
  interest_rate_used: number | null;
  penalty_amount: number | null;
  penalty_rate_used: number | null;
  full_name: string;
  phone_number: string;
  subcity_name: string;
}

// Add Bill filter types
export interface BillReportFilters {
  subcityId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}