// src/components/wizard/ParcelWizard.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom"; // Add useParams
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

const ParcelWizard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams(); // Get sessionId from route params
  const { currentSession, createSession, loadSession, isLoading } = useWizard();

  // Get session_id from either query params or route params
  const querySessionId = searchParams.get("session_id");
  const sessionId = routeSessionId || querySessionId; // Prefer route param over query param
  
  const currentStepParam = searchParams.get("step");
  
  const validStep =
    currentStepParam && STEPS.includes(currentStepParam as Step)
      ? (currentStepParam as Step)
      : "parcel";

  const [currentStep, setCurrentStep] = useState<Step>(validStep);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSessionLoaded, setHasSessionLoaded] = useState(false);
  const [shouldSkipOwnerDocs, setShouldSkipOwnerDocs] = useState(false);
  const [shouldSkipLeaseSteps, setShouldSkipLeaseSteps] = useState(false);

  // Initialize or load session
  useEffect(() => {
    const initializeSession = async () => {
      setIsInitializing(true);
      setHasSessionLoaded(false);
      
      try {
        console.log("Session ID from route/query:", sessionId);
        
        if (sessionId && sessionId !== 'undefined') {
          console.log("Loading existing session from URL:", sessionId);
          await loadSession(sessionId);
          setHasSessionLoaded(true);
          
          // Update URL to use route parameter format if it was using query param
          if (querySessionId && !routeSessionId) {
            // Replace the URL with the route parameter format
            navigate(`/wizard/${sessionId}?step=${validStep}`, { replace: true });
          }
        } else {
          console.log("Creating new session");
          const newSessionId = await createSession();
          console.log("Session ID returned:", newSessionId);
          
          if (newSessionId) {
            await loadSession(newSessionId);
            setHasSessionLoaded(true);
            
            // Navigate to the new session using route parameter format
            navigate(`/wizard/${newSessionId}?step=${validStep}`, { replace: true });
          } else {
            toast.error("Failed to create/load session");
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
  }, [sessionId]); // Add sessionId to dependency array

  // Show rejection warning when session loads and is rejected
  useEffect(() => {
    if (currentSession?.status === 'REJECTED' && hasSessionLoaded) {
      toast.warning("This session was previously rejected. Please update the information and resubmit.", {
        duration: 6000,
        icon: "⚠️"
      });
    }
  }, [currentSession?.status, hasSessionLoaded]);

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
      // If current step is not in available steps, navigate to the first available step
      console.log("Current step not available, redirecting to:", availableSteps[0]);
      goToStep(availableSteps[0]);
    }
  }, [availableSteps, currentStep]);

  // Debug log
  useEffect(() => {
    console.log("ParcelWizard state:", {
      currentStep,
      hasSessionLoaded,
      shouldSkipOwnerDocs,
      shouldSkipLeaseSteps,
      availableSteps,
      currentStepIndexInAvailable,
      currentSession: currentSession ? {
        hasParcelData: !!currentSession.parcel_data,
        parcelTenureType: currentSession.parcel_data?.[0]?.tenure_type,
        hasOwnerData: !!currentSession.owner_data,
        ownerHasId: currentSession.owner_data?.[0]?.owner_id ? true : false,
        hasLeaseData: !!currentSession.lease_data,
        sessionId: currentSession.session_id,
        status: currentSession.status
      } : 'No session',
      canAccessValidation: canAccessStep("validation"),
    });
  }, [currentStep, hasSessionLoaded, currentSession, shouldSkipOwnerDocs, shouldSkipLeaseSteps, currentStepIndexInAvailable]);

  const updateUrl = (step: Step, extra?: Record<string, string>) => {
    // Use the current session ID from the session, not from URL params
    const currentSessionId = currentSession?.session_id || sessionId;
    
    const params = new URLSearchParams({ 
      step 
    });
    
    // Preserve existing params (except step)
    searchParams.forEach((value, key) => {
      if (key !== "step") {
        params.set(key, value);
      }
    });
    
    // Add new ones
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    
    // Navigate to the route parameter format
    navigate(`/wizard/${currentSessionId}?${params.toString()}`);
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
      console.log(`Moving to next step: ${nextStepValue}`, {
        currentIndex,
        availableStepsLength: availableSteps.length,
        shouldSkipOwnerDocs,
        shouldSkipLeaseSteps
      });
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
        // If we have an existing owner (with owner_id), owner-docs is not required
        if (shouldSkipOwnerDocs) {
          return false; // Don't allow access to skipped step
        }
        return !!currentSession.owner_data;
      case "lease":
        // If we're skipping lease steps, don't allow access
        if (shouldSkipLeaseSteps) {
          return false;
        }
        return !!currentSession.owner_data;
      case "lease-docs":
        // If we're skipping lease steps, don't allow access
        if (shouldSkipLeaseSteps) {
          return false;
        }
        return !!currentSession.lease_data;
      case "validation":
        // Allow access if we have at least parcel data completed
        return !!currentSession.parcel_data;
      default:
        return false;
    }
  };

  // Show loading state
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0cd6e]/10 via-[#f0cd6e]/20 to-[#2a2718]/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f0cd6e] mx-auto mb-4"></div>
            <p className="text-[#2a2718]">
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
      <div className="min-h-screen bg-gradient-to-br from-[#f0cd6e]/10 via-[#f0cd6e]/20 to-[#2a2718]/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#f0cd6e]/30 p-8 text-center">
            <h3 className="text-2xl font-bold text-[#2a2718] mb-2">Session Error</h3>
            <p className="text-[#2a2718]/70 mb-4">Failed to load wizard session. Please try again.</p>
            <div className="text-sm text-[#2a2718]/70 mb-6">
              <p>Session ID from URL: {sessionId || 'none'}</p>
              <p>Has session loaded: {hasSessionLoaded ? 'Yes' : 'No'}</p>
              <p>Current session: {currentSession ? 'Exists' : 'Null'}</p>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-xl bg-[#f0cd6e] text-[#2a2718] font-semibold hover:bg-[#2a2718] hover:text-white transition"
              >
                Retry
              </button>
              <button
                onClick={goBackToDashboard}
                className="px-6 py-2 rounded-xl border border-[#f0cd6e] text-[#2a2718] font-semibold hover:bg-[#f0cd6e]/20 transition"
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
    <div className="min-h-screen bg-gradient-to-br from-[#f0cd6e]/10 via-[#f0cd6e]/20 to-[#2a2718]/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Session Info */}
        {currentSession && (
          <div className="mb-6 p-4 bg-white/80 rounded-xl shadow-sm border border-[#f0cd6e]">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-[#2a2718]">Session:</span>
                <span className="ml-2 font-mono text-sm bg-[#f0cd6e]/20 px-2 py-1 rounded">
                  {currentSession.session_id.substring(0, 8)}...
                </span>
                <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
                  currentSession.status === 'DRAFT' ? 'bg-[#f0cd6e]/30 text-[#2a2718]' :
                  currentSession.status === 'PENDING_APPROVAL' ? 'bg-blue-100 text-blue-800' :
                  currentSession.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  currentSession.status === 'MERGED' ? 'bg-green-100 text-green-800' :
                  currentSession.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentSession.status === 'PENDING_APPROVAL' ? 'Pending Approval' :
                   currentSession.status === 'REJECTED' ? 'Rejected' :
                   currentSession.status === 'MERGED' ? 'Completed' :
                   currentSession.status === 'APPROVED' ? 'Approved' :
                   currentSession.status}
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
              <div className="text-sm text-[#2a2718]/70">
                Updated: {new Date(currentSession.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-sm font-medium text-[#2a2718]/70 mb-3">
            <span>
              Step {currentStepIndexInAvailable + 1} of {availableSteps.length}
              {shouldSkipOwnerDocs && " (Owner Docs Skipped)"}
              {shouldSkipLeaseSteps && " (Lease Steps Skipped)"}
            </span>
            <span>{stepLabel(currentStep)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] h-3 rounded-full shadow-lg transition-all duration-500"
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
                    ? "bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] text-white shadow-md"
                    : isDone && hasRequiredData
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Debug info (temporary) - remove in production */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <div className="font-medium text-yellow-800 mb-1">Debug Info:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>Step: <span className="font-bold">{currentStep}</span></div>
            <div>Existing Owner: <span className={shouldSkipOwnerDocs ? "text-purple-600" : "text-gray-600"}>{shouldSkipOwnerDocs ? "Yes" : "No"}</span></div>
            <div>Is Lease: <span className={!shouldSkipLeaseSteps ? "text-green-600" : "text-gray-600"}>{!shouldSkipLeaseSteps ? "Yes" : "No"}</span></div>
            <div>Tenure: <span className="font-medium">{currentSession.parcel_data?.[0]?.tenure_type || "N/A"}</span></div>
            <div>Parcel: <span className={currentSession.parcel_data ? "text-green-600" : "text-red-600"}>{currentSession.parcel_data ? "✓" : "✗"}</span></div>
            <div>Owner: <span className={currentSession.owner_data ? "text-green-600" : "text-red-600"}>{currentSession.owner_data ? "✓" : "✗"}</span></div>
            <div>Owner ID: <span className={currentSession.owner_data?.[0]?.owner_id ? "text-green-600" : "text-gray-600"}>{currentSession.owner_data?.[0]?.owner_id || "None"}</span></div>
            <div>Lease: <span className={currentSession.lease_data ? "text-green-600" : "text-red-600"}>{currentSession.lease_data ? "✓" : "✗"}</span></div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#f0cd6e]/30 p-6 sm:p-8 lg:p-10">
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
            <ValidationStep key={currentSession?.session_id} prevStep={prevStep} onFinish={finishWizard} />
          )}

          {/* Back to Dashboard button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={goBackToDashboard}
              className="px-6 py-2 rounded-xl border border-[#f0cd6e] text-[#2a2718] font-semibold hover:bg-[#f0cd6e]/20 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelWizard;