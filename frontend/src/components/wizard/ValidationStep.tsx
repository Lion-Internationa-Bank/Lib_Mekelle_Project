// src/components/wizard/ValidationStep.tsx - FIXED VERSION
import { useState, useEffect, useCallback, useRef } from "react";
import type { FinishStepProps } from "../../types/wizard";
import { useWizard } from "../../contexts/WizardContext";
import { toast } from 'sonner';
import wizardApi from "../../services/wizardApi";

interface ValidationResult {
  valid: boolean;
  missing: string[];
}

const ValidationStep = ({ prevStep, onFinish }: FinishStepProps) => {
  const { currentSession, validateSession, submitForApproval } = useWizard();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validationCalledRef = useRef(false);

  // Debug: Log when component renders
  console.log("ValidationStep rendering with session:", {
    hasSession: !!currentSession,
    sessionId: currentSession?.session_id,
    validationCalled: validationCalledRef.current
  });

  // Memoize the validation function
  const runValidation = useCallback(async () => {
    if (!currentSession) {
      toast.error('No active session');
      return;
    }
    
    if (isValidating) {
      console.log("Validation already in progress, skipping...");
      return;
    }
    
    setIsValidating(true);
    console.log("Starting validation...");
    
    try {
      console.log("Calling validateSession API...");
      const result = await validateSession();
      console.log("Validation API response:", result);
      
      if (result && typeof result === 'object') {
        if ('valid' in result && 'missing' in result) {
          setValidationResult(result as ValidationResult);
        } else if (result.data && 'valid' in result.data && 'missing' in result.data) {
          setValidationResult(result.data as ValidationResult);
        } else {
          console.error("Unexpected validation result structure:", result);
          toast.error('Invalid validation response format');
        }
      } else {
        console.error("Invalid validation result:", result);
        toast.error('Failed to validate session');
      }
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error(error.message || 'Failed to validate session');
    } finally {
      setIsValidating(false);
      console.log("Validation completed");
    }
  }, [currentSession, validateSession]);

  // Run validation ONCE when component mounts
  useEffect(() => {
    console.log("ValidationStep useEffect running");
    
    if (currentSession && !validationCalledRef.current) {
      console.log("Running initial validation...");
      validationCalledRef.current = true;
      runValidation();
    }

    return () => {
      console.log("ValidationStep cleanup");
    };
  }, []); // Empty dependency array - run only once on mount


  // In ValidationStep.tsx, modify the save as draft handler
const handleSaveAsDraft = async () => {
  try {
    // If it's a rejected session, we're just updating it, not creating a new draft
    if (currentSession?.status === 'REJECTED') {
      toast.success("Changes saved. You can continue editing later.");
    } else {
      toast.info("Session saved as draft. You can continue later.");
    }
    onFinish();
  } catch (error: any) {
    toast.error(error.message || "Failed to save draft");
  }
};
 // In ValidationStep.tsx, modify the submit handler
const handleSubmit = async () => {
  if (!currentSession || !validationResult?.valid) {
    toast.error("Please fix validation errors before submitting");
    return;
  }

  const isRejected = currentSession.status === 'REJECTED';
  const confirmMessage = isRejected
    ? "Are you sure you want to resubmit this rejected session for approval?"
    : "Are you ready to submit this parcel registration for approval?";

  if (!confirm(confirmMessage)) {
    return;
  }

  setIsSubmitting(true);
  try {
    let result;
    if (isRejected) {
      // Use resubmit endpoint for rejected sessions
      result = await wizardApi.resubmitSession(currentSession.session_id);
    } else {
      result = await submitForApproval();
    }

    if (result.success) {
      const message = isRejected
        ? "Session resubmitted for approval. You will be notified when reviewed."
        : result.data.requiresApproval
          ? "Submitted for approval. You will be notified when reviewed."
          : "Parcel registered successfully!";
      
      toast.success(message);

      setTimeout(() => {
        onFinish();
      }, 2000);
    } else {
      toast.error(result.error || "Submission failed");
      setIsSubmitting(false);
    }
  } catch (error: any) {
    toast.error(error.message || "Failed to submit for approval");
    setIsSubmitting(false);
  }
};

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f0cd6e] mx-auto mb-4"></div>
        <p className="text-[#2a2718]">Loading session data...</p>
      </div>
    );
  }

  // Get owner name safely
  const getOwnerName = () => {
    if (!currentSession.owner_data) return "Not provided";
    
    if (Array.isArray(currentSession.owner_data)) {
      return currentSession.owner_data[0]?.full_name || "Not provided";
    }
    return currentSession.owner_data.full_name || "Not provided";
  };

  // Get owner national ID safely
  const getOwnerNationalId = () => {
    if (!currentSession.owner_data) return "Not provided";
    
    if (Array.isArray(currentSession.owner_data)) {
      return currentSession.owner_data[0]?.national_id || "Not provided";
    }
    return currentSession.owner_data.national_id || "Not provided";
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-[#2a2718] mb-2">Review & Submit</h2>
      <p className="text-[#2a2718]/70 mb-8">
        Review your information before submitting for approval
      </p>

      {/* Summary - Show even if validation hasn't run yet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Parcel Information */}
        <div className="bg-[#f0cd6e]/10 rounded-xl p-6 border border-[#f0cd6e]">
          <h3 className="font-bold text-[#2a2718] mb-4">Parcel Information</h3>
          {currentSession.parcel_data ? (
            <div className="space-y-2 text-[#2a2718]">
              <div><span className="font-medium">UPIN:</span> {currentSession.parcel_data.upin || "Not provided"}</div>
              <div><span className="font-medium">File Number:</span> {currentSession.parcel_data.file_number || "Not provided"}</div>
              <div><span className="font-medium">Area:</span> {currentSession.parcel_data.total_area_m2 || 0} m²</div>
              <div><span className="font-medium">Land Use:</span> {currentSession.parcel_data.land_use || "Not specified"}</div>
            </div>
          ) : (
            <p className="text-red-600">No parcel data available</p>
          )}
          <div className="mt-4 pt-4 border-t border-[#f0cd6e]">
            <span className="font-medium text-[#2a2718]">Documents:</span> <span className="text-[#2a2718]/70">{currentSession.parcel_docs?.length || 0} uploaded</span>
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-[#f0cd6e]/10 rounded-xl p-6 border border-[#f0cd6e]">
          <h3 className="font-bold text-[#2a2718] mb-4">Owner Information</h3>
          {currentSession.owner_data ? (
            <div className="space-y-2 text-[#2a2718]">
              <div><span className="font-medium">Name:</span> {getOwnerName()}</div>
              <div><span className="font-medium">National ID:</span> {getOwnerNationalId()}</div>
              <div><span className="font-medium">Phone:</span> {
                (Array.isArray(currentSession.owner_data) 
                  ? currentSession.owner_data[0]?.phone_number 
                  : currentSession.owner_data.phone_number) || "Not provided"
              }</div>
            </div>
          ) : (
            <p className="text-red-600">No owner data available</p>
          )}
          <div className="mt-4 pt-4 border-t border-[#f0cd6e]">
            <span className="font-medium text-[#2a2718]">Documents:</span> <span className="text-[#2a2718]/70">{currentSession.owner_docs?.length || 0} uploaded</span>
          </div>
        </div>

        {/* Lease Information (if exists) */}
        {currentSession.lease_data && (
          <div className="md:col-span-2 bg-[#f0cd6e]/10 rounded-xl p-6 border border-[#f0cd6e]">
            <h3 className="font-bold text-[#2a2718] mb-4">Lease Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[#2a2718]">
              <div><span className="font-medium">Total Amount:</span> ETB {currentSession.lease_data.total_lease_amount?.toLocaleString() || "0"}</div>
              <div><span className="font-medium">Period:</span> {currentSession.lease_data.lease_period_years || 0} years</div>
              <div><span className="font-medium">Start Date:</span> {
                currentSession.lease_data.start_date 
                  ? new Date(currentSession.lease_data.start_date).toLocaleDateString()
                  : "Not specified"
              }</div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#f0cd6e]">
              <span className="font-medium text-[#2a2718]">Documents:</span> <span className="text-[#2a2718]/70">{currentSession.lease_docs?.length || 0} uploaded</span>
            </div>
          </div>
        )}
      </div>

      {/* Validation Results */}
      <div className={`mb-8 p-6 rounded-xl border ${
        validationResult?.valid ? 'bg-[#f0cd6e]/10 border-[#f0cd6e]' : 
        validationResult ? 'bg-yellow-50 border-yellow-200' : 
        'bg-[#f0cd6e]/5 border-[#f0cd6e]'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isValidating ? 'bg-[#f0cd6e]/20 text-[#2a2718]' :
            validationResult?.valid ? 'bg-green-100 text-green-700' : 
            validationResult ? 'bg-yellow-100 text-yellow-700' :
            'bg-[#f0cd6e]/10 text-[#2a2718]'
          }`}>
            {isValidating ? '⏳' : 
             validationResult?.valid ? '✅' : 
             validationResult ? '⚠️' : '?'}
          </div>
          <h3 className="font-bold text-lg text-[#2a2718]">
            {isValidating ? 'Validating...' : 
             validationResult ? (validationResult.valid ? 'Ready to Submit' : 'Missing Information') : 
             'Validating session...'}
          </h3>
        </div>
        
        {validationResult && !validationResult.valid && validationResult.missing && (
          <div className="ml-11">
            <p className="text-[#2a2718] mb-2">Please complete these steps:</p>
            <ul className="list-disc pl-5 text-[#2a2718]/70 space-y-1">
              {validationResult.missing.map((item, index) => (
                <li key={index} className="font-medium">{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {validationResult?.valid && (
          <div className="ml-11">
            <p className="text-green-700 font-medium">All required information is complete.</p>
            <p className="text-[#2a2718]/70 text-sm mt-1">
              You can now submit this parcel registration for approval.
            </p>
          </div>
        )}
        
        {!validationResult && isValidating && (
          <div className="ml-11">
            <p className="text-[#2a2718]">Validating your session data...</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-8 border-t border-[#f0cd6e]">
        <button
          onClick={prevStep}
          className="px-6 py-3 rounded-xl border border-[#f0cd6e] text-[#2a2718] font-semibold hover:bg-[#f0cd6e]/20 transition"
        >
          ← Go Back
        </button>
        
        <div className="flex gap-4">
          <button
            onClick={runValidation}
            disabled={isValidating}
            className="px-6 py-3 rounded-xl bg-[#f0cd6e]/20 text-[#2a2718] font-semibold hover:bg-[#f0cd6e]/30 transition disabled:opacity-70 flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-[#2a2718] border-t-transparent rounded-full animate-spin"></div>
                Validating...
              </>
            ) : 'Re-validate Session'}
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!validationResult?.valid || isSubmitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ValidationStep;