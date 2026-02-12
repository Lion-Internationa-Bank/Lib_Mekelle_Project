// src/types/wizard.ts

// Common navigation props
export interface WizardStepProps {
  nextStep: () => void;
  prevStep: () => void;
}

// Parcel Step - needs onCreated for upin/sub_city
export interface ParcelStepProps {
  nextStep: () => void;
  onCreated?: (data: { upin: string; sub_city: string }) => void;
}



// Final step - no next, only finish
export interface FinishStepProps {
  prevStep: () => void;
  onFinish: () => void;
}


// src/types/wizard.ts
export interface ParcelStepProps {
  nextStep: () => void;
}

export interface SimpleStepProps {
  nextStep: () => void;
  prevStep: () => void;
}

export interface OwnerStepProps extends SimpleStepProps {
  onCreated?: (data: { owner_id: string }) => void;
}

export interface LeaseStepProps extends SimpleStepProps {
  onCreated?: (data: { lease_id: string }) => void;
}

export interface FinishStepProps {
  prevStep: () => void;
  onFinish: () => void;
}

export interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
  status?: "uploading" | "success" | "error";
}



