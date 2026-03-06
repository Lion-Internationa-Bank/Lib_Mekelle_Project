import { api } from './api';
import type { 
  SessionData,
  DocumentData,
  ValidationResult,
  SubmitResult,
  SessionApiData,
  DeleteApiData,
  WizardSession,
  BackendResponse,
  ApiResponse,
  SaveStepData
} from './api/wizardTypes';

const wizardApi = {
  /**
   * Create a new wizard session
   */
  createSession: async (): Promise<ApiResponse<SessionApiData>> => {
    try {
      const response = await api.post<BackendResponse<SessionApiData>>('/wizard/sessions');
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data  // Unwrap to get SessionApiData
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to create session'
      };
    } catch (error: any) {
      console.error('Create session error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },

  /**
   * Get an existing session
   */
  getSession: async (sessionId: string): Promise<ApiResponse<SessionData>> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        return {
          success: false,
          error: 'Invalid session ID'
        };
      }

      const response = await api.get<BackendResponse<SessionData>>(`/wizard/sessions/${sessionId}`);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data  // Unwrap to get SessionData
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to load session'
      };
    } catch (error: any) {
      console.error('Get session error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },



 /**
   * Get all sessions for the current user with pagination, filtering, and sorting
   */
getUserSessions: async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<ApiResponse<WizardSession[]>> => {  // Returns array directly
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status && status !== 'ALL') params.append('status', status);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    const response = await api.get<BackendResponse<WizardSession[]>>(`/wizard/sessions?${params.toString()}`);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.data  // This is the array of sessions
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to fetch user sessions'
    };
  } catch (error: any) {
    console.error('Get user sessions error:', error);
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
},

  /**
   * Save a step in the wizard
   */
  saveStep: async (sessionId: string, data: SaveStepData): Promise<ApiResponse<any>> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        return {
          success: false,
          error: 'Invalid session ID'
        };
      }

      const response = await api.post<BackendResponse<any>>(
        `/wizard/sessions/${sessionId}/steps`, 
        data
      );
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data  // Unwrap to get the saved data
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to save step'
      };
    } catch (error: any) {
      console.error('Save step error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },

  /**
   * Upload a document
   */
  uploadDocumentSimple: async (
    sessionId: string,
    step: string,
    documentType: string,
    file: File
  ): Promise<ApiResponse<DocumentData>> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        return {
          success: false,
          error: 'Invalid session ID'
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('step', step);

      const response = await api.post<BackendResponse<DocumentData>>(
        `/wizard/sessions/${sessionId}/documents`,
        formData
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data  // Unwrap to get DocumentData
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to upload document'
      };
    } catch (error: any) {
      console.error('Upload document error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },

  /**
   * Delete a document
   */
deleteDocument: async (
  sessionId: string,
  documentId: string,
  step: string
): Promise<ApiResponse<DeleteApiData>> => {
  try {
    if (!sessionId || sessionId === 'undefined') {
      return {
        success: false,
        error: 'Invalid session ID'
      };
    }

    // Send step in the request body instead of query parameter
    const response = await api.delete<BackendResponse<DeleteApiData>>(
      `/wizard/sessions/${sessionId}/documents/${documentId}`,
      { step }  // This will be sent in the request body
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.data  // Unwrap to get DeleteApiData
      };
    }

    return {
      success: false,
      error: response.error || 'Failed to delete document'
    };
  } catch (error: any) {
    console.error('Delete document error:', error);
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
},

  /**
   * Validate a session
   */
  validateSession: async (sessionId: string): Promise<ApiResponse<ValidationResult>> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        return {
          success: false,
          error: 'Invalid session ID'
        };
      }

      const response = await api.get<BackendResponse<ValidationResult>>(
        `/wizard/sessions/${sessionId}/validate`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data  // Unwrap to get ValidationResult
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to validate session'
      };
    } catch (error: any) {
      console.error('Validate session error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },

  /**
   * Submit for approval
   */
  submitForApproval: async (sessionId: string): Promise<ApiResponse<SubmitResult>> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        return {
          success: false,
          error: 'Invalid session ID'
        };
      }

      const response = await api.post<BackendResponse<SubmitResult>>(
        `/wizard/sessions/${sessionId}/submit`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data  // Unwrap to get SubmitResult
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to submit for approval'
      };
    } catch (error: any) {
      console.error('Submit for approval error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },

  /**
   * Resubmit a session
   */
  resubmitSession: async (sessionId: string): Promise<ApiResponse<SubmitResult>> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        return {
          success: false,
          error: 'Invalid session ID'
        };
      }

      const response = await api.post<BackendResponse<SubmitResult>>(
        `/wizard/sessions/${sessionId}/resubmit`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data  // Unwrap to get SubmitResult
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to resubmit session'
      };
    } catch (error: any) {
      console.error('Resubmit session error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },


   /**
   * Delete a session (only allowed for DRAFT or REJECTED status)
   */
  deleteSession: async (sessionId: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        return {
          success: false,
          error: 'Invalid session ID'
        };
      }

      const response = await api.delete<BackendResponse<{ message: string }>>(
        `/wizard/sessions/${sessionId}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to delete session'
      };
    } catch (error: any) {
      console.error('Delete session error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },
};

export default wizardApi;