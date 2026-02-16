// src/components/wizard/ParcelWizard/ValidationStep.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import type { FinishStepProps } from "../../../types/wizard";
import { useWizard } from "../../../contexts/WizardContext";
import wizardApi from "../../../services/wizardApi";
import { toast } from "sonner";

interface ValidationResult {
  valid: boolean;
  missing: string[];
}

interface RejectionInfo {
  reason: string;
  rejected_at: string;
  rejected_by?: {
    username: string;
    full_name: string;
  };
}

const ValidationStep = ({ prevStep, onFinish }: FinishStepProps) => {
  const { currentSession, submitForApproval, resubmitForApproval, isLoading } = useWizard();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [rejectionInfo, setRejectionInfo] = useState<RejectionInfo | null>(null);
  const [isLoadingRejection, setIsLoadingRejection] = useState(false);
  const initialValidatedRef = useRef(false);

  const validateSession = useCallback(async (): Promise<ValidationResult> => {
    if (!currentSession) {
      toast.error("No active session");
      throw new Error("No active session");
    }

    try {
      const response = await wizardApi.validateSession(
        currentSession.session_id
      );
      console.log("validateSession response:", response);

      if (response.success && response.data) {
        // Handle both nested and direct validation result structures
        if (response.data.data && 
            typeof response.data.data.valid === "boolean" && 
            Array.isArray(response.data.data.missing)) {
          return response.data.data as ValidationResult;
        } else if (typeof response.data.valid === "boolean" && 
                  Array.isArray(response.data.missing)) {
          return response.data as ValidationResult;
        }

        throw new Error("Invalid validation payload shape");
      } else {
        toast.error(response.error || "Failed to validate session");
        throw new Error(response.error || "Failed to validate session");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to validate session");
      throw error;
    }
  }, [currentSession]);

  const loadRejectionInfo = useCallback(async () => {
    if (!currentSession || currentSession.status !== 'REJECTED') return;

    setIsLoadingRejection(true);
    try {
      // First try to get rejection info from approval_request if available
      if (currentSession.approval_request) {
        setRejectionInfo({
          reason: currentSession.approval_request.rejection_reason || 'No reason provided',
          rejected_at: currentSession.approval_request.updated_at,
          rejected_by: currentSession.approval_request.checker || currentSession.approval_request.maker
        });
      } else {
        // Fallback to API call
        const response = await wizardApi.getRejectionReason(currentSession.session_id);
        if (response.success && response.data) {
          setRejectionInfo(response.data.data);
        }
      }
    } catch (error) {
      console.error("Failed to load rejection info:", error);
      // Don't show toast error for this, it's not critical
    } finally {
      setIsLoadingRejection(false);
    }
  }, [currentSession]);

  const runValidation = useCallback(async () => {
    console.group("🔍 runValidation");
    console.log("Current session:", currentSession);

    if (!currentSession) {
      console.warn("⛔ No session found. Skipping validation.");
      console.groupEnd();
      return;
    }

    if (isValidating) {
      console.log("Validation already in progress, skipping");
      console.groupEnd();
      return;
    }

    setIsValidating(true);
    const startTime = Date.now();

    try {
      console.log("🚀 Calling validateSession API...");
      const result = await validateSession();
      console.log("✅ API response in", Date.now() - startTime, "ms", result);

      setValidationResult(result);

      if (!result.valid) {
        console.warn("⚠ Session is INVALID – missing required information");
        toast.warning("Missing required information");
      } else {
        console.log("🎉 Session is VALID – no missing fields");
        toast.success("All required information is complete");
      }
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error(error?.message || "Failed to validate session");
    } finally {
      setIsValidating(false);
      console.groupEnd();
    }
  }, [currentSession, isValidating, validateSession]);

  // Load rejection info when session is loaded and rejected
  useEffect(() => {
    if (currentSession?.status === 'REJECTED') {
      loadRejectionInfo();
    }
  }, [currentSession?.status, loadRejectionInfo]);

  // Run validation on mount
  useEffect(() => {
    if (!currentSession) return;
    if (initialValidatedRef.current) return;

    console.log("ValidationStep mounted, running initial validation");
    initialValidatedRef.current = true;
    runValidation();
  }, [currentSession, runValidation]);

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
        result = await resubmitForApproval();
      } else {
        result = await submitForApproval();
      }

      if (result.success) {
        const message = isRejected
          ? "Session resubmitted for approval. You will be notified when reviewed."
          : result.requiresApproval
            ? "Submitted for approval. You will be notified when reviewed."
            : "Parcel registered successfully!";
        
        toast.success(message);

        // Wait a moment to show success message then redirect
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

  const handleSaveAsDraft = () => {
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

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading session data...</p>
      </div>
    );
  }

  const getOwnerName = () => {
    if (!currentSession.owner_data) return "Not provided";
    const owner = Array.isArray(currentSession.owner_data)
      ? currentSession.owner_data[0]
      : currentSession.owner_data;
    return owner?.full_name || "Not provided";
  };

  const getDocumentCount = () => {
    let count = 0;
    if (currentSession.parcel_docs?.length) count += currentSession.parcel_docs.length;
    if (currentSession.owner_docs?.length) count += currentSession.owner_docs.length;
    if (currentSession.lease_docs?.length) count += currentSession.lease_docs.length;
    return count;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const isRejected = currentSession.status === 'REJECTED';
  const isPending = currentSession.status === 'PENDING_APPROVAL';
  const isDraft = currentSession.status === 'DRAFT';
  const isCompleted = ['APPROVED', 'MERGED'].includes(currentSession.status);

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Submit</h2>
      <p className="text-gray-600 mb-8">
        {isRejected 
          ? "Review the rejection feedback, update your information, and resubmit"
          : isPending
          ? "This session is pending approval. You cannot make changes while it's being reviewed."
          : isCompleted
          ? "This session has been completed. View the details below."
          : "Review your information and submit for approval"
        }
      </p>

      {/* Status Banner */}
      <div className={`mb-8 p-6 rounded-xl border-2 ${
        isRejected ? 'bg-red-50 border-red-200' :
        isPending ? 'bg-blue-50 border-blue-200' :
        isCompleted ? 'bg-green-50 border-green-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
            isRejected ? 'bg-red-100 text-red-600' :
            isPending ? 'bg-blue-100 text-blue-600' :
            isCompleted ? 'bg-green-100 text-green-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {isRejected ? '⚠️' : isPending ? '⏳' : isCompleted ? '✅' : '📋'}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg mb-2 ${
              isRejected ? 'text-red-800' :
              isPending ? 'text-blue-800' :
              isCompleted ? 'text-green-800' :
              'text-gray-800'
            }`}>
              {isRejected ? 'Session Rejected' :
               isPending ? 'Pending Approval' :
               isCompleted ? 'Session Completed' :
               'Ready for Submission'}
            </h3>
            
            {isRejected && rejectionInfo && (
              <div className="space-y-3">
                <p className="text-red-700">
                  This session was rejected. Please review the feedback below and make the necessary changes.
                </p>
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <p className="text-sm font-medium text-red-800 mb-2">Rejection Reason:</p>
                  <p className="text-gray-700 mb-3">{rejectionInfo.reason}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Rejected on: {formatDate(rejectionInfo.rejected_at)}</span>
                    {rejectionInfo.rejected_by && (
                      <span>By: {rejectionInfo.rejected_by.full_name || rejectionInfo.rejected_by.username}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isPending && (
              <p className="text-blue-700">
                Your submission is being reviewed by an approver. You will be notified once a decision is made.
                No changes can be made while the session is pending.
              </p>
            )}

            {isCompleted && (
              <p className="text-green-700">
                This parcel has been successfully registered. You can view the details below.
              </p>
            )}

            {isDraft && validationResult?.valid && (
              <p className="text-gray-700">
                All required information is complete. You can now submit this parcel for approval.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Summary */}
      <div className="mb-6">
        <button
          onClick={() => setShowSummary((s) => !s)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          {showSummary ? "Hide" : "Show"} Summary
          <span>{showSummary ? "↑" : "↓"}</span>
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
                <div>
                  <span className="font-medium">UPIN:</span>{" "}
                  {currentSession.parcel_data.upin || "Not set"}
                </div>
                <div>
                  <span className="font-medium">File Number:</span>{" "}
                  {currentSession.parcel_data.file_number || "Not set"}
                </div>
                <div>
                  <span className="font-medium">Area:</span>{" "}
                  {currentSession.parcel_data.total_area_m2 || 0} m²
                </div>
                <div>
                  <span className="font-medium">Land Use:</span>{" "}
                  {currentSession.parcel_data.land_use || "Not set"}
                </div>
                <div>
                  <span className="font-medium">Tenure:</span>{" "}
                  {currentSession.parcel_data.tenure_type || "Not set"}
                </div>
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {[currentSession.parcel_data.block, 
                    currentSession.parcel_data.tabia, 
                    currentSession.parcel_data.ketena]
                    .filter(Boolean)
                    .join(", ") || "Not set"}
                </div>
              </div>
            ) : (
              <p className="text-red-600">Missing parcel data</p>
            )}
            <div className="mt-4 pt-4 border-t border-blue-100">
              <span className="font-medium">Documents:</span>{" "}
              {currentSession.parcel_docs?.length || 0} uploaded
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-emerald-50 rounded-xl p-6">
            <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <span>👤</span> Owner Information
            </h3>
            {currentSession.owner_data ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {getOwnerName()}
                </div>
                {Array.isArray(currentSession.owner_data)
                  ? currentSession.owner_data.map((owner, idx) => (
                      <div key={idx} className="space-y-1">
                        <div>
                          <span className="font-medium">National ID:</span>{" "}
                          {owner.national_id || "Not set"}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span>{" "}
                          {owner.phone_number || "Not set"}
                        </div>
                        {owner.acquired_at && (
                          <div>
                            <span className="font-medium">Acquired:</span>{" "}
                            {formatDate(owner.acquired_at)}
                          </div>
                        )}
                      </div>
                    ))
                  : (
                    <>
                      <div>
                        <span className="font-medium">National ID:</span>{" "}
                        {currentSession.owner_data.national_id || "Not set"}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {currentSession.owner_data.phone_number || "Not set"}
                      </div>
                      {currentSession.owner_data.acquired_at && (
                        <div>
                          <span className="font-medium">Acquired:</span>{" "}
                          {formatDate(currentSession.owner_data.acquired_at)}
                        </div>
                      )}
                    </>
                  )}
              </div>
            ) : (
              <p className="text-red-600">Missing owner data</p>
            )}
            <div className="mt-4 pt-4 border-t border-emerald-100">
              <span className="font-medium">Documents:</span>{" "}
              {currentSession.owner_docs?.length || 0} uploaded
            </div>
          </div>

          {/* Lease Info (if exists) */}
          {currentSession.lease_data && (
            <div className="md:col-span-2 bg-purple-50 rounded-xl p-6">
              <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                <span>📝</span> Lease Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">Total Amount:</span><br />
                  {formatCurrency(currentSession.lease_data.total_lease_amount || 0)}
                </div>
                <div>
                  <span className="font-medium">Period:</span><br />
                  {currentSession.lease_data.lease_period_years || 0} years
                </div>
                <div>
                  <span className="font-medium">Start Date:</span><br />
                  {formatDate(currentSession.lease_data.start_date)}
                </div>
                <div>
                  <span className="font-medium">Price/m²:</span><br />
                  {formatCurrency(currentSession.lease_data.price_per_m2 || 0)}
                </div>
                <div>
                  <span className="font-medium">Payment Term:</span><br />
                  {currentSession.lease_data.payment_term_years || 0} years
                </div>
                <div>
                  <span className="font-medium">Down Payment:</span><br />
                  {formatCurrency(currentSession.lease_data.down_payment_amount || 0)}
                </div>
                <div>
                  <span className="font-medium">Legal Framework:</span><br />
                  {currentSession.lease_data.legal_framework || "Not set"}
                </div>
                {currentSession.lease_data.contract_date && (
                  <div>
                    <span className="font-medium">Contract Date:</span><br />
                    {formatDate(currentSession.lease_data.contract_date)}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-purple-100">
                <span className="font-medium">Documents:</span>{" "}
                {currentSession.lease_docs?.length || 0} uploaded
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{getDocumentCount()}</div>
              <div className="text-xs text-gray-500">Total Documents</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {currentSession.parcel_data?.total_area_m2 || 0} m²
              </div>
              <div className="text-xs text-gray-500">Parcel Area</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {currentSession.owner_data ? 
                  (Array.isArray(currentSession.owner_data) ? currentSession.owner_data.length : 1) : 0}
              </div>
              <div className="text-xs text-gray-500">Owners</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {currentSession.updated_at ? formatDate(currentSession.updated_at) : 'N/A'}
              </div>
              <div className="text-xs text-gray-500">Last Updated</div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results - Only show for draft/rejected sessions */}
      {(isDraft || isRejected) && (
        <div
          className={`mb-8 p-6 rounded-xl ${
            validationResult?.valid
              ? "bg-green-50 border border-green-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                validationResult?.valid
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {isValidating ? "⏳" : validationResult?.valid ? "✅" : "⚠️"}
            </div>
            <h3 className="font-bold text-lg">
              {isValidating
                ? "Validating..."
                : validationResult?.valid
                ? "Ready to Submit"
                : "Missing Information"}
            </h3>
          </div>

          {validationResult && !validationResult.valid && (
            <div className="ml-11">
              <p className="text-gray-700 mb-2">
                Please complete these steps before submitting:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                {validationResult.missing.map((item, index) => (
                  <li key={index} className="font-medium">
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={runValidation}
                disabled={isValidating}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {isValidating ? "Validating..." : "Re-check validation"}
              </button>
            </div>
          )}

          {validationResult?.valid && (
            <div className="ml-11">
              <p className="text-green-700 font-medium">
                All required information is complete.
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {isRejected 
                  ? "You can now resubmit this parcel registration for approval."
                  : "You can now submit this parcel registration for approval."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Session Status */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-700">Session Status</h4>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  currentSession.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-800"
                    : currentSession.status === "PENDING_APPROVAL"
                    ? "bg-blue-100 text-blue-800"
                    : currentSession.status === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : currentSession.status === "APPROVED" || currentSession.status === "MERGED"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {currentSession.status === "PENDING_APPROVAL" ? "Pending Approval" :
                 currentSession.status === "REJECTED" ? "Rejected" :
                 currentSession.status === "MERGED" ? "Completed" :
                 currentSession.status.charAt(0) + currentSession.status.slice(1).toLowerCase()}
              </span>
              <span className="text-sm text-gray-500">
                Created: {formatDate(currentSession.created_at)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Session ID</div>
            <div className="font-mono text-sm">
              {currentSession.session_id.substring(0, 12)}...
            </div>
          </div>
        </div>
      </div>

      {/* Actions - Different for each status */}
      <div className="flex justify-between pt-8 border-t border-gray-200">
        <div className="flex gap-4">
          {/* Back button - show for draft/rejected */}
          {(isDraft || isRejected) && (
            <button
              onClick={prevStep}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              ← Go Back
            </button>
          )}

          {/* Validate button - show for draft/rejected */}
          {(isDraft || isRejected) && (
            <button
              onClick={runValidation}
              disabled={isValidating || isLoading}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition disabled:opacity-70"
            >
              {isValidating ? "Validating..." : "Validate Again"}
            </button>
          )}

          {/* View Details button - show for pending/completed */}
          {(isPending || isCompleted) && (
            <button
              onClick={prevStep}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              ← Back to Summary
            </button>
          )}
        </div>

        <div className="flex gap-4">
          {/* Save as Draft - show for draft/rejected */}
          {(isDraft || isRejected) && (
            <button
              onClick={handleSaveAsDraft}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Save as Draft
            </button>
          )}

          {/* Submit/Resubmit button - show for draft/rejected when valid */}
          {(isDraft || isRejected) && validationResult?.valid && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className={`px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2 ${
                isRejected
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              } text-white`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRejected ? "Resubmitting..." : "Submitting..."}
                </>
              ) : (
                isRejected ? "Resubmit for Approval" : "Submit for Approval"
              )}
            </button>
          )}

          {/* Close button - show for pending/completed */}
          {(isPending || isCompleted) && (
            <button
              onClick={onFinish}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-blue-800 mb-2">
          {isRejected 
            ? "What happens after resubmission?"
            : isPending
            ? "What happens while pending?"
            : isCompleted
            ? "What's next?"
            : "What happens after submission?"}
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {isRejected ? (
            <>
              <li>• Your updated submission will be reviewed again by an approver</li>
              <li>• You will receive notifications about the approval status</li>
              <li>• If approved, the parcel will be registered in the system</li>
              <li>• You can track the status from your dashboard</li>
            </>
          ) : isPending ? (
            <>
              <li>• An approver is reviewing your submission</li>
              <li>• You will be notified when a decision is made</li>
              <li>• No changes can be made while pending</li>
              <li>• You can check the status from your dashboard</li>
            </>
          ) : isCompleted ? (
            <>
              <li>• This parcel has been successfully registered</li>
              <li>• You can view it in the parcel list</li>
              <li>• You can start a new registration from your dashboard</li>
            </>
          ) : (
            <>
              <li>• Your submission will be reviewed by an approver based on your role</li>
              <li>• You will receive notifications about the approval status</li>
              <li>• If approved, the parcel will be registered in the system</li>
              <li>• If rejected, you can modify and resubmit</li>
              <li>• You can track the status from your dashboard</li>
            </>
          )}
        </ul>
      </div>
    </>
  );
};

export default ValidationStep;