// src/components/wizard/ParcelStep.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ParcelFormSchema,
  type ParcelFormData,
} from "../../validation/schemas";
import type { ParcelStepProps } from "../../types/wizard";
import { createParcel } from "../../services/parcelApi";
import {  getConfig,  } from "../../services/cityAdminService";
import { useEffect, useState } from "react";
import { toast } from 'sonner';

const ParcelStep = ({ onCreated }: ParcelStepProps) => {
  const [landUseOptions, setLandUseOptions] = useState<string[]>([]);
  const [tenureOptions, setTenureOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    subCities: false,
    categories: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
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
      tenure_type: "",
      boundary_coords: "",
      boundary_north: "",
      boundary_east: "",
      boundary_south: "",
      boundary_west: "",
    },
  });

  // Load sub-cities and categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading((prev) => ({ ...prev,  }));
    
        setLoading((prev) => ({ ...prev,  }));

        setLoading((prev) => ({ ...prev, categories: true }));
        const landUseRes = await getConfig("LAND_USE");
        if (landUseRes.success && landUseRes.data?.options) {
          setLandUseOptions(landUseRes.data.options.map((opt: any) => opt.value));
        }

        const tenureRes = await getConfig("LAND_TENURE");
        if (tenureRes.success && tenureRes.data?.options) {
          setTenureOptions(tenureRes.data.options.map((opt: any) => opt.value));
        }
        setLoading((prev) => ({ ...prev, categories: false }));
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading({ subCities: false, categories: false });
      }
    };

    loadData();
  }, []);

  // Auto-uppercase UPIN
  const upinValue = watch("upin");

const onSubmit = async (data: ParcelFormData) => {
  try {
    const res = await createParcel(data);
    if (res.success) {
      const { upin, sub_city } = res.data;
      onCreated({ upin, sub_city });
      toast.success(`Parcel ${upin} created`); 
    } else {
      toast.error(res.message || 'Parcel creation failed');
      console.error("Parcel creation failed:", res.message);
    }
  } catch (err: any) {
    toast.error(err.message || 'Network/API error'); 
    console.error("Network/API error:", err);
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
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Register Land Parcel
      </h2>
      <p className="text-gray-600 mb-8">
        Fill in all required fields to register a new parcel
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl"
      >
        {/* UPIN */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            UPIN *
          </label>
          <input
            {...register("upin")}
            onChange={(e) =>
              setValue("upin", e.target.value.toUpperCase(), {
                shouldValidate: true,
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
            placeholder="e.g. MANC-2347"
          />
          {errors.upin && (
            <p className="mt-1 text-sm text-red-600">{errors.upin.message}</p>
          )}
        </div>

        {/* File Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            File Number *
          </label>
          <input
            {...register("file_number")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ketena *
          </label>
          <input
            {...register("ketena")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Ketena 01"
          />
          {errors.ketena && (
            <p className="mt-1 text-sm text-red-600">{errors.ketena.message}</p>
          )}
        </div>

        {/* Tabia */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tabia *
          </label>
          <input
            {...register("tabia")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Tabia 05"
          />
          {errors.tabia && (
            <p className="mt-1 text-sm text-red-600">{errors.tabia.message}</p>
          )}
        </div>

        {/* Block */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Block *
          </label>
          <input
            {...register("block")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Block A"
          />
          {errors.block && (
            <p className="mt-1 text-sm text-red-600">{errors.block.message}</p>
          )}
        </div>

        {/* Total Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Area (m²) *
          </label>
          <input
            {...register("total_area_m2")}
            type="number"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.total_area_m2 && (
            <p className="mt-1 text-sm text-red-600">
              {errors.total_area_m2.message}
            </p>
          )}
        </div>

        {/* Land Use */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Land Use *
          </label>
          <select
            {...register("land_use")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading.categories}
          >
            <option value="">Select Land Use</option>
            {loading.categories ? (
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Land Grade *
          </label>
          <input
            {...register("land_grade")}
            type="number"
            step="0.01"
            min="1.0"
            placeholder="e.g. 1.0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.land_grade && (
            <p className="mt-1 text-sm text-red-600">
              {errors.land_grade.message}
            </p>
          )}
        </div>

        {/* Tenure Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tenure Type *
          </label>
          <select
            {...register("tenure_type")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading.categories}
          >
            <option value="">Select Tenure Type</option>
            {loading.categories ? (
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

        {/* Optional Geometry Data */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Geometry Data (Optional)
          </label>
          <textarea
            {...register("boundary_coords")}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
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
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Fill with example geometry
          </button>
        </div>

        {/* NEW: Boundary Fields - All Optional */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              North Boundary (optional)
            </label>
            <input
              {...register("boundary_north")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. North boundary description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              East Boundary (optional)
            </label>
            <input
              {...register("boundary_east")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. East boundary description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              South Boundary (optional)
            </label>
            <input
              {...register("boundary_south")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. South boundary description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              West Boundary (optional)
            </label>
            <input
              {...register("boundary_west")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. West boundary description"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end mt-10">
          <button
            type="submit"
            disabled={isSubmitting || loading.subCities || loading.categories}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg flex items-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Parcel...
              </>
            ) : (
              "Create Parcel & Continue →"
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default ParcelStep;