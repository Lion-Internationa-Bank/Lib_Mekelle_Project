// src/components/wizard/ValidationStep.tsx - FIXED WITH useCallback
import { useState, useEffect, useCallback, useRef } from "react";
import type { FinishStepProps } from "../../types/wizard";
import { useWizard } from "../../contexts/WizardContext";
import { toast } from 'sonner';

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

  // Memoize the validation function
  const runValidation = useCallback(async () => {
    if (!currentSession) {
      toast.error('No active session');
      return;
    }
    
    // Prevent multiple simultaneous validations
    if (isValidating) {
      console.log("Validation already in progress, skipping...");
      return;
    }
    
    setIsValidating(true);
    console.log("Starting validation...");
    
    try {
      const result = await validateSession();
      console.log("Validation API response:", result);
      
      // Handle the result based on your API structure
      // If result is already the validation data
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
  }, [currentSession, isValidating, validateSession]);

  // Run validation once when component mounts or session changes
  useEffect(() => {
    console.log("ValidationStep useEffect running, validationCalledRef:", validationCalledRef.current);
    
    if (currentSession && !validationCalledRef.current && !validationResult) {
      console.log("Running initial validation...");
      validationCalledRef.current = true;
      runValidation();
    }

    // Cleanup
    return () => {
      console.log("ValidationStep cleanup");
    };
  }, [currentSession, runValidation, validationResult]);

  const handleSubmit = async () => {
    if (!currentSession || !validationResult?.valid) {
      toast.error('Please fix validation errors before submitting');
      return;
    }
    
    if (!confirm('Are you ready to submit this parcel registration for approval?')) {
      return;
    }
    
    setIsSubmitting(true);
    console.log("Submitting for approval...");
    
    try {
      const result = await submitForApproval();
      console.log("Submit API response:", result);
      
      // Handle the result based on your API structure
      if (result && typeof result === 'object') {
        const requiresApproval = result.requiresApproval || 
                               (result.data && result.data.requiresApproval);
        
        if (requiresApproval !== undefined) {
          if (requiresApproval) {
            toast.success('Submitted for approval. You will be notified when reviewed.');
            setTimeout(() => onFinish(), 2000);
          } else {
            toast.success('Parcel registered successfully!');
            setTimeout(() => onFinish(), 1500);
          }
        } else {
          throw new Error('Invalid submission response format');
        }
      } else {
        throw new Error('Invalid submission response');
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || 'Failed to submit for approval');
      setIsSubmitting(false);
    }
  };

  // Also add a separate effect to debug renders
  useEffect(() => {
    console.log("ValidationStep rendered with:", {
      hasSession: !!currentSession,
      validationResult,
      isValidating,
      isSubmitting
    });
  });

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading session data...</p>
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
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Submit</h2>
      <p className="text-gray-600 mb-8">
        Review your information before submitting for approval
      </p>

      {/* Summary - Show even if validation hasn't run yet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Parcel Information */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-blue-800 mb-4">Parcel Information</h3>
          {currentSession.parcel_data ? (
            <div className="space-y-2">
              <div><span className="font-medium">UPIN:</span> {currentSession.parcel_data.upin || "Not provided"}</div>
              <div><span className="font-medium">File Number:</span> {currentSession.parcel_data.file_number || "Not provided"}</div>
              <div><span className="font-medium">Area:</span> {currentSession.parcel_data.total_area_m2 || 0} m²</div>
              <div><span className="font-medium">Land Use:</span> {currentSession.parcel_data.land_use || "Not specified"}</div>
            </div>
          ) : (
            <p className="text-red-600">No parcel data available</p>
          )}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <span className="font-medium">Documents:</span> {currentSession.parcel_docs?.length || 0} uploaded
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-emerald-50 rounded-xl p-6">
          <h3 className="font-bold text-emerald-800 mb-4">Owner Information</h3>
          {currentSession.owner_data ? (
            <div className="space-y-2">
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
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <span className="font-medium">Documents:</span> {currentSession.owner_docs?.length || 0} uploaded
          </div>
        </div>

        {/* Lease Information (if exists) */}
        {currentSession.lease_data && (
          <div className="md:col-span-2 bg-purple-50 rounded-xl p-6">
            <h3 className="font-bold text-purple-800 mb-4">Lease Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><span className="font-medium">Total Amount:</span> ETB {currentSession.lease_data.total_lease_amount?.toLocaleString() || "0"}</div>
              <div><span className="font-medium">Period:</span> {currentSession.lease_data.lease_period_years || 0} years</div>
              <div><span className="font-medium">Start Date:</span> {
                currentSession.lease_data.start_date 
                  ? new Date(currentSession.lease_data.start_date).toLocaleDateString()
                  : "Not specified"
              }</div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-200">
              <span className="font-medium">Documents:</span> {currentSession.lease_docs?.length || 0} uploaded
            </div>
          </div>
        )}
      </div>

      {/* Validation Results */}
      <div className={`mb-8 p-6 rounded-xl ${
        validationResult?.valid ? 'bg-green-50 border border-green-200' : 
        validationResult ? 'bg-yellow-50 border border-yellow-200' : 
        'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isValidating ? 'bg-blue-100 text-blue-700' :
            validationResult?.valid ? 'bg-green-100 text-green-700' : 
            validationResult ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {isValidating ? '⏳' : 
             validationResult?.valid ? '✅' : 
             validationResult ? '⚠️' : '?'}
          </div>
          <h3 className="font-bold text-lg">
            {isValidating ? 'Validating...' : 
             validationResult ? (validationResult.valid ? 'Ready to Submit' : 'Missing Information') : 
             'Click Validate to check'}
          </h3>
        </div>
        
        {validationResult && !validationResult.valid && validationResult.missing && (
          <div className="ml-11">
            <p className="text-gray-700 mb-2">Please complete these steps:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              {validationResult.missing.map((item, index) => (
                <li key={index} className="font-medium">{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {validationResult?.valid && (
          <div className="ml-11">
            <p className="text-green-700 font-medium">All required information is complete.</p>
            <p className="text-gray-600 text-sm mt-1">
              You can now submit this parcel registration for approval.
            </p>
          </div>
        )}
        
        {!validationResult && !isValidating && (
          <div className="ml-11">
            <p className="text-gray-700">Validation not run yet. Click the button below to validate.</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-8 border-t border-gray-200">
        <button
          onClick={prevStep}
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          ← Go Back
        </button>
        
        <div className="flex gap-4">
          <button
            onClick={runValidation}
            disabled={isValidating}
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition disabled:opacity-70 flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Validating...
              </>
            ) : 'Validate Session'}
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!validationResult?.valid || isSubmitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2"
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