// src/components/wizard/ParcelWizard/ParcelStep.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ParcelFormSchema,
  type ParcelFormData,
} from "../../../validation/schemas";
import type { ParcelStepProps } from "../../../types/wizard";
import { useWizard } from "../../../contexts/WizardContext";
import { getConfig } from "../../../services/cityAdminService";
import { useEffect, useState } from "react";
import { toast } from 'sonner';

const ParcelStep = ({ nextStep }: ParcelStepProps) => {
  const { currentSession, saveStep, isLoading } = useWizard();
  const [landUseOptions, setLandUseOptions] = useState<string[]>([]);
  const [tenureOptions, setTenureOptions] = useState<string[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ParcelFormData>({
    resolver: zodResolver(ParcelFormSchema),
    defaultValues: {
      upin: "",
      file_number: "",
      tabia: "",
      ketena: "",
      block: "",
      total_area_m2: 0,
      land_use: "",
      land_grade: 1.0,
      tender:"",
      tenure_type: "",
      boundary_coords: "",
      boundary_north: "",
      boundary_east: "",
      boundary_south: "",
      boundary_west: "",
    },
  });

  // Load existing data if available
  useEffect(() => {
    if (currentSession?.parcel_data) {
      reset(currentSession.parcel_data);
    }
  }, [currentSession?.parcel_data, reset]);

  // Load configuration options
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingConfig(true);
        
        const [landUseRes, tenureRes] = await Promise.all([
          getConfig("LAND_USE"),
          getConfig("LAND_TENURE")
        ]);

        if (landUseRes.success && landUseRes.data?.options) {
          setLandUseOptions(landUseRes.data.options.map((opt: any) => opt.value));
        }

        if (tenureRes.success && tenureRes.data?.options) {
          setTenureOptions(tenureRes.data.options.map((opt: any) => opt.value));
        }
      } catch (error) {
        console.error("Error loading configuration:", error);
        toast.error("Failed to load configuration options");
      } finally {
        setLoadingConfig(false);
      }
    };

    loadData();
  }, []);

  // Auto-uppercase UPIN
  const upinValue = watch("upin");
  useEffect(() => {
    if (upinValue) {
      setValue("upin", upinValue.toUpperCase(), { shouldValidate: true });
    }
  }, [upinValue, setValue]);

  const onSubmit = async (data: ParcelFormData) => {
    try {
      await saveStep('parcel', data);
      toast.success('Parcel information saved');
      nextStep();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save parcel information');
      console.error("Save error:", err);
    }
  };

  const fillExampleGeometry = () => {
    const example = {
      type: "Polygon",
      coordinates: [
        [
          [38.757, 9.03],
          [38.759, 9.03],
          [38.759, 9.032],
          [38.757, 9.032],
          [38.757, 9.03],
        ],
      ],
    };
    setValue("boundary_coords", JSON.stringify(example, null, 2), {
      shouldValidate: true,
    });
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-[#2a2718] mb-2">
        Register Land Parcel
      </h2>
      <p className="text-[#2a2718]/70 mb-8">
        Fill in all required fields to register a new parcel
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* UPIN */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            UPIN *
          </label>
          <input
            {...register("upin")}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] text-lg font-mono"
            placeholder="e.g. MANC-2347"
          />
          {errors.upin && (
            <p className="mt-1 text-sm text-red-600">{errors.upin.message}</p>
          )}
        </div>

        {/* File Number */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            File Number *
          </label>
          <input
            {...register("file_number")}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            placeholder="e.g. FIL-2026-001"
          />
          {errors.file_number && (
            <p className="mt-1 text-sm text-red-600">
              {errors.file_number.message}
            </p>
          )}
        </div>

        {/* Ketena */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            Ketena *
          </label>
          <input
            {...register("ketena")}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            placeholder="e.g. Ketena 01"
          />
          {errors.ketena && (
            <p className="mt-1 text-sm text-red-600">{errors.ketena.message}</p>
          )}
        </div>

        {/* Tabia */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            Tabia *
          </label>
          <input
            {...register("tabia")}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            placeholder="e.g. Tabia 05"
          />
          {errors.tabia && (
            <p className="mt-1 text-sm text-red-600">{errors.tabia.message}</p>
          )}
        </div>

        {/* Block */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            Block *
          </label>
          <input
            {...register("block")}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            placeholder="e.g. Block A"
          />
          {errors.block && (
            <p className="mt-1 text-sm text-red-600">{errors.block.message}</p>
          )}
        </div>

        {/* Total Area */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            Total Area (m²) *
          </label>
          <input
            {...register("total_area_m2", { valueAsNumber: true })}
            type="number"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
          />
          {errors.total_area_m2 && (
            <p className="mt-1 text-sm text-red-600">
              {errors.total_area_m2.message}
            </p>
          )}
        </div>

        {/* Land Use */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            Land Use *
          </label>
          <select
            {...register("land_use")}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            disabled={loadingConfig}
          >
            <option value="">Select Land Use</option>
            {loadingConfig ? (
              <option value="" disabled>Loading options...</option>
            ) : (
              landUseOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))
            )}
          </select>
          {errors.land_use && (
            <p className="mt-1 text-sm text-red-600">
              {errors.land_use.message}
            </p>
          )}
        </div>

        {/* Land Grade */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            Land Grade *
          </label>
          <input
            {...register("land_grade", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="1.0"
            placeholder="e.g. 1.0"
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
          />
          {errors.land_grade && (
            <p className="mt-1 text-sm text-red-600">
              {errors.land_grade.message}
            </p>
          )}
        </div>

        {/* Tenure Type */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            Tenure Type *
          </label>
          <select
            {...register("tenure_type")}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            disabled={loadingConfig}
          >
            <option value="">Select Tenure Type</option>
            {loadingConfig ? (
              <option value="" disabled>Loading options...</option>
            ) : (
              tenureOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))
            )}
          </select>
          {errors.tenure_type && (
            <p className="mt-1 text-sm text-red-600">
              {errors.tenure_type.message}
            </p>
          )}
        </div>
             {/* Tender */}
        <div>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            Tender *
          </label>
          <input
            {...register("tender")}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            placeholder="e.g. tender 01"
          />
          {errors.tender && (
            <p className="mt-1 text-sm text-red-600">{errors.tender.message}</p>
          )}
        </div>

        {/* Optional Geometry Data */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            Geometry Data (Optional)
          </label>
          <textarea
            {...register("boundary_coords")}
            rows={4}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] font-mono text-sm"
            placeholder='{"type": "Polygon", "coordinates": [...]}'
          />
          {errors.boundary_coords && (
            <p className="mt-1 text-sm text-red-600">
              {errors.boundary_coords.message}
            </p>
          )}
          <button
            type="button"
            onClick={fillExampleGeometry}
            className="mt-2 text-sm text-[#f0cd6e] hover:text-[#2a2718]"
          >
            Fill with example geometry
          </button>
        </div>

        {/* Boundary Fields */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-[#2a2718] mb-1.5">
              North Boundary (optional)
            </label>
            <input
              {...register("boundary_north")}
              className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e]"
              placeholder="e.g. North boundary description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2a2718] mb-1.5">
              East Boundary (optional)
            </label>
            <input
              {...register("boundary_east")}
              className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e]"
              placeholder="e.g. East boundary description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2a2718] mb-1.5">
              South Boundary (optional)
            </label>
            <input
              {...register("boundary_south")}
              className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e]"
              placeholder="e.g. South boundary description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2a2718] mb-1.5">
              West Boundary (optional)
            </label>
            <input
              {...register("boundary_west")}
              className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e]"
              placeholder="e.g. West boundary description"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end mt-10">
          <button
            type="submit"
            disabled={isSubmitting || isLoading || loadingConfig}
            className="bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] disabled:opacity-70 text-white font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg flex items-center gap-3"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Parcel & Continue →"
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default ParcelStep;