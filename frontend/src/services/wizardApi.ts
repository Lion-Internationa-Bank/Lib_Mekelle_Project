// src/services/wizardApi.ts
import { api, type ApiResponse } from './api';
import type {
  SaveStepData,
  DocumentData,
  SessionData,
  ValidationResult,
  SubmitResult,
  ApprovalRequest
} from './api/wizardTypes';


interface PaginationMetadata {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMetadata;
  error?: string;
}
class WizardApi {
  // Create new wizard session
  async createSession(): Promise<ApiResponse<{ session_id: string; existing?: boolean }>> {
    return await api.post('/wizard/sessions');
  }

  // Get session data
  async getSession(sessionId: string): Promise<ApiResponse<SessionData>> {
    return await api.get(`/wizard/sessions/${sessionId}`);
  }


   async getUserSessions(
    page: number = 1, 
    limit: number = 10, 
    status?: string,
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<ApiResponse<{
    data: SessionData[];
    pagination: PaginationMetadata;
  }>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });
    
    if (status) {
      params.append('status', status);
    }

    return await api.get(`/wizard/sessions?${params.toString()}`);
  }


  // Save step data
  async saveStep(sessionId: string, data: SaveStepData): Promise<ApiResponse<{ message: string }>> {
    return await api.post(`/wizard/sessions/${sessionId}/steps`, data);
  }

  // Upload document - FIXED VERSION
  async uploadDocument(sessionId: string, formData: FormData): Promise<ApiResponse<DocumentData>> {
    // The api.post method already sets method: 'POST'
    return await api.post(`/wizard/sessions/${sessionId}/documents`, formData);
  }

  // Alternative upload method with explicit parameters
  async uploadDocumentSimple(
    sessionId: string, 
    step: string, 
    documentType: string, 
    file: File
  ): Promise<ApiResponse<DocumentData>> {
    const formData = new FormData();
    formData.append('step', step);
    formData.append('document_type', documentType);
    formData.append('file', file);

    return await this.uploadDocument(sessionId, formData);
  }

  // Delete document
  async deleteDocument(sessionId: string, documentId: string, step: string): Promise<ApiResponse<{ message: string }>> {
    return await api.delete(`/wizard/sessions/${sessionId}/documents/${documentId}`, { step });
  }

  // Validate session
  async validateSession(sessionId: string): Promise<ApiResponse<ValidationResult>> {
    return await api.get(`/wizard/sessions/${sessionId}/validate`);
  }

  // Submit for approval
  async submitForApproval(sessionId: string): Promise<ApiResponse<SubmitResult>> {
    return await api.post(`/wizard/sessions/${sessionId}/submit`);
  }

  // RESUBMIT a rejected session
  async resubmitSession(sessionId: string): Promise<ApiResponse<SubmitResult>> {
    // Rejected sessions can be resubmitted using the same submit endpoint
    // The backend will handle it appropriately based on session status
    return await api.post(`/wizard/sessions/${sessionId}/submit`);
  }


  // Get pending requests (for approvers)
  async getPendingRequests(): Promise<ApiResponse<ApprovalRequest[]>> {
    return await api.get('/maker-checker/requests');
  }

  // Get request details
  async getRequestDetails(requestId: string): Promise<ApiResponse<any>> {
    return await api.get(`/maker-checker/requests/${requestId}`);
  }

  // Approve request
  async approveRequest(requestId: string, comments?: string): Promise<ApiResponse<any>> {
    return await api.post(`/maker-checker/requests/${requestId}/approve`, { comments });
  }

  // Reject request
  async rejectRequest(requestId: string, rejectionReason: string): Promise<ApiResponse<any>> {
    return await api.post(`/maker-checker/requests/${requestId}/reject`, { rejection_reason: rejectionReason });
  }

  // Get rejection reason for a session
  async getRejectionReason(sessionId: string): Promise<ApiResponse<{ reason: string; rejected_at: string; rejected_by: string }>> {
    return await api.get(`/wizard/sessions/${sessionId}/rejection-reason`);
  }

  // Check if session can be resubmitted
  async canResubmitSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      return session.success && session.data?.status === 'REJECTED';
    } catch (error) {
      return false;
    }
  }

  // Serve document URL builder
  getDocumentUrl(sessionId: string, step: string, filename: string): string {
    return `${import.meta.env.VITE_API_URL}/wizard/sessions/${sessionId}/documents/${step}/${filename}`;
  }

  // View document directly
  async viewDocument(sessionId: string, step: string, filename: string): Promise<Blob> {
    const token = localStorage.getItem('authToken') || '';
    const url = this.getDocumentUrl(sessionId, step, filename);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    return await response.blob();
  }


  // Delete a session (only if in DRAFT or REJECTED status)
  async deleteSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    return await api.delete(`/wizard/sessions/${sessionId}`);
  }
}

export default new WizardApi();