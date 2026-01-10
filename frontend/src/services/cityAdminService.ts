// src/services/cityAdminService.ts
import apiFetch from './api';
import type { ApiResponse } from './api';

// ====================
// Types (matching your backend responses)
// ====================

export type SubCity = {
  sub_city_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

// Explicit input types for create/update
export type SubCityCreateInput = {
  name: string;
  description?: string;
};

export type SubCityUpdateInput = {
  name?: string;
  description?: string | null;
};

export type ConfigOption = {
  value: string;
  description?: string;
};

export type Config = {
  category: string;
  key: string;
  options: ConfigOption[];
  description?: string;
  is_active: boolean;
};

export type ConfigSaveInput = {
  options: ConfigOption[];
  description?: string;
};

// ====================
// Sub-cities API Calls
// ====================

/**
 * Get all sub-cities (City Admin only)
 */
export const getSubCities = async (): Promise<ApiResponse<{ sub_cities: SubCity[] }>> => {
  return apiFetch<{ sub_cities: SubCity[] }>('/city-admin/sub-cities', {
    method: 'GET',
  });
};

/**
 * Create a new sub-city (City Admin only)
 */
export const createSubCity = async (
  input: SubCityCreateInput
): Promise<ApiResponse<{ sub_city: SubCity }>> => {
  return apiFetch<{ sub_city: SubCity }>('/city-admin/sub-cities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

/**
 * Update an existing sub-city (City Admin only)
 */
export const updateSubCity = async (
  id: string,
  input: SubCityUpdateInput
): Promise<ApiResponse<{ sub_city: SubCity }>> => {
  return apiFetch<{ sub_city: SubCity }>(`/city-admin/sub-cities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
};

/**
 * Soft-delete a sub-city (City Admin only)
 */
export const deleteSubCity = async (id: string): Promise<ApiResponse<null>> => {
  return apiFetch<null>(`/city-admin/sub-cities/${id}`, {
    method: 'DELETE',
  });
};

// ====================
// Configurations API Calls
// ====================

/**
 * Get configuration for a specific category (City Admin only)
 */
export const getConfig = async (category: string): Promise<ApiResponse<Config>> => {
  return apiFetch<Config>(`/city-admin/configs/${category}`, {
    method: 'GET',
  });
};

/**
 * Create or update configuration for a category (City Admin only)
 */
export const saveConfig = async (
  category: string,
  input: ConfigSaveInput
): Promise<ApiResponse<Config>> => {
  return apiFetch<Config>(`/city-admin/configs/${category}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
};