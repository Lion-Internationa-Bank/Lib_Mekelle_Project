// src/components/wizard/ParcelWizard/OwnerStep.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizard } from "../../../contexts/WizardContext";
import type { OwnerStepProps } from "../../../types/wizard";
import {
  OwnerStepFormSchema,
  type OwnerStepFormData,
} from "../../../validation/schemas";
import { toast } from 'sonner';

const OwnerStep = ({ nextStep, prevStep }: OwnerStepProps) => {
  const { currentSession, saveStep, isLoading } = useWizard();
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OwnerStepFormData>({
    resolver: zodResolver(OwnerStepFormSchema),
    defaultValues: {
      full_name: "",
      national_id: "",
      tin_number: "",
      phone_number: "",
      acquired_at: today,
    },
  });

  // Load existing data if available
  useEffect(() => {
    if (currentSession?.owner_data) {
      // Handle both single owner and array of owners
      const ownerData = Array.isArray(currentSession.owner_data) 
        ? currentSession.owner_data[0] 
        : currentSession.owner_data;
      
      reset({
        ...ownerData,
        acquired_at: ownerData.acquired_at || today
      });
    }
  }, [currentSession?.owner_data, reset, today]);

  const onSubmit = async (data: OwnerStepFormData) => {
    try {
      // Convert single owner to array (backend expects array)
      await saveStep('owner', [data]);
      toast.success('Owner information saved');
      nextStep();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save owner information');
      console.error("Save error:", err);
    }
  };

  // Show warning if no parcel data
  if (!currentSession?.parcel_data) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-red-600 mb-4">
          Missing Parcel Information
        </p>
        <p className="text-gray-600 mb-6">
          Please complete the Parcel step first.
        </p>
        <button
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Register Owner</h2>
      <p className="text-gray-600 mb-8">
        Register the owner information for the parcel
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            {...register("full_name")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="e.g. John Doe"
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.full_name.message}
            </p>
          )}
        </div>

        {/* National ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            National ID *
          </label>
          <input
            {...register("national_id")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="1234567890"
          />
          {errors.national_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.national_id.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            {...register("phone_number")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="+251911223344"
          />
          {errors.phone_number && (
            <p className="mt-1 text-sm text-red-600">
              {errors.phone_number.message}
            </p>
          )}
        </div>

        {/* TIN Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            TIN Number
          </label>
          <input
            {...register("tin_number")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Optional"
          />
          {errors.tin_number && (
            <p className="mt-1 text-sm text-red-600">
              {errors.tin_number.message}
            </p>
          )}
        </div>

        {/* Acquisition Date */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Acquisition Date *
          </label>
          <input
            type="date"
            max={today}
            {...register("acquired_at")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.acquired_at && (
            <p className="mt-1 text-sm text-red-600">
              {errors.acquired_at.message}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="md:col-span-2 flex justify-between pt-6">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save Owner & Continue →"}
          </button>
        </div>
      </form>

      {/* Help text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-blue-800 mb-1">Note:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Only one owner can be registered per wizard session</li>
          <li>• For multiple owners, submit this session first then add additional owners later</li>
          <li>• <span className="font-medium">Acquisition Date:</span> When the owner acquired this parcel</li>
        </ul>
      </div>
    </>
  );
};

export default OwnerStep;