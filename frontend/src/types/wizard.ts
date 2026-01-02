// src/types/wizard.ts

// Common navigation props
export interface WizardStepProps {
  nextStep: () => void;
  prevStep: () => void;
}

// Parcel Step - needs onCreated for upin/sub_city
export interface ParcelStepProps {
  nextStep: () => void;
  onCreated: (data: { upin: string; sub_city: string }) => void;
}

// Owner Step - creates owner and returns owner_id
export interface OwnerStepProps extends WizardStepProps {
  onCreated: (data: { owner_id: string }) => void;
}

// Lease Step - creates lease and returns lease_id
export interface LeaseStepProps extends WizardStepProps {
  onCreated: (data: { lease_id: string }) => void;
}

// Final step - no next, only finish
export interface FinishStepProps {
  prevStep: () => void;
  onFinish: () => void;
}

// Simple steps that only need navigation (no extra callbacks or data props)
// e.g. ParcelDocsStep, OwnerDocsStep
export type SimpleStepProps = WizardStepProps;