// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL ;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const getAuthToken = () => localStorage.getItem('authToken') || '';

const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  console.log("token", token);

  const headers = new Headers();

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers.append(key, value);
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers.append(key, value);
      });
    } else {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.append(key, value);
      });
    }
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || 'Network error',
    };
  }
};

export default apiFetch;