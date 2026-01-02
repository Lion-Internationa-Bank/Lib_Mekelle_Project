// src/services/types/parcelTypes.ts  (or inside parcelService.ts)
export interface CreateParcelInput {
  upin: string;
  file_number?: string;
  sub_city?: string;
  tabia?: string;
  block?: string;
  ketena?: string;
  total_area_m2: number;
  land_use?: string;
  sub_land_use_code?: string;
  tenure_type: string;
  land_grade?: string;
  permitted_height?: number;
  boundary_north?: string;
  boundary_east?: string;
  boundary_south?: string;
  boundary_west?: string;
  document_type?: string;
  description?: string;
}
