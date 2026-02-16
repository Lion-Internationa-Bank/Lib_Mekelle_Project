// src/components/wizard/ParcelWizard.tsx - UPDATED VERSION WITH RESUBMIT HANDLING
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useWizard } from "../../contexts/WizardContext";
import { toast } from 'sonner';

// Import your step components
import ParcelStep from "./ParcelWizard/ParcelStep";
import ParcelDocsStep from "./ParcelWizard/ParcelDocsStep";
import OwnerStep from "./ParcelWizard/OwnerStep";
import OwnerDocsStep from "./ParcelWizard/OwnerDocsStep";
import LeaseStep from "./ParcelWizard/LeaseStep";
import LeaseDocsStep from "./ParcelWizard/LeaseDocsStep";
import ValidationStep from "./ParcelWizard/ValidationStep";

const STEPS = [
  "parcel",
  "parcel-docs",
  "owner",
  "owner-docs",
  "lease",
  "lease-docs",
  "validation",
] as const;

type Step = (typeof STEPS)[number];

const ParcelWizardV3 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentSession, createSession, loadSession, isLoading, updateSessionStatus } = useWizard();

  const sessionId = searchParams.get("session_id");
  const currentStepParam = searchParams.get("step");
  const resubmitParam = searchParams.get("resubmit");
  
  const validStep =
    currentStepParam && STEPS.includes(currentStepParam as Step)
      ? (currentStepParam as Step)
      : "parcel";

  const [currentStep, setCurrentStep] = useState<Step>(validStep);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSessionLoaded, setHasSessionLoaded] = useState(false);
  const [shouldSkipOwnerDocs, setShouldSkipOwnerDocs] = useState(false);
  const [shouldSkipLeaseSteps, setShouldSkipLeaseSteps] = useState(false);
  const [isResubmitMode, setIsResubmitMode] = useState(false);

  // Initialize or load session
  useEffect(() => {
    const initializeSession = async () => {
      setIsInitializing(true);
      setHasSessionLoaded(false);
      
      try {
        console.log("Session ID",sessionId)
        console.log("sessionId !== 'undefined'",sessionId !== 'undefined')
        if (sessionId && sessionId !== 'undefined') {
          console.log("Loading existing session from URL:", sessionId);
          await loadSession(sessionId);
          setHasSessionLoaded(true);
          
          // Check if this is a resubmit (from rejected session)
          if (resubmitParam === "true") {
            setIsResubmitMode(true);
            
            // If session is rejected, update status back to DRAFT for editing
            if (currentSession?.status === "REJECTED") {
              await updateSessionStatus(sessionId, "DRAFT");
              toast.info("You can now update your information and resubmit for approval");
            }
          }
        } else {
          console.log("Creating new session");
          const newSessionId = await createSession();
          console.log("Session ID returned:", newSessionId);
          
          if (newSessionId) {
            await loadSession(newSessionId);
            setHasSessionLoaded(true);
            
            const params = new URLSearchParams();
            params.set('session_id', newSessionId);
            params.set('step', validStep);
            setSearchParams(params);
          } else {
            toast.error("Failed to create session");
            navigate("/home");
          }
        }
      } catch (error: any) {
        console.error("Session initialization error:", error);
        toast.error("Failed to initialize wizard session");
        navigate("/home");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, [sessionId, resubmitParam]); // Add dependencies

  // Check if current owner is an existing owner (has owner_id)
  useEffect(() => {
    if (currentSession?.owner_data) {
      const ownerData = Array.isArray(currentSession.owner_data) 
        ? currentSession.owner_data[0] 
        : currentSession.owner_data;
      
      // If owner has an ID, it's an existing owner - skip owner docs
      setShouldSkipOwnerDocs(!!ownerData?.owner_id);
    } else {
      setShouldSkipOwnerDocs(false);
    }
  }, [currentSession?.owner_data]);

  // Check if parcel tenure type is LEASE
  useEffect(() => {
    if (currentSession?.parcel_data) {
      const parcelData = Array.isArray(currentSession.parcel_data) 
        ? currentSession.parcel_data[0] 
        : currentSession.parcel_data;
      
      // If tenure_type is not "LEASE", skip lease steps
      const isLease = parcelData?.tenure_type === "LEASE" || 
                      parcelData?.tenure_type === "lease" ||
                      parcelData?.tenure_type === "Lease";
      
      setShouldSkipLeaseSteps(!isLease);
      console.log("Parcel tenure type:", parcelData?.tenure_type, "isLease:", isLease, "skipLeaseSteps:", !isLease);
    } else {
      setShouldSkipLeaseSteps(false);
    }
  }, [currentSession?.parcel_data]);

  // Sync URL → currentStep on URL change
  useEffect(() => {
    if (currentStepParam && STEPS.includes(currentStepParam as Step)) {
      setCurrentStep(currentStepParam as Step);
    }
  }, [currentStepParam]);

  // Calculate available steps based on conditions
  const getAvailableSteps = (): readonly Step[] => {
    let steps = [...STEPS]; // Start with all steps
    
    if (shouldSkipOwnerDocs) {
      steps = steps.filter(step => step !== "owner-docs");
    }
    
    if (shouldSkipLeaseSteps) {
      steps = steps.filter(step => step !== "lease" && step !== "lease-docs");
    }
    
    return steps;
  };

  const availableSteps = getAvailableSteps();
  const currentStepIndexInAvailable = availableSteps.indexOf(currentStep);
  const progress = ((currentStepIndexInAvailable + 1) / availableSteps.length) * 100;

  // Ensure current step is valid based on available steps
  useEffect(() => {
    if (!availableSteps.includes(currentStep)) {
      console.log("Current step not available, redirecting to:", availableSteps[0]);
      goToStep(availableSteps[0]);
    }
  }, [availableSteps, currentStep]);

  const updateUrl = (step: Step, extra?: Record<string, string>) => {
    const params = new URLSearchParams({ 
      session_id: sessionId || '',
      step 
    });
    
    // Preserve resubmit flag if it exists
    if (resubmitParam === "true") {
      params.set('resubmit', 'true');
    }
    
    // Preserve existing params
    searchParams.forEach((value, key) => {
      if (key !== "step" && key !== "session_id" && key !== "resubmit") {
        params.set(key, value);
      }
    });
    
    // Add new ones
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    setSearchParams(params);
  };

  const goToStep = (step: Step, extra?: Record<string, string>) => {
    console.log(`Navigating to step: ${step}`, { extra });
    setCurrentStep(step);
    updateUrl(step, extra);
  };

  const nextStep = () => {
    const currentIndex = availableSteps.indexOf(currentStep);
    if (currentIndex < availableSteps.length - 1) {
      const nextStepValue = availableSteps[currentIndex + 1];
      console.log(`Moving to next step: ${nextStepValue}`);
      goToStep(nextStepValue);
    } else {
      console.log("Already at last step");
    }
  };

  const prevStep = () => {
    const currentIndex = availableSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStepValue = availableSteps[currentIndex - 1];
      console.log(`Moving to previous step: ${prevStepValue}`);
      goToStep(prevStepValue);
    }
  };

  const handleValidationComplete = () => {
    console.log("Navigating to validation step from LeaseDocsStep");
    goToStep("validation");
  };

  const finishWizard = () => {
    navigate("/home");
  };

  const stepLabel = (s: Step) => {
    switch (s) {
      case "parcel":
        return "Parcel Info";
      case "parcel-docs":
        return "Parcel Docs";
      case "owner":
        return "Owner Info";
      case "owner-docs":
        return "Owner Docs";
      case "lease":
        return "Lease Info";
      case "lease-docs":
        return "Lease Docs";
      case "validation":
        return "Review & Submit";
      default:
        return s;
    }
  };

  const goBackToDashboard = () => {
    navigate("/home");
  };

  // Check if we have required data for each step
  const canAccessStep = (step: Step): boolean => {
    if (!currentSession) return false;

    switch (step) {
      case "parcel":
        return true;
      case "parcel-docs":
        return !!currentSession.parcel_data;
      case "owner":
        return !!currentSession.parcel_data;
      case "owner-docs":
        if (shouldSkipOwnerDocs) {
          return false;
        }
        return !!currentSession.owner_data;
      case "lease":
        if (shouldSkipLeaseSteps) {
          return false;
        }
        return !!currentSession.owner_data;
      case "lease-docs":
        if (shouldSkipLeaseSteps) {
          return false;
        }
        return !!currentSession.lease_data;
      case "validation":
        return !!currentSession.parcel_data;
      default:
        return false;
    }
  };

  // Show loading state
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isInitializing ? "Initializing wizard session..." : "Loading session data..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no session loaded
  if (!currentSession || !hasSessionLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Error</h3>
            <p className="text-gray-600 mb-4">Failed to load wizard session. Please try again.</p>
            <div className="text-sm text-gray-500 mb-6">
              <p>Session ID from URL: {sessionId || 'none'}</p>
              <p>Has session loaded: {hasSessionLoaded ? 'Yes' : 'No'}</p>
              <p>Current session: {currentSession ? 'Exists' : 'Null'}</p>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Retry
              </button>
              <button
                onClick={goBackToDashboard}
                className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Session Info */}
        {currentSession && (
          <div className="mb-6 p-4 bg-white/80 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-600">Session:</span>
                <span className="ml-2 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {currentSession.session_id.substring(0, 8)}...
                </span>
                <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
                  currentSession.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                  currentSession.status === 'PENDING_APPROVAL' ? 'bg-blue-100 text-blue-800' :
                  currentSession.status === 'MERGED' ? 'bg-green-100 text-green-800' :
                  currentSession.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentSession.status.replace('_', ' ')}
                  {isResubmitMode && " (Resubmit Mode)"}
                </span>
                {shouldSkipOwnerDocs && (
                  <span className="ml-4 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    Existing Owner
                  </span>
                )}
                {shouldSkipLeaseSteps && (
                  <span className="ml-4 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                    Non-Lease Parcel
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Updated: {new Date(currentSession.updated_at).toLocaleDateString()}
              </div>
            </div>
            
            {/* Resubmit banner for rejected sessions */}
            {isResubmitMode && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Resubmitting Rejected Session
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Please review and update your information. When ready, go to the Review & Submit step to resubmit for approval.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-3">
            <span>
              Step {currentStepIndexInAvailable + 1} of {availableSteps.length}
              {shouldSkipOwnerDocs && " (Owner Docs Skipped)"}
              {shouldSkipLeaseSteps && " (Lease Steps Skipped)"}
            </span>
            <span>{stepLabel(currentStep)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full shadow-lg transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Pills - Show only available steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          {availableSteps.map((s, i) => {
            const label = stepLabel(s);
            const isActive = currentStep === s;
            const isDone = availableSteps.indexOf(currentStep) > i;
            const hasRequiredData = canAccessStep(s);

            return (
              <button
                key={s}
                type="button"
                onClick={() => hasRequiredData && goToStep(s)}
                disabled={!hasRequiredData && !isActive}
                className={[
                  "px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : isDone && hasRequiredData
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60",
                ].join(" ")}
              >
                {label}
                {s === "validation" && isResubmitMode && (
                  <span className="ml-1 text-xs">(Resubmit)</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-8 lg:p-10">
          {currentStep === "parcel" && (
            <ParcelStep nextStep={nextStep} />
          )}

          {currentStep === "parcel-docs" && (
            <ParcelDocsStep nextStep={nextStep} prevStep={prevStep} />
          )}

          {currentStep === "owner" && (
            <OwnerStep
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {/* Only show OwnerDocsStep if not skipping */}
          {currentStep === "owner-docs" && !shouldSkipOwnerDocs && (
            <OwnerDocsStep nextStep={nextStep} prevStep={prevStep} />
          )}

          {/* Only show LeaseStep if not skipping */}
          {currentStep === "lease" && !shouldSkipLeaseSteps && (
            <LeaseStep
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {/* Only show LeaseDocsStep if not skipping */}
          {currentStep === "lease-docs" && !shouldSkipLeaseSteps && (
            <LeaseDocsStep nextStep={handleValidationComplete} prevStep={prevStep} />
          )}

          {currentStep === "validation" && (
            <>
              {console.log("Rendering ValidationStep component...")}
              <ValidationStep 
                key={currentSession?.session_id} 
                prevStep={prevStep} 
                onFinish={finishWizard}
                isResubmit={isResubmitMode}
              />
            </>
          )}

          {/* Back to Dashboard button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={goBackToDashboard}
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelWizardV3;