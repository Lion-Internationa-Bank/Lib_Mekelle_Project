// src/services/revenueAdminService.ts
import apiFetch from "./api";
import type { ApiResponse } from "./api";

export type RateResponse = {
  rate_type: string;
  fiscal_year: number;
  value: number;
  source?: string | null;
  effective_from?: string | null;
  effective_until?: string | null;
  last_updated?: string;
  is_active?: boolean;
};

export type RateHistoryItem = {
  fiscal_year: number;
  value: number;
  source?: string | null;
  effective_from?: string | null;
  effective_until?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type RateHistoryResponse = {
  rate_type: string;
  count: number;
  history: RateHistoryItem[];
};

// Get current rate for type, optionally by year
export const getCurrentRate = async (
  rateType: string,
  fiscalYear?: number
): Promise<ApiResponse<RateResponse>> => {
  const query = fiscalYear ? `?year=${fiscalYear}` : "";
  return apiFetch<RateResponse>(
    `/revenue-admin/rates/${rateType}/current${query}`,
    {
      method: "GET",
    }
  );
};

// Get rate history for type
export const getRateHistory = async (
  rateType: string,
  limit?: number
): Promise<ApiResponse<RateHistoryResponse>> => {
  const query = limit ? `?limit=${limit}` : "";
  return apiFetch<RateHistoryResponse>(
    `/revenue-admin/rates/${rateType}/history${query}`,
    { method: "GET" }
  );
};

// Upsert/update rate for given fiscal year
export const updateRate = async (
  rateType: string,
  fiscal_year: number,
  value: number,
  description?: string,
  source?: string,
  effective_from?: string,
  effective_until?: string
): Promise<ApiResponse<RateResponse>> => {
  return apiFetch<RateResponse>(`/revenue-admin/rates/${rateType}`, {
    method: "PUT",
    body: JSON.stringify({
      fiscal_year,
      value,
      description,
      source,
      effective_from,
      effective_until,
    }),
  });
};
