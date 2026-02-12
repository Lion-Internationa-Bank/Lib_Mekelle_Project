// src/services/approvalRequestApi.ts
import apiFetch,{type ApiResponse } from './api.ts';

import { toast } from 'sonner';

export interface ApprovalDocument {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  metadata?: any;
  uploaded_at: string;
}

export interface ApprovalDocumentsResponse {
  success: boolean;
  data: {
    approval_request_id: string;
    document_count: number;
    documents: ApprovalDocument[];
  };
  message?: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  data: ApprovalDocument;
  message?: string;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
  data?: {
    remaining_documents: number;
  };
}

// Upload single document to approval request
// In approvalRequestApi.ts
export const uploadApprovalDocument = async (
  approvalRequestId: string,
  file: File,
  documentType: string,
  metadata?: any
): Promise<ApprovalDocument> => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', documentType);
    
    // Add metadata as JSON string
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiFetch(
      `/doc-approval/${approvalRequestId}/documents`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (response.success && response.data) {
      const documentData = response.data.data || response.data;
      toast.success('Document uploaded successfully');
      return documentData;
    } else {
      throw new Error(response.data?.message || response.error || 'Upload failed');
    }
  } catch (error: any) {
    console.error('Upload approval document error:', error);
    toast.error(error.message || 'Failed to upload document');
    throw error;
  }
};


// Upload multiple documents to approval request
export const uploadMultipleApprovalDocuments = async (
  approvalRequestId: string,
  files: File[],
  documentType: string
): Promise<ApprovalDocumentsResponse['data']> => {
  try {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('documents', file);
    });
    
    formData.append('document_type', documentType);

    const response: ApiResponse<ApprovalDocumentsResponse> = await apiFetch(
      `/doc-approval/${approvalRequestId}/documents/multiple`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (response.success && response.data?.success) {
      toast.success(`${files.length} document(s) uploaded successfully`);
      return response.data.data;
    } else {
      throw new Error(response.data?.message || response.error || 'Upload failed');
    }
  } catch (error: any) {
    console.error('Upload multiple approval documents error:', error);
    toast.error(error.message || 'Failed to upload documents');
    throw error;
  }
};


// Get documents for approval request
// In approvalRequestApi.ts, update the getApprovalRequestDocuments function:
export const getApprovalRequestDocuments = async (
  approvalRequestId: string
): Promise<{ documents: ApprovalDocument[], document_count: number }> => {
  try {
    const response = await apiFetch(
      `/doc-approval/${approvalRequestId}/documents`
    );

    if (response.success && response.data) {
      const data = response.data.data || response.data;
      return {
        documents: data.documents || [],
        document_count: data.document_count || 0
      };
    } else {
      throw new Error(response.data?.message || response.error || 'Failed to fetch documents');
    }
  } catch (error: any) {
    console.error('Get approval documents error:', error);
    throw error;
  }
};

// Delete document from approval request
export const deleteApprovalDocument = async (
  approvalRequestId: string,
  documentId: string
): Promise<DeleteDocumentResponse['data']> => {
  try {
    const response: ApiResponse<DeleteDocumentResponse> = await apiFetch(
      `/doc-approval/${approvalRequestId}/documents/${documentId}`,
      {
        method: 'DELETE',
      }
    );

    if (response.success && response.data?.success) {
      toast.success('Document deleted successfully');
      return response.data.data;
    } else {
      throw new Error(response.data?.message || response.error || 'Delete failed');
    }
  } catch (error: any) {
    console.error('Delete approval document error:', error);
    toast.error(error.message || 'Failed to delete document');
    throw error;
  }
};

// Serve approval document (returns blob URL)
export const serveApprovalDocument = async (
  approvalRequestId: string,
  filename: string
): Promise<string> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/doc-approval/${approvalRequestId}/${filename}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    return url;
  } catch (error: any) {
    console.error('Serve approval document error:', error);
    toast.error('Failed to download document');
    throw error;
  }
};

// Get pending approval requests for current user
export interface PendingApprovalRequest {
  request_id: string;
  entity_type: string;
  entity_id: string;
  action_type: string;
  status: string;
  created_at: string;
  has_documents: boolean;
  document_count: number;
}

export interface PendingRequestsResponse {
  success: boolean;
  data: PendingApprovalRequest[];
  message?: string;
}

export const getPendingApprovalRequests = async (filters?: {
  entity_type?: string;
  action_type?: string;
}): Promise<PendingApprovalRequest[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.entity_type) params.append('entity_type', filters.entity_type);
    if (filters?.action_type) params.append('action_type', filters.action_type);

    const url = `/api/approval-requests/pending${params.toString() ? `?${params.toString()}` : ''}`;
    const response: ApiResponse<PendingRequestsResponse> = await apiFetch(url);

    if (response.success && response.data?.success) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || response.error || 'Failed to fetch pending requests');
    }
  } catch (error: any) {
    console.error('Get pending approval requests error:', error);
    throw error;
  }
};

// Get approval request details
export interface ApprovalRequestDetails {
  request_id: string;
  entity_type: string;
  entity_id: string;
  action_type: string;
  request_data: any;
  status: string;
  maker_id: string;
  maker_role: string;
  approver_role: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  comments?: string;
}

export interface ApprovalRequestDetailsResponse {
  success: boolean;
  data: ApprovalRequestDetails;
  message?: string;
}

export const getApprovalRequestDetails = async (
  approvalRequestId: string
): Promise<ApprovalRequestDetails> => {
  try {
    const response: ApiResponse<ApprovalRequestDetailsResponse> = await apiFetch(
      `/api/approval-requests/${approvalRequestId}`
    );

    if (response.success && response.data?.success) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || response.error || 'Failed to fetch request details');
    }
  } catch (error: any) {
    console.error('Get approval request details error:', error);
    throw error;
  }
};

// Update approval request documents (for legacy support)
export const updateApprovalRequestDocuments = async (
  approvalRequestId: string,
  documents: any[]
): Promise<void> => {
  try {
    const response: ApiResponse<any> = await apiFetch(
      `/doc-approval/${approvalRequestId}/documents`,
      {
        method: 'PUT',
        body: JSON.stringify({ documents }),
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to update documents');
    }
  } catch (error: any) {
    console.error('Update approval request documents error:', error);
    throw error;
  }
};