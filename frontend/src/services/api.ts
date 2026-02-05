// src/services/api.ts - Enhanced version
const API_BASE_URL = import.meta.env.VITE_API_URL;

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

  const headers = new Headers();

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // Don't set Content-Type for FormData (let browser set it)
  if (options.body && !(options.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }

  // Merge custom headers
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return { success: true } as ApiResponse<T>;
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err: unknown) {
    console.error('API fetch error:', err);
    return {
      success: false,
      error: (err as Error).message || 'Network error',
    };
  }
};

// Helper methods for different HTTP methods
export const api = {
  get: <T>(endpoint: string): Promise<ApiResponse<T>> => 
    apiFetch<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> => 
    apiFetch<T>(endpoint, { 
      method: 'POST', 
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      ...options 
    }),

  put: <T>(endpoint: string, body?: any): Promise<ApiResponse<T>> => 
    apiFetch<T>(endpoint, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    }),

  patch: <T>(endpoint: string, body?: any): Promise<ApiResponse<T>> => 
    apiFetch<T>(endpoint, { 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined 
    }),

  delete: <T>(endpoint: string, body?: any): Promise<ApiResponse<T>> => 
    apiFetch<T>(endpoint, { 
      method: 'DELETE', 
      body: body ? JSON.stringify(body) : undefined 
    }),
};

export default apiFetch;