// src/components/wizard/LeaseStep.tsx
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLease } from "../../services/parcelApi";
import type { LeaseStepProps } from "../../types/wizard";
import {
  LeaseStepFormSchema,
  type LeaseStepFormData,
} from "../../validation/schemas";

const LeaseStep = ({ nextStep, prevStep, onCreated }: LeaseStepProps) => {
  const [searchParams] = useSearchParams();
  const upin = searchParams.get("upin") || "";

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeaseStepFormData>({
    resolver: zodResolver(LeaseStepFormSchema),
    defaultValues: {
      price_per_m2: 2000,
      total_lease_amount: 6547896,
      down_payment_amount: 0,
      annual_installment: 0,
      annual_lease_fee: 0,
      lease_period_years: 53,
      payment_term_years: 6,
      start_date: "",
      expiry_date: "",
      contract_date: today,
      legal_framework: "",
    },
  });

  if (!upin) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-red-600 mb-4">
          Missing Parcel Information
        </p>
        <p className="text-gray-600 mb-6">
          Please register a parcel first.
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

  const onSubmit = async (data: LeaseStepFormData) => {
    try {
      const payload = {
        ...data,
        upin, // from URL
      };

      const res = await createLease(payload);
      if (res.success) {
        const { lease_id } = res.data;
        onCreated({ lease_id });
      } else {
        console.error(res.message || "Failed to create lease");
      }
    } catch (err: any) {
      console.error(err.message || "Failed to create lease");
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Register Lease Agreement
      </h2>
      <p className="text-gray-600 mb-8">
        Lease details for{" "}
        <span className="font-semibold text-purple-600">{upin}</span>
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Row 1 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Price per m² (ETB) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register("price_per_m2")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.price_per_m2 && (
            <p className="mt-1 text-sm text-red-600">
              {errors.price_per_m2.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Lease Amount (ETB) *
          </label>
          <input
            type="number"
            min="0"
            {...register("total_lease_amount")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.total_lease_amount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.total_lease_amount.message}
            </p>
          )}
        </div>

        {/* Row 2 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Down Payment Amount (ETB)
          </label>
          <input
            type="number"
            min="0"
            {...register("down_payment_amount")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.down_payment_amount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.down_payment_amount.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Annual Installment (ETB)
          </label>
          <input
            type="number"
            min="0"
            {...register("annual_installment")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.annual_installment && (
            <p className="mt-1 text-sm text-red-600">
              {errors.annual_installment.message}
            </p>
          )}
        </div>

        {/* Row 3 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Annual Lease Fee (ETB)
          </label>
          <input
            type="number"
            min="0"
            {...register("annual_lease_fee")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.annual_lease_fee && (
            <p className="mt-1 text-sm text-red-600">
              {errors.annual_lease_fee.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Lease Period (Years) *
          </label>
          <input
            type="number"
            min="1"
            {...register("lease_period_years")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.lease_period_years && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lease_period_years.message}
            </p>
          )}
        </div>

        {/* Row 4 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Term (Years) *
          </label>
          <input
            type="number"
            min="1"
            {...register("payment_term_years")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.payment_term_years && (
            <p className="mt-1 text-sm text-red-600">
              {errors.payment_term_years.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contract Date *
          </label>
          <input
            type="date"
            max={today}
            {...register("contract_date")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.contract_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.contract_date.message}
            </p>
          )}
        </div>

        {/* Row 5 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            {...register("start_date")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.start_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.start_date.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Expiry Date *
          </label>
          <input
            type="date"
            {...register("expiry_date")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {errors.expiry_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.expiry_date.message}
            </p>
          )}
        </div>

        {/* Row 6 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Legal Framework *
          </label>
          <textarea
            rows={3}
            {...register("legal_framework")}
            placeholder="e.g. Proclamation No. 721/2011, Urban Lands Lease Holding Proclamation"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          {errors.legal_framework && (
            <p className="mt-1 text-sm text-red-600">
              {errors.legal_framework.message}
            </p>
          )}
        </div>

        {/* Navigation */}
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
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {isSubmitting ? "Creating Lease..." : "Create Lease & Next"}
          </button>
        </div>
      </form>
    </>
  );
};

export default LeaseStep;