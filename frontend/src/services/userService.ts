// src/services/userService.ts
import apiFetch, { type ApiResponse } from './api';

// ====================
// Types
// ====================

export type User = {
  user_id: string;
  username: string;
  full_name: string;
  role: string;
  sub_city_id: string | null;
  is_active: boolean;
  sub_city_name:string;
};

export type UserCreateInput = {
  username: string;
  password: string;
  full_name: string;
  role: string;
  sub_city_id?: string | null;
};

export type UserSuspendInput = {
  suspend: boolean;
};

// ====================
// API Calls
// ====================

/**
 * Get list of users (filtered by current user's role/scope)
 */
export const getUsers = async (): Promise<ApiResponse<{ users: User[] }>> => {
  return apiFetch<{ users: User[] }>('/auth/users', {
    method: 'GET',
  });
};

/**
 * Create a new user (role-restricted by backend)
 */
export const createUser = async (
  input: UserCreateInput
): Promise<ApiResponse<{ message: string; user: User }>> => {
  return apiFetch<{ message: string; user: User }>('/auth/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

/**
 * Suspend or activate a user
 */
export const suspendUser = async (
  userId: string,
  suspend: boolean
): Promise<ApiResponse<{ message: string }>> => {
  return apiFetch<{ message: string }>(`/auth/users/${userId}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify({ suspend }),
  });
};

/**
 * Soft-delete a user
 */
export const deleteUser = async (userId: string): Promise<ApiResponse<{ message: string }>> => {
  return apiFetch<{ message: string }>(`/auth/users/${userId}`, {
    method: 'DELETE',
  });
};