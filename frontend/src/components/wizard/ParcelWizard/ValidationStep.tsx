// src/components/wizard/ParcelWizard/ValidationStep.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslate } from "../../../i18n/useTranslate";
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
  const { t } = useTranslate('validationStep');
  const { t: tCommon } = useTranslate('common');
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
      toast.error(t('errors.noSession'));
      throw new Error(t('errors.noSession'));
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

        throw new Error(t('errors.invalidPayload'));
      } else {
        toast.error(response.error || t('errors.validateFailed'));
        throw new Error(response.error || t('errors.validateFailed'));
      }
    } catch (error: any) {
      toast.error(error.message || t('errors.validateFailed'));
      throw error;
    }
  }, [currentSession, t]);

  const loadRejectionInfo = useCallback(async () => {
    if (!currentSession || currentSession.status !== 'REJECTED') return;

    setIsLoadingRejection(true);
    try {
      // First try to get rejection info from approval_request if available
      if (currentSession.approval_request) {
        setRejectionInfo({
          reason: currentSession.approval_request.rejection_reason || t('rejection.noReason'),
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
  }, [currentSession, t]);

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
        toast.warning(t('messages.missingInfo'));
      } else {
        console.log("🎉 Session is VALID – no missing fields");
        toast.success(t('messages.complete'));
      }
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error(error?.message || t('errors.validateFailed'));
    } finally {
      setIsValidating(false);
      console.groupEnd();
    }
  }, [currentSession, isValidating, validateSession, t]);

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
      toast.error(t('errors.fixErrors'));
      return;
    }

    const isRejected = currentSession.status === 'REJECTED';
    const confirmMessage = isRejected
      ? t('confirm.resubmit')
      : t('confirm.submit');

    if (!window.confirm(confirmMessage)) {
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
          ? t('messages.resubmitted')
          : result.requiresApproval
            ? t('messages.submittedForApproval')
            : t('messages.registered');
        
        toast.success(message);

        // Wait a moment to show success message then redirect
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        toast.error(result.error || t('errors.submissionFailed'));
        setIsSubmitting(false);
      }
    } catch (error: any) {
      toast.error(error.message || t('errors.submissionFailed'));
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = () => {
    try {
      // If it's a rejected session, we're just updating it, not creating a new draft
      if (currentSession?.status === 'REJECTED') {
        toast.success(t('messages.draftSavedRejected'));
      } else {
        toast.info(t('messages.draftSaved'));
      }
      onFinish();
    } catch (error: any) {
      toast.error(error.message || t('errors.draftFailed'));
    }
  };

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  const getOwnerName = () => {
    if (!currentSession.owner_data) return t('notProvided');
    const owner = Array.isArray(currentSession.owner_data)
      ? currentSession.owner_data[0]
      : currentSession.owner_data;
    return owner?.full_name || t('notProvided');
  };

  const getDocumentCount = () => {
    let count = 0;
    if (currentSession.parcel_docs?.length) count += currentSession.parcel_docs.length;
    if (currentSession.owner_docs?.length) count += currentSession.owner_docs.length;
    if (currentSession.lease_docs?.length) count += currentSession.lease_docs.length;
    return count;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(tCommon('locale') === 'am' ? 'am-ET' : 'en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(tCommon('locale') === 'am' ? 'am-ET' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return tCommon('date.invalid');
    }
  };

  const isRejected = currentSession.status === 'REJECTED';
  const isPending = currentSession.status === 'PENDING_APPROVAL';
  const isDraft = currentSession.status === 'DRAFT';
  const isCompleted = ['APPROVED', 'MERGED'].includes(currentSession.status);

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h2>
      <p className="text-gray-600 mb-8">
        {isRejected 
          ? t('subtitle.rejected')
          : isPending
          ? t('subtitle.pending')
          : isCompleted
          ? t('subtitle.completed')
          : t('subtitle.draft')
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
              {isRejected ? t('banners.rejected.title') :
               isPending ? t('banners.pending.title') :
               isCompleted ? t('banners.completed.title') :
               t('banners.draft.title')}
            </h3>
            
            {isRejected && rejectionInfo && (
              <div className="space-y-3">
                <p className="text-red-700">
                  {t('banners.rejected.description')}
                </p>
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <p className="text-sm font-medium text-red-800 mb-2">{t('rejection.reason')}:</p>
                  <p className="text-gray-700 mb-3">{rejectionInfo.reason}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t('rejection.rejectedOn')}: {formatDate(rejectionInfo.rejected_at)}</span>
                    {rejectionInfo.rejected_by && (
                      <span>{t('rejection.by')}: {rejectionInfo.rejected_by.full_name || rejectionInfo.rejected_by.username}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isPending && (
              <p className="text-blue-700">
                {t('banners.pending.description')}
              </p>
            )}

            {isCompleted && (
              <p className="text-green-700">
                {t('banners.completed.description')}
              </p>
            )}

            {isDraft && validationResult?.valid && (
              <p className="text-gray-700">
                {t('banners.draft.ready')}
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
          {showSummary ? t('actions.hide') : t('actions.show')} {t('summary.title')}
          <span>{showSummary ? "↑" : "↓"}</span>
        </button>
      </div>

      {/* Summary */}
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Parcel Info */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
              <span>📍</span> {t('summary.parcel')}
            </h3>
            {currentSession.parcel_data ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{t('fields.upin')}:</span>{" "}
                  {currentSession.parcel_data.upin || t('notSet')}
                </div>
                <div>
                  <span className="font-medium">{t('fields.fileNumber')}:</span>{" "}
                  {currentSession.parcel_data.file_number || t('notSet')}
                </div>
                <div>
                  <span className="font-medium">{t('fields.area')}:</span>{" "}
                  {currentSession.parcel_data.total_area_m2 || 0} m²
                </div>
                <div>
                  <span className="font-medium">{t('fields.landUse')}:</span>{" "}
                  {currentSession.parcel_data.land_use || t('notSet')}
                </div>
                <div>
                  <span className="font-medium">{t('fields.tenureType')}:</span>{" "}
                  {currentSession.parcel_data.tenure_type || t('notSet')}
                </div>
                <div>
                  <span className="font-medium">{t('fields.location')}:</span>{" "}
                  {[currentSession.parcel_data.block, 
                    currentSession.parcel_data.tabia, 
                    currentSession.parcel_data.ketena]
                    .filter(Boolean)
                    .join(", ") || t('notSet')}
                </div>
              </div>
            ) : (
              <p className="text-red-600">{t('missing.parcel')}</p>
            )}
            <div className="mt-4 pt-4 border-t border-blue-100">
              <span className="font-medium">{t('fields.documents')}:</span>{" "}
              {t('documents.count', { count: currentSession.parcel_docs?.length || 0 })}
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-emerald-50 rounded-xl p-6">
            <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <span>👤</span> {t('summary.owner')}
            </h3>
            {currentSession.owner_data ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{t('fields.name')}:</span> {getOwnerName()}
                </div>
                {Array.isArray(currentSession.owner_data)
                  ? currentSession.owner_data.map((owner, idx) => (
                      <div key={idx} className="space-y-1">
                        <div>
                          <span className="font-medium">{t('fields.nationalId')}:</span>{" "}
                          {owner.national_id || t('notSet')}
                        </div>
                        <div>
                          <span className="font-medium">{t('fields.phone')}:</span>{" "}
                          {owner.phone_number || t('notSet')}
                        </div>
                        {owner.acquired_at && (
                          <div>
                            <span className="font-medium">{t('fields.acquiredAt')}:</span>{" "}
                            {formatDate(owner.acquired_at)}
                          </div>
                        )}
                      </div>
                    ))
                  : (
                    <>
                      <div>
                        <span className="font-medium">{t('fields.nationalId')}:</span>{" "}
                        {currentSession.owner_data.national_id || t('notSet')}
                      </div>
                      <div>
                        <span className="font-medium">{t('fields.phone')}:</span>{" "}
                        {currentSession.owner_data.phone_number || t('notSet')}
                      </div>
                      {currentSession.owner_data.acquired_at && (
                        <div>
                          <span className="font-medium">{t('fields.acquiredAt')}:</span>{" "}
                          {formatDate(currentSession.owner_data.acquired_at)}
                        </div>
                      )}
                    </>
                  )}
              </div>
            ) : (
              <p className="text-red-600">{t('missing.owner')}</p>
            )}
            <div className="mt-4 pt-4 border-t border-emerald-100">
              <span className="font-medium">{t('fields.documents')}:</span>{" "}
              {t('documents.count', { count: currentSession.owner_docs?.length || 0 })}
            </div>
          </div>

          {/* Lease Info (if exists) */}
          {currentSession.lease_data && (
            <div className="md:col-span-2 bg-purple-50 rounded-xl p-6">
              <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                <span>📝</span> {t('summary.lease')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">{t('fields.totalAmount')}:</span><br />
                  {formatCurrency(currentSession.lease_data.total_lease_amount || 0)}
                </div>
                <div>
                  <span className="font-medium">{t('fields.leasePeriod')}:</span><br />
                  {t('years', { count: currentSession.lease_data.lease_period_years || 0 })}
                </div>
                <div>
                  <span className="font-medium">{t('fields.startDate')}:</span><br />
                  {formatDate(currentSession.lease_data.start_date)}
                </div>
                <div>
                  <span className="font-medium">{t('fields.pricePerM2')}:</span><br />
                  {formatCurrency(currentSession.lease_data.price_per_m2 || 0)}
                </div>
                <div>
                  <span className="font-medium">{t('fields.paymentTerm')}:</span><br />
                  {t('years', { count: currentSession.lease_data.payment_term_years || 0 })}
                </div>
                <div>
                  <span className="font-medium">{t('fields.downPayment')}:</span><br />
                  {formatCurrency(currentSession.lease_data.down_payment_amount || 0)}
                </div>
                <div>
                  <span className="font-medium">{t('fields.legalFramework')}:</span><br />
                  {currentSession.lease_data.legal_framework || t('notSet')}
                </div>
                {currentSession.lease_data.contract_date && (
                  <div>
                    <span className="font-medium">{t('fields.contractDate')}:</span><br />
                    {formatDate(currentSession.lease_data.contract_date)}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-purple-100">
                <span className="font-medium">{t('fields.documents')}:</span>{" "}
                {t('documents.count', { count: currentSession.lease_docs?.length || 0 })}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{getDocumentCount()}</div>
              <div className="text-xs text-gray-500">{t('stats.totalDocuments')}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {currentSession.parcel_data?.total_area_m2 || 0} m²
              </div>
              <div className="text-xs text-gray-500">{t('stats.parcelArea')}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {currentSession.owner_data ? 
                  (Array.isArray(currentSession.owner_data) ? currentSession.owner_data.length : 1) : 0}
              </div>
              <div className="text-xs text-gray-500">{t('stats.owners')}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {currentSession.updated_at ? formatDate(currentSession.updated_at) : tCommon('na')}
              </div>
              <div className="text-xs text-gray-500">{t('stats.lastUpdated')}</div>
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
                ? t('validation.inProgress')
                : validationResult?.valid
                ? t('validation.ready')
                : t('validation.missing')}
            </h3>
          </div>

          {validationResult && !validationResult.valid && (
            <div className="ml-11">
              <p className="text-gray-700 mb-2">
                {t('validation.pleaseComplete')}:
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
                {isValidating ? t('actions.validating') : t('actions.revalidate')}
              </button>
            </div>
          )}

          {validationResult?.valid && (
            <div className="ml-11">
              <p className="text-green-700 font-medium">
                {t('validation.complete')}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {isRejected 
                  ? t('validation.resubmitPrompt')
                  : t('validation.submitPrompt')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Session Status */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-700">{t('session.status')}</h4>
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
                {currentSession.status === "PENDING_APPROVAL" ? t('status.pending') :
                 currentSession.status === "REJECTED" ? t('status.rejected') :
                 currentSession.status === "MERGED" ? t('status.completed') :
                 currentSession.status === "APPROVED" ? t('status.approved') :
                 currentSession.status === "DRAFT" ? t('status.draft') :
                 currentSession.status}
              </span>
              <span className="text-sm text-gray-500">
                {t('session.created')}: {formatDate(currentSession.created_at)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{t('session.id')}</div>
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
              ← {t('actions.goBack')}
            </button>
          )}

          {/* Validate button - show for draft/rejected */}
          {(isDraft || isRejected) && (
            <button
              onClick={runValidation}
              disabled={isValidating || isLoading}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition disabled:opacity-70"
            >
              {isValidating ? t('actions.validating') : t('actions.validateAgain')}
            </button>
          )}

          {/* View Details button - show for pending/completed */}
          {(isPending || isCompleted) && (
            <button
              onClick={prevStep}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              ← {t('actions.backToSummary')}
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
              {t('actions.saveAsDraft')}
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
                  {isRejected ? t('actions.resubmitting') : t('actions.submitting')}
                </>
              ) : (
                isRejected ? t('actions.resubmit') : t('actions.submit')
              )}
            </button>
          )}

          {/* Close button - show for pending/completed */}
          {(isPending || isCompleted) && (
            <button
              onClick={onFinish}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {t('actions.returnToDashboard')}
            </button>
          )}
        </div>
      </div>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-blue-800 mb-2">
          {isRejected 
            ? t('infoBox.rejected.title')
            : isPending
            ? t('infoBox.pending.title')
            : isCompleted
            ? t('infoBox.completed.title')
            : t('infoBox.draft.title')}
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {isRejected ? (
            <>
              <li>• {t('infoBox.rejected.item1')}</li>
              <li>• {t('infoBox.rejected.item2')}</li>
              <li>• {t('infoBox.rejected.item3')}</li>
              <li>• {t('infoBox.rejected.item4')}</li>
            </>
          ) : isPending ? (
            <>
              <li>• {t('infoBox.pending.item1')}</li>
              <li>• {t('infoBox.pending.item2')}</li>
              <li>• {t('infoBox.pending.item3')}</li>
              <li>• {t('infoBox.pending.item4')}</li>
            </>
          ) : isCompleted ? (
            <>
              <li>• {t('infoBox.completed.item1')}</li>
              <li>• {t('infoBox.completed.item2')}</li>
              <li>• {t('infoBox.completed.item3')}</li>
            </>
          ) : (
            <>
              <li>• {t('infoBox.draft.item1')}</li>
              <li>• {t('infoBox.draft.item2')}</li>
              <li>• {t('infoBox.draft.item3')}</li>
              <li>• {t('infoBox.draft.item4')}</li>
              <li>• {t('infoBox.draft.item5')}</li>
            </>
          )}
        </ul>
      </div>
    </>
  );
};

export default ValidationStep;