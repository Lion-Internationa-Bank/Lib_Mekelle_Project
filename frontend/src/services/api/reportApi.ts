// src/services/reportApi.ts
// import { api, ApiResponse } from './api';
import { api,type ApiResponse } from "../api";

export interface BillFilters {
  subcityId?: string;
  status?: 'PAID' | 'UNPAID' | 'OVERDUE';
  fromDate?: string;
  toDate?: string;
}

export interface BillRecord {
  upin: string;
  installment_number: number | null;
  fiscal_year: number;
  base_payment: number | null;
  amount_due: number;
  due_date: string | null;
  payment_status: string;
  interest_amount: number;
  interest_rate_used: number | null;
  penalty_amount: number | null;
  penalty_rate_used: number | null;
  full_name: string;
  phone_number: string;
}

export interface SubCity {
  sub_city_id: string;
  name: string;
  description?: string;
}

class ReportApiService {
 

  // Get bills data
  async getBills(filters: BillFilters): Promise<ApiResponse<BillRecord[]>> {
    const params = new URLSearchParams();
    
    if (filters.subcityId) params.append('subcityId', filters.subcityId);
    if (filters.status) params.append('status', filters.status);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/bills?${queryString}` : '/bills';
    
    return api.get<BillRecord[]>(endpoint);
  }

  // Download bills report as Excel
  async downloadBillsReport(filters: BillFilters): Promise<Blob | null> {
    try {
      const params = new URLSearchParams();
      
      if (filters.subcityId) params.append('subcityId', filters.subcityId);
      if (filters.status) params.append('status', filters.status);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/reports/bill/download?${queryString}` : '/reports/bill/download';
      
      const token = localStorage.getItem('authToken') || '';
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  }

  // Get subcities for filter dropdown
  async getSubCities(): Promise<ApiResponse<SubCity[]>> {
    return api.get<SubCity[]>('/sub-cities');
  }

  // Future report methods
  async getPaymentsReport(): Promise<ApiResponse<any[]>> {
    // To be implemented
    return api.get<any[]>('/reports/payments');
  }

  async getParcelsReport(): Promise<ApiResponse<any[]>> {
    // To be implemented
    return api.get<any[]>('/reports/parcels');
  }

  async getOwnersReport(): Promise<ApiResponse<any[]>> {
    // To be implemented
    return api.get<any[]>('/reports/owners');
  }

  async getLeasesReport(): Promise<ApiResponse<any[]>> {
    // To be implemented
    return api.get<any[]>('/reports/leases');
  }

  async getRevenueReport(): Promise<ApiResponse<any[]>> {
    // To be implemented
    return api.get<any[]>('/reports/revenue');
  }
}

// Export a singleton instance
export const reportApi = new ReportApiService();