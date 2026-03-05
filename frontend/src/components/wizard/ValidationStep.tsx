// src/components/wizard/ParcelWizard/ValidationStep.tsx
import { useState, useEffect, useCallback, useRef } from "react";
// import { useTranslate } from "../../../i18n/useTranslate";
import { useTranslate } from "../../i18n/useTranslate";
// import type { FinishStepProps } from "../types/wizard";
import type { FinishStepProps } from "../../types/wizard";
import { useWizard } from "../../contexts/WizardContext";
import { toast } from 'sonner';
import wizardApi from "../../services/wizardApi";

interface ValidationResult {
  valid: boolean;
  missing: string[];
}

const ValidationStep = ({ prevStep, onFinish }: FinishStepProps) => {
  const { t } = useTranslate('validationStep');
  const { t: tCommon } = useTranslate('common');
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
      toast.error(t('errors.noSession'));
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
          toast.error(t('errors.invalidResponse'));
        }
      } else {
        console.error("Invalid validation result:", result);
        toast.error(t('errors.validateFailed'));
      }
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error(error.message || t('errors.validateFailed'));
    } finally {
      setIsValidating(false);
      console.log("Validation completed");
    }
  }, [currentSession, validateSession, t]);

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

  const handleSaveAsDraft = async () => {
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

  const handleSubmit = async () => {
    if (!currentSession || !validationResult?.valid) {
      toast.error(t('errors.fixErrors'));
      return;
    }

    const isRejected = currentSession.status === 'REJECTED';
    const confirmMessage = isRejected
      ? t('confirm.resubmit')
      : t('confirm.submit');

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
          ? t('messages.resubmitted')
          : result.data.requiresApproval
            ? t('messages.submittedForApproval')
            : t('messages.registered');
        
        toast.success(message);

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

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f0cd6e] mx-auto mb-4"></div>
        <p className="text-[#2a2718]">{t('loading')}</p>
      </div>
    );
  }

  // Get owner name safely
  const getOwnerName = () => {
    if (!currentSession.owner_data) return t('notProvided');
    
    if (Array.isArray(currentSession.owner_data)) {
      return currentSession.owner_data[0]?.full_name || t('notProvided');
    }
    return currentSession.owner_data.full_name || t('notProvided');
  };

  // Get owner national ID safely
  const getOwnerNationalId = () => {
    if (!currentSession.owner_data) return t('notProvided');
    
    if (Array.isArray(currentSession.owner_data)) {
      return currentSession.owner_data[0]?.national_id || t('notProvided');
    }
    return currentSession.owner_data.national_id || t('notProvided');
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-[#2a2718] mb-2">{t('title')}</h2>
      <p className="text-[#2a2718]/70 mb-8">
        {t('subtitle')}
      </p>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Parcel Information */}
        <div className="bg-[#f0cd6e]/10 rounded-xl p-6 border border-[#f0cd6e]">
          <h3 className="font-bold text-[#2a2718] mb-4">{t('sections.parcel')}</h3>
          {currentSession.parcel_data ? (
            <div className="space-y-2 text-[#2a2718]">
              <div><span className="font-medium">{t('fields.upin')}:</span> {currentSession.parcel_data.upin || t('notProvided')}</div>
              <div><span className="font-medium">{t('fields.fileNumber')}:</span> {currentSession.parcel_data.file_number || t('notProvided')}</div>
              <div><span className="font-medium">{t('fields.area')}:</span> {currentSession.parcel_data.total_area_m2 || 0} m²</div>
              <div><span className="font-medium">{t('fields.landUse')}:</span> {currentSession.parcel_data.land_use || t('notSpecified')}</div>
            </div>
          ) : (
            <p className="text-red-600">{t('noData.parcel')}</p>
          )}
          <div className="mt-4 pt-4 border-t border-[#f0cd6e]">
            <span className="font-medium text-[#2a2718]">{t('fields.documents')}:</span> <span className="text-[#2a2718]/70">{t('documents.count', { count: currentSession.parcel_docs?.length || 0 })}</span>
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-[#f0cd6e]/10 rounded-xl p-6 border border-[#f0cd6e]">
          <h3 className="font-bold text-[#2a2718] mb-4">{t('sections.owner')}</h3>
          {currentSession.owner_data ? (
            <div className="space-y-2 text-[#2a2718]">
              <div><span className="font-medium">{t('fields.name')}:</span> {getOwnerName()}</div>
              <div><span className="font-medium">{t('fields.nationalId')}:</span> {getOwnerNationalId()}</div>
              <div><span className="font-medium">{t('fields.phone')}:</span> {
                (Array.isArray(currentSession.owner_data) 
                  ? currentSession.owner_data[0]?.phone_number 
                  : currentSession.owner_data.phone_number) || t('notProvided')
              }</div>
            </div>
          ) : (
            <p className="text-red-600">{t('noData.owner')}</p>
          )}
          <div className="mt-4 pt-4 border-t border-[#f0cd6e]">
            <span className="font-medium text-[#2a2718]">{t('fields.documents')}:</span> <span className="text-[#2a2718]/70">{t('documents.count', { count: currentSession.owner_docs?.length || 0 })}</span>
          </div>
        </div>

        {/* Lease Information (if exists) */}
        {currentSession.lease_data && (
          <div className="md:col-span-2 bg-[#f0cd6e]/10 rounded-xl p-6 border border-[#f0cd6e]">
            <h3 className="font-bold text-[#2a2718] mb-4">{t('sections.lease')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[#2a2718]">
              <div><span className="font-medium">{t('fields.totalAmount')}:</span> ETB {currentSession.lease_data.total_lease_amount?.toLocaleString() || "0"}</div>
              <div><span className="font-medium">{t('fields.period')}:</span> {t('years', { count: currentSession.lease_data.lease_period_years || 0 })}</div>
              <div><span className="font-medium">{t('fields.startDate')}:</span> {
                currentSession.lease_data.start_date 
                  ? new Date(currentSession.lease_data.start_date).toLocaleDateString()
                  : t('notSpecified')
              }</div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#f0cd6e]">
              <span className="font-medium text-[#2a2718]">{t('fields.documents')}:</span> <span className="text-[#2a2718]/70">{t('documents.count', { count: currentSession.lease_docs?.length || 0 })}</span>
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
            {isValidating ? t('validation.inProgress') : 
             validationResult ? (validationResult.valid ? t('validation.ready') : t('validation.missing')) : 
             t('validation.validating')}
          </h3>
        </div>
        
        {validationResult && !validationResult.valid && validationResult.missing && (
          <div className="ml-11">
            <p className="text-[#2a2718] mb-2">{t('validation.pleaseComplete')}:</p>
            <ul className="list-disc pl-5 text-[#2a2718]/70 space-y-1">
              {validationResult.missing.map((item, index) => (
                <li key={index} className="font-medium">{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {validationResult?.valid && (
          <div className="ml-11">
            <p className="text-green-700 font-medium">{t('validation.complete')}</p>
            <p className="text-[#2a2718]/70 text-sm mt-1">
              {t('validation.submitPrompt')}
            </p>
          </div>
        )}
        
        {!validationResult && isValidating && (
          <div className="ml-11">
            <p className="text-[#2a2718]">{t('validation.validatingData')}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-8 border-t border-[#f0cd6e]">
        <button
          onClick={prevStep}
          className="px-6 py-3 rounded-xl border border-[#f0cd6e] text-[#2a2718] font-semibold hover:bg-[#f0cd6e]/20 transition"
        >
          ← {t('actions.goBack')}
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
                {t('actions.validating')}
              </>
            ) : t('actions.revalidate')}
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!validationResult?.valid || isSubmitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('actions.submitting')}
              </>
            ) : t('actions.submit')}
          </button>
        </div>
      </div>
    </>
  );
};

export default ValidationStep;