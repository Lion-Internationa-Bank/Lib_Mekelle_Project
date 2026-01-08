// src/components/wizard/OwnerStep.tsx
import { useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createOwner } from "../../services/parcelApi";
import type { OwnerStepProps } from "../../types/wizard";
import {
  OwnerStepFormSchema,
  type OwnerStepFormData,
} from "../../validation/schemas";

const OwnerStep = ({ nextStep, prevStep, onCreated }: OwnerStepProps) => {
  const [searchParams] = useSearchParams();

  const upin = searchParams.get("upin") || "";
  const subCity = searchParams.get("sub_city") || "";

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<OwnerStepFormData>({
    resolver: zodResolver(OwnerStepFormSchema),
    defaultValues: {
      full_name: "",
      national_id: "",
      tin_number: "",
      phone_number: "",
      share_ratio: 1.0,
      acquired_at: today,
    },
  });

  const onSubmit = async (data: OwnerStepFormData) => {
    try {
      const payload = {
        ...data,
        upin, // from URL
      };

      const res = await createOwner(payload);
      if (res.success) {
        const { owner_id } = res.data;
        onCreated({ owner_id });
      } else {
        // backend Zod error message from API if provided
        // eslint-disable-next-line no-console
        console.error(res.message || "Failed to create owner");
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err.message || "Failed to create owner");
    }
  };

  if (!upin) {
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
        Owner for{" "}
        <span className="font-semibold text-blue-600">{upin}</span> (
        {subCity})
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Acquired At *
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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Share Ratio *
          </label>
          <input
            type="number"
            min="0.01"
            max="1"
            step="0.01"
            {...register("share_ratio")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.share_ratio && (
            <p className="mt-1 text-sm text-red-600">
              {errors.share_ratio.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            e.g. 1.0 = full ownership, 0.5 = 50%
          </p>
        </div>

        <div className="md:col-span-2 flex justify-between gap-4 pt-6">
          <button
            type="button"
            onClick={prevStep}
            className="px-8 py-3 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
          >
            ← Previous
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {isSubmitting ? "Creating Owner..." : "Create Owner & Next"}
          </button>
        </div>
      </form>
    </>
  );
};

export default OwnerStep;
