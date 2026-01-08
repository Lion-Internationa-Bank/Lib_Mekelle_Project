// src/components/wizard/ParcelStep.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ParcelFormSchema,
  type ParcelFormData,
} from "../../validation/schemas";
import type { ParcelStepProps } from "../../types/wizard";
import { createParcel } from "../../services/parcelApi";

const ParcelStep = ({ onCreated }: ParcelStepProps) => {
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
      sub_city: "",
      tabia: "",
      ketena: "",
      block: "",
      total_area_m2: 0,
      land_use: "",
      land_grade: 1.0,
      tenure_type: "",
      geometry_data: undefined,
    },
  });

  // Watch UPIN to auto-uppercase (optional, can be removed if unused)
  const upinValue = watch("upin");

  const onSubmit = async (data: ParcelFormData) => {
    try {
      const res = await createParcel(data);
      if (res.success) {
        const { upin, sub_city } = res.data;
        onCreated({ upin, sub_city });
      } else {
        console.error("Parcel creation failed:", res.message);
      }
    } catch (err: any) {
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
    setValue("geometry_data", JSON.stringify(example, null, 2), {
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

        {/* Sub City */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sub City *
          </label>
          <select
            {...register("sub_city")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Sub City</option>
            <option>Ayder</option>
            <option>Hawelti</option>
            <option>Adi Haqi</option>
            <option>Hadnet</option>
            <option>Kedamay Weyane</option>
            <option>Kwiha</option>
            <option>Semien Mekelle</option>
          </select>
          {errors.sub_city && (
            <p className="mt-1 text-sm text-red-600">
              {errors.sub_city.message}
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
          >
            <option value="">Select Land Use</option>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Industrial</option>
            <option>Agricultural</option>
            <option>Mixed</option>
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
          >
            <option value="">Select Tenure Type</option>
            <option>LEASE</option>
            <option>OLD_POSSESSION</option>
          </select>
          {errors.tenure_type && (
            <p className="mt-1 text-sm text-red-600">
              {errors.tenure_type.message}
            </p>
          )}
        </div>

        {/* Optional Geometry (kept commented as in your code) */}
        {/* ... */}

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
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
