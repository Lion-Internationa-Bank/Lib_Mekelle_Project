import type{
  EncumbrancesReportFilters,
  LandParcelsReportFilters,
  OwnersMultipleParcelsFilters,
  LeaseInstallmentRangeFilters,
  ApiResponse,
  EncumbranceReportItem,
  LandParcelReportItem,
  OwnerMultipleParcelsItem,
  LeaseInstallmentItem
} from '../types/reports';

class ReportService {
  private baseUrl: string;

  constructor() {
    // Get API URL from environment variables
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get headers with authentication
   */
  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters, filtering out empty values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
    
    return url.toString();
  }

  /**
   * Generic fetch method for reports
   */
  private async fetchReport<T>(endpoint: string, params: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(`/parcels/reports${endpoint}`, params);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Error fetching report from ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Generic export method for reports
   */
  private async exportReport(endpoint: string, params: Record<string, any>, filename: string): Promise<void> {
    try {
      const url = this.buildUrl(`/parcels/reports${endpoint}/export`, params);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.getHeaders(),
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Export failed' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(`Error exporting report from ${endpoint}:`, error);
      throw error;
    }
  }

  // ============== Report Methods ==============

  /**
   * Encumbrances Report
   */
  async getEncumbrancesReport(filters: EncumbrancesReportFilters): Promise<ApiResponse<EncumbranceReportItem[]>> {
    return this.fetchReport<EncumbranceReportItem[]>('/encumbrances', filters);
  }

  async exportEncumbrancesReport(filters: EncumbrancesReportFilters): Promise<void> {
    return this.exportReport('/encumbrances', filters, `encumbrances_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Land Parcels Report
   */
   async getLandParcelsReport(filters: LandParcelsReportFilters): Promise<ApiResponse<LandParcelReportItem[]>> {
    return this.fetchReport<LandParcelReportItem[]>('/parcels', filters);
  }

  async exportLandParcelsReport(filters: LandParcelsReportFilters): Promise<void> {
    return this.exportReport('/parcels', filters, `land_parcels_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Owners with Multiple Parcels Report
   */
  async getOwnersMultipleParcelsReport(filters: OwnersMultipleParcelsFilters): Promise<ApiResponse<OwnerMultipleParcelsItem[]>> {
    return this.fetchReport<OwnerMultipleParcelsItem[]>('/owners/multiple-parcels', filters);
  }

  async exportOwnersMultipleParcelsReport(filters: OwnersMultipleParcelsFilters): Promise<void> {
    return this.exportReport('/parcels/owners/multiple-parcels', filters, `owners_multiple_parcels_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Lease Installment Range Report
   */
  async getLeaseInstallmentRangeReport(filters: LeaseInstallmentRangeFilters): Promise<ApiResponse<LeaseInstallmentItem[]>> {
    return this.fetchReport<LeaseInstallmentItem[]>('/annual_payment', filters);
  }

  async exportLeaseInstallmentRangeReport(filters: LeaseInstallmentRangeFilters): Promise<void> {
    return this.exportReport('/parcels/leases/installment-range', filters, `lease_installments_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}

// Create and export a singleton instance
export const reportService = new ReportService();