// src/contexts/WizardContext.tsx - UPDATED FOR response.data.data STRUCTURE
import React, { createContext, useContext, useState, useEffect } from 'react';
import wizardApi from '../services/wizardApi';
import { toast } from 'sonner';

// Import types from wizardApi
import type { DocumentData, SessionData, ValidationResult, SubmitResult } from '../services/api/wizardTypes';

// Use SessionData type from wizardApi
type WizardSession = SessionData & {
  [key: string]: any;
};

interface WizardContextType {
  currentSession: WizardSession | null;
  isLoading: boolean;
  createSession: () => Promise<string | null>;
  loadSession: (sessionId: string) => Promise<void>;
  saveStep: (step: string, data: any) => Promise<void>;
  uploadDocument: (step: string, documentType: string, file: File) => Promise<DocumentData>;
  deleteDocument: (step: string, documentId: string) => Promise<void>;
  validateSession: () => Promise<ValidationResult>;
  submitForApproval: () => Promise<SubmitResult>;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
};

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<WizardSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createSession = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      const response = await wizardApi.createSession();
      console.log('Create session response:', response);
      
      if (response.success && response.data?.data) {
        const sessionId = response.data.data.session_id;
        console.log("Session ID from createSession:", sessionId);
        
        if (response.data.data.existing) {
          toast.info('Resumed existing draft session');
        } else {
          toast.success('New wizard session created');
        }
        return sessionId;
      } else {
        toast.error(response.error || 'Failed to create session');
        return null;
      }
    } catch (error: any) {
      console.error('Create session error:', error);
      toast.error(error.message || 'Failed to create session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        console.error('Invalid session ID in loadSession:', sessionId);
        toast.error('Invalid session ID');
        return;
      }
      
      setIsLoading(true);
      console.log('loadSession called with ID:', sessionId);
      const response = await wizardApi.getSession(sessionId);
      console.log('Load session response:', response);
      
      if (response.success && response.data?.data) {
        setCurrentSession(response.data.data);
        console.log('Session loaded successfully:', response.data.data.session_id);
      } else {
        console.error('Failed to load session:', response.error);
        toast.error(response.error || 'Failed to load session');
      }
    } catch (error: any) {
      console.error('Load session error:', error);
      toast.error(error.message || 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };

  const saveStep = async (step: string, data: any) => {
    if (!currentSession) {
      toast.error('No active session');
      return;
    }

    try {
      setIsLoading(true);
      console.log("Saving step:", step, "for session:", currentSession.session_id);
      const response = await wizardApi.saveStep(currentSession.session_id, { step, data });
      console.log("Save step response:", response);

      if (response.success && response.data) {
        const stepField = getStepField(step);
        setCurrentSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [stepField]: data,
            current_step: step,
            updated_at: new Date().toISOString()
          };
        });
        toast.success('Step saved successfully');
      } else {
        toast.error(response.error || 'Failed to save step');
        throw new Error(response.error || 'Failed to save step');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save step');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (step: string, documentType: string, file: File): Promise<DocumentData> => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    try {
      setIsLoading(true);
      const response = await wizardApi.uploadDocumentSimple(
        currentSession.session_id,
        step,
        documentType,
        file
      );
      console.log("Upload document response:", response);

      if (response.success && response.data?.data) {
        const stepField = getDocumentsField(step);
        setCurrentSession(prev => {
          if (!prev) return null;
          const currentDocs = prev[stepField] || [];
          return {
            ...prev,
            [stepField]: [...currentDocs, response.data.data],
            updated_at: new Date().toISOString()
          };
        });
        toast.success('Document uploaded successfully');
        return response.data.data;
      } else {
        throw new Error(response.error || 'Failed to upload document');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (step: string, documentId: string) => {
    if (!currentSession) {
      toast.error('No active session');
      return;
    }

    try {
      setIsLoading(true);
      const response = await wizardApi.deleteDocument(currentSession.session_id, documentId, step);
      if (response.success && response.data?.data) {
        const stepField = getDocumentsField(step);
        setCurrentSession(prev => {
          if (!prev) return null;
          const currentDocs = prev[stepField] || [];
          return {
            ...prev,
            [stepField]: currentDocs.filter((doc: DocumentData) => doc.id !== documentId),
            updated_at: new Date().toISOString()
          };
        });
        toast.success('Document deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete document');
        throw new Error(response.error || 'Failed to delete document');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateSession = async (): Promise<ValidationResult> => {
    if (!currentSession) {
      toast.error('No active session');
      throw new Error('No active session');
    }

    try {
      setIsLoading(true);
      const response = await wizardApi.validateSession(currentSession.session_id);
      console.log(response)
      if (response.success && response.data?.data) {
        return response.data.data;
      } else {
        toast.error(response.error || 'Failed to validate session');
        throw new Error(response.error || 'Failed to validate session');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to validate session');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitForApproval = async (): Promise<SubmitResult> => {
    if (!currentSession) {
      toast.error('No active session');
      throw new Error('No active session');
    }

    try {
      setIsLoading(true);
      const response = await wizardApi.submitForApproval(currentSession.session_id);
      console.log("Submit for approval response:", response);
      
      if (response.success && response.data?.data) {
        const newStatus = response.data.data.requiresApproval ? 'PENDING_APPROVAL' : 'MERGED';
        setCurrentSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: newStatus,
            updated_at: new Date().toISOString()
          };
        });
        
        const message = response.data.data.requiresApproval 
          ? 'Submitted for approval' 
          : 'Parcel registered successfully';
        toast.success(message);
        
        return response.data.data;
      } else {
        toast.error(response.error || 'Failed to submit for approval');
        throw new Error(response.error || 'Failed to submit for approval');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit for approval');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getStepField = (step: string): keyof WizardSession => {
    const stepMap: Record<string, keyof WizardSession> = {
      'parcel': 'parcel_data',
      'owner': 'owner_data',
      'lease': 'lease_data',
      'parcel-docs': 'parcel_docs',
      'owner-docs': 'owner_docs',
      'lease-docs': 'lease_docs'
    };
    return stepMap[step] || 'current_step';
  };

  const getDocumentsField = (step: string): 'parcel_docs' | 'owner_docs' | 'lease_docs' => {
    const docMap: Record<string, 'parcel_docs' | 'owner_docs' | 'lease_docs'> = {
      'parcel-docs': 'parcel_docs',
      'owner-docs': 'owner_docs',
      'lease-docs': 'lease_docs'
    };
    return docMap[step] || 'parcel_docs';
  };

  return (
    <WizardContext.Provider value={{
      currentSession,
      isLoading,
      createSession,
      loadSession,
      saveStep,
      uploadDocument,
      deleteDocument,
      validateSession,
      submitForApproval
    }}>
      {children}
    </WizardContext.Provider>
  );
};