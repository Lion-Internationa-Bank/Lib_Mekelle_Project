// ParcelWizard.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import ParcelStep from "./ParcelWizard/ParcelStep";
import ParcelDocsStep from "./ParcelWizard/ParcelDocsStep";
import OwnerStep from "./ParcelWizard/OwnerStep";
import OwnerDocsStep from "./ParcelWizard/OwnerDocsStep";
import LeaseStep from "./ParcelWizard/LeaseStep";
import LeaseDocsStep from "./ParcelWizard/LeaseDocsStep";

const STEPS = [
  "parcel",
  "parcel-docs",
  "owner",
  "owner-docs",
  "lease",
  "lease-docs",
] as const;

type Step = (typeof STEPS)[number];

const ParcelWizard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentStepParam = searchParams.get("step");
  const validStep =
    currentStepParam && STEPS.includes(currentStepParam as Step)
      ? (currentStepParam as Step)
      : "parcel";

  const [currentStep, setCurrentStep] = useState<Step>(validStep);

  // Sync URL → currentStep on mount or URL change
  useEffect(() => {
    if (currentStepParam && STEPS.includes(currentStepParam as Step)) {
      setCurrentStep(currentStepParam as Step);
    }
  }, [currentStepParam]);

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const updateUrl = (step: Step, extra?: Record<string, string>) => {
    const params = new URLSearchParams({ step });
    // Preserve existing params
    searchParams.forEach((value, key) => {
      if (key !== "step") params.set(key, value);
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
    setCurrentStep(step);
    updateUrl(step, extra);
  };

  const nextStep = () => {
    if (stepIndex < STEPS.length - 1) {
      goToStep(STEPS[stepIndex + 1]);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      goToStep(STEPS[stepIndex - 1]);
    }
  };

  const handleParcelCreated = (data: { upin: string; sub_city: string }) => {
    goToStep("parcel-docs", { upin: data.upin, sub_city: data.sub_city });
  };

  const handleOwnerCreated = (data: { owner_id: string }) => {
    goToStep("owner-docs", { owner_id: data.owner_id });
  };

  const handleLeaseCreated = (data: { lease_id: string }) => {
    goToStep("lease-docs", { lease_id: data.lease_id });
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
      default:
        return s;
    }
  };

  const goBackToDashboard = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-3">
            <span>
              Step {stepIndex + 1} of {STEPS.length}
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

        {/* Step Pills */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
          {STEPS.map((s, i) => {
            const label = stepLabel(s);
            const isActive = currentStep === s;
            const isDone = stepIndex > i;
            const hasRequiredData =
              i <= 1 || // parcel & parcel-docs always accessible
              (i >= 2 && searchParams.has("upin")) || // owner+ needs upin
              false;

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
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-8 lg:p-10">
          {currentStep === "parcel" && (
            <ParcelStep nextStep={nextStep} onCreated={handleParcelCreated} />
          )}

          {currentStep === "parcel-docs" && (
            <ParcelDocsStep nextStep={nextStep} prevStep={prevStep} />
          )}

          {currentStep === "owner" && (
            <OwnerStep
              nextStep={nextStep}
              prevStep={prevStep}
              onCreated={handleOwnerCreated}
            />
          )}

          {currentStep === "owner-docs" && (
            <OwnerDocsStep nextStep={nextStep} prevStep={prevStep} />
          )}

          {currentStep === "lease" && (
            <LeaseStep
              nextStep={nextStep}
              prevStep={prevStep}
              onCreated={handleLeaseCreated}
            />
          )}

          {currentStep === "lease-docs" && (
            <LeaseDocsStep prevStep={prevStep} onFinish={finishWizard} />
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

export default ParcelWizard;
