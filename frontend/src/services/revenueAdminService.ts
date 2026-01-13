// src/services/revenueAdminService.ts
import apiFetch from './api';
import type { ApiResponse } from './api';

export type RateResponse = {
  rate_type: string;
  value: number;
  description?: string | null;
  last_updated: string;
};

export const getCurrentRate = async (rateType: string): Promise<ApiResponse<RateResponse>> => {
  return apiFetch<RateResponse>(`/revenue-admin/rates/${rateType}`, {
    method: 'GET',
  });
};

export const updateRate = async (
  rateType: string,
  value: number,
  description?: string
): Promise<ApiResponse<RateResponse>> => {
  return apiFetch<RateResponse>(`/revenue-admin/rates/${rateType}`, {
    method: 'POST',
    body: JSON.stringify({ value, description }),
  });
};