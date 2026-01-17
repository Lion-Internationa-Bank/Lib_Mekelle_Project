// src/services/revenueAdminService.ts
import apiFetch from "./api";
import type { ApiResponse } from "./api";

export type RateResponse = {
  id: string;
  rate_type: string;
  value: number;
  source?: string | null;
  effective_from: string;
  effective_until?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
};

export type RateHistoryItem = {
  id: string;
  rate_type: string;
  value: number;
  source?: string | null;
  effective_from: string;
  effective_until?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
};

export type RateHistoryResponse = {
  rate_type: string;
  count: number;
  history: RateHistoryItem[];
};

// Current rate (now) for type
export const getCurrentRate = async (
  rateType: string
): Promise<ApiResponse<RateResponse>> => {
  return apiFetch<RateResponse>(
    `/revenue-admin/rates/${rateType}/current`,
    { method: "GET" }
  );
};

// History for type
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

export const createRate = async (
  rateType: string,
  payload: {
    value: number;
    source?: string;
    effective_from: string;          // required
    effective_until?: string;
  }
): Promise<ApiResponse<RateResponse>> => {
  return apiFetch<RateResponse>(`/revenue-admin/rates/${rateType}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateRate = async (
  rateType: string,
  payload: {
    value: number;
    source?: string;
    effective_from: string;          // required
    effective_until?: string;
  }
): Promise<ApiResponse<RateResponse>> => {
  return apiFetch<RateResponse>(`/revenue-admin/rates/${rateType}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};


// Deactivate specific rate row
export const deactivateRate = async (
  rateType: string,
  payload: { effective_from: string }
): Promise<ApiResponse<{ message: string }>> => {
  return apiFetch<{ message: string }>(
    `/revenue-admin/rates/${rateType}/deactivate`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};
