// src/components/wizard/ParcelWizard/ValidationStep.tsx
import { useState, useEffect } from "react";
import type { FinishStepProps } from "../../../types/wizard";
import { useWizard } from "../../../contexts/WizardContext";
import { toast } from 'sonner';

interface ValidationResult {
  valid: boolean;
  missing: string[];
}

const ValidationStep = ({ prevStep, onFinish }: FinishStepProps) => {
  const { currentSession, validateSession, submitForApproval, isLoading } = useWizard();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    if (!currentSession) return;
    
    setIsValidating(true);
    try {
      const result = await validateSession();
      if (result.success) {
        setValidationResult(result.data);
        if (!result.data.valid) {
          toast.warning('Missing required information');
        }
      } else {
        toast.error(result.error || 'Validation failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to validate session');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentSession || !validationResult?.valid) {
      toast.error('Please fix validation errors before submitting');
      return;
    }
    
    if (!confirm('Are you ready to submit this parcel registration for approval?')) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await submitForApproval();
      
      if (result.success) {
        const message = result.data.requiresApproval 
          ? 'Submitted for approval. You will be notified when reviewed.' 
          : 'Parcel registered successfully!';
        
        toast.success(message);
        
        // Redirect after a delay
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        toast.error(result.error || 'Submission failed');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit for approval');
      setIsSubmitting(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading session data...</p>
      </div>
    );
  }

  const getOwnerName = () => {
    if (!currentSession.owner_data) return "Not provided";
    const owner = Array.isArray(currentSession.owner_data) 
      ? currentSession.owner_data[0] 
      : currentSession.owner_data;
    return owner.full_name || "Not provided";
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Submit</h2>
      <p className="text-gray-600 mb-8">
        Review your information and submit for approval
      </p>

      {/* Toggle Summary */}
      <div className="mb-6">
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          {showSummary ? 'Hide' : 'Show'} Summary
          <span>{showSummary ? '↑' : '↓'}</span>
        </button>
      </div>

      {/* Summary */}
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Parcel Info */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
              <span>📍</span> Parcel Information
            </h3>
            {currentSession.parcel_data ? (
              <div className="space-y-2">
                <div><span className="font-medium">UPIN:</span> {currentSession.parcel_data.upin}</div>
                <div><span className="font-medium">File Number:</span> {currentSession.parcel_data.file_number}</div>
                <div><span className="font-medium">Area:</span> {currentSession.parcel_data.total_area_m2} m²</div>
                <div><span className="font-medium">Land Use:</span> {currentSession.parcel_data.land_use}</div>
                <div><span className="font-medium">Tenure:</span> {currentSession.parcel_data.tenure_type}</div>
              </div>
            ) : (
              <p className="text-red-600">Missing parcel data</p>
            )}
            <div className="mt-4 pt-4 border-t border-blue-100">
              <span className="font-medium">Documents:</span> {currentSession.parcel_docs?.length || 0} uploaded
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-emerald-50 rounded-xl p-6">
            <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <span>👤</span> Owner Information
            </h3>
            {currentSession.owner_data ? (
              <div className="space-y-2">
                <div><span className="font-medium">Name:</span> {getOwnerName()}</div>
                {Array.isArray(currentSession.owner_data) 
                  ? currentSession.owner_data.map((owner, idx) => (
                      <div key={idx}>
                        <div><span className="font-medium">National ID:</span> {owner.national_id}</div>
                        <div><span className="font-medium">Phone:</span> {owner.phone_number}</div>
                        {owner.acquired_at && (
                          <div><span className="font-medium">Acquired:</span> {new Date(owner.acquired_at).toLocaleDateString()}</div>
                        )}
                      </div>
                    ))
                  : (
                    <>
                      <div><span className="font-medium">National ID:</span> {currentSession.owner_data.national_id}</div>
                      <div><span className="font-medium">Phone:</span> {currentSession.owner_data.phone_number}</div>
                      {currentSession.owner_data.acquired_at && (
                        <div><span className="font-medium">Acquired:</span> {new Date(currentSession.owner_data.acquired_at).toLocaleDateString()}</div>
                      )}
                    </>
                  )}
              </div>
            ) : (
              <p className="text-red-600">Missing owner data</p>
            )}
            <div className="mt-4 pt-4 border-t border-emerald-100">
              <span className="font-medium">Documents:</span> {currentSession.owner_docs?.length || 0} uploaded
            </div>
          </div>

          {/* Lease Info (if exists) */}
          {currentSession.lease_data && (
            <div className="md:col-span-2 bg-purple-50 rounded-xl p-6">
              <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                <span>📝</span> Lease Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><span className="font-medium">Total Amount:</span> ETB {currentSession.lease_data.total_lease_amount?.toLocaleString()}</div>
                <div><span className="font-medium">Period:</span> {currentSession.lease_data.lease_period_years} years</div>
                <div><span className="font-medium">Start Date:</span> {new Date(currentSession.lease_data.start_date).toLocaleDateString()}</div>
                <div><span className="font-medium">Price/m²:</span> ETB {currentSession.lease_data.price_per_m2?.toLocaleString()}</div>
                <div><span className="font-medium">Payment Term:</span> {currentSession.lease_data.payment_term_years} years</div>
                {currentSession.lease_data.contract_date && (
                  <div><span className="font-medium">Contract Date:</span> {new Date(currentSession.lease_data.contract_date).toLocaleDateString()}</div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-purple-100">
                <span className="font-medium">Documents:</span> {currentSession.lease_docs?.length || 0} uploaded
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Results */}
      <div className={`mb-8 p-6 rounded-xl ${validationResult?.valid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${validationResult?.valid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {isValidating ? '⏳' : validationResult?.valid ? '✅' : '⚠️'}
          </div>
          <h3 className="font-bold text-lg">
            {isValidating ? 'Validating...' : validationResult?.valid ? 'Ready to Submit' : 'Missing Information'}
          </h3>
        </div>
        
        {validationResult && !validationResult.valid && (
          <div className="ml-11">
            <p className="text-gray-700 mb-2">Please complete these steps before submitting:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              {validationResult.missing.map((item, index) => (
                <li key={index} className="font-medium">{item}</li>
              ))}
            </ul>
            <button
              onClick={runValidation}
              disabled={isValidating}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isValidating ? 'Validating...' : 'Re-check validation'}
            </button>
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
      </div>

      {/* Session Status */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-700">Session Status</h4>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 text-sm rounded-full ${
                currentSession.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                currentSession.status === 'PENDING_APPROVAL' ? 'bg-blue-100 text-blue-800' :
                currentSession.status === 'MERGED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentSession.status.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">
                Created: {new Date(currentSession.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Session ID</div>
            <div className="font-mono text-sm">{currentSession.session_id.substring(0, 12)}...</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-8 border-t border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            ← Go Back
          </button>
          
          <button
            onClick={runValidation}
            disabled={isValidating || isLoading}
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition disabled:opacity-70"
          >
            {isValidating ? 'Validating...' : 'Validate Again'}
          </button>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => {
              toast.info('Session saved as draft. You can continue later.');
              onFinish();
            }}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Save as Draft
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!validationResult?.valid || isSubmitting || isLoading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit for Approval'
            )}
          </button>
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-blue-800 mb-2">What happens after submission?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your submission will be reviewed by an approver based on your role</li>
          <li>• You will receive notifications about the approval status</li>
          <li>• If approved, the parcel will be registered in the system</li>
          <li>• If rejected, you can modify and resubmit</li>
          <li>• You can track the status from your dashboard</li>
        </ul>
      </div>
    </>
  );
};

export default ValidationStep;