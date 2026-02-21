// src/components/wizard/ParcelWizard/LeaseStep.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizard } from "../../../contexts/WizardContext";
import type { LeaseStepProps } from "../../../types/wizard";
import {
  LeaseStepFormSchema,
  type LeaseStepFormData,
} from "../../../validation/schemas";
import { toast } from 'sonner';
import { Receipt, Ruler, FileText } from "lucide-react";

const LeaseStep = ({ nextStep, prevStep }: LeaseStepProps) => {
  const { currentSession, saveStep, isLoading } = useWizard();
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<LeaseStepFormData>({
    resolver: zodResolver(LeaseStepFormSchema),
    defaultValues: {
      price_per_m2: 0,
      total_lease_amount: 0,
      down_payment_amount: 0,
      other_payment: 0,
      // New fee fields
      demarcation_fee: 0,
      contract_registration_fee: 0,
      engineering_service_fee: 0,
      lease_period_years: 0,
      payment_term_years: 0,
      start_date: today,
      contract_date: today,
      legal_framework: "",
    },
  });

  // Load existing data if available
  useEffect(() => {
    if (currentSession?.lease_data) {
      reset(currentSession.lease_data);
    }
  }, [currentSession?.lease_data, reset]);

  // Watch values to calculate expiry date
  const startDate = watch("start_date");
  const leasePeriod = watch("lease_period_years");

  const calculateExpiryDate = () => {
    if (startDate && leasePeriod) {
      const start = new Date(startDate);
      const expiry = new Date(start);
      expiry.setFullYear(expiry.getFullYear() + parseInt(leasePeriod.toString()));
      return expiry.toISOString().split("T")[0];
    }
    return "";
  };

  const onSubmit = async (data: LeaseStepFormData) => {
    try {
      await saveStep('lease', data);
      toast.success('Lease information saved');
      nextStep();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save lease information');
      console.error("Save error:", err);
    }
  };

  // Show warning if no owner data
  if (!currentSession?.owner_data) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-red-600 mb-4">
          Missing Owner Information
        </p>
        <p className="text-gray-600 mb-6">
          Please complete the Owner step first.
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

  const expiryDate = calculateExpiryDate();

  return (
    <>
      <h2 className="text-3xl font-bold text-[#2a2718] mb-2">
        Register Lease Agreement
      </h2>
      <p className="text-[#2a2718]/70 mb-8">
        Optional: Register lease agreement for the parcel
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Main Lease Information */}
        <div className="bg-white p-6 rounded-xl border border-[#f0cd6e]">
          <h3 className="text-lg font-semibold text-[#2a2718] mb-4">
            Lease Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price per m² */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                Price per m² (ETB) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("price_per_m2", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              />
              {errors.price_per_m2 && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.price_per_m2.message}
                </p>
              )}
            </div>

            {/* Total Lease Amount */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                Total Lease Amount (ETB) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("total_lease_amount", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              />
              {errors.total_lease_amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.total_lease_amount.message}
                </p>
              )}
            </div>

            {/* Down Payment Amount */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                Down Payment Amount (ETB)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("down_payment_amount", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              />
              {errors.down_payment_amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.down_payment_amount.message}
                </p>
              )}
            </div>

            {/* Other Payment Amount */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                Other Payment Amount (ETB)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("other_payment", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              />
              {errors.other_payment && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.other_payment.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Fees Section - NEW */}
        <div className="bg-[#f0cd6e]/10 p-6 rounded-xl border border-[#f0cd6e]">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-[#2a2718]" />
            <h3 className="text-lg font-semibold text-[#2a2718]">
              Additional Fees 
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Demarcation Fee */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-2 flex items-center gap-1">
                <Ruler size={16} className="text-[#2a2718]" />
                Demarcation Fee (ETB)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("demarcation_fee", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
                placeholder="0.00"
              />
              {errors.demarcation_fee && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.demarcation_fee.message}
                </p>
              )}
           
            </div>

            {/* Engineering Service Fee */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-2 flex items-center gap-1">
                <FileText size={16} className="text-[#2a2718]" />
                Engineering Service Fee (ETB)
              </label>
              <input
              type="number"
                min="0"
                step="0.01"
                {...register("engineering_service_fee", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
                placeholder="0.00"
              />
              {errors.engineering_service_fee && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.engineering_service_fee.message}
                </p>
              )}
             
            </div>

            {/* Contract Registration Fee */}
                  
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-2 flex items-center gap-1">
                <Receipt size={16} className="text-[#2a2718]" />
                Contract Registration Fee (ETB)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("contract_registration_fee", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
                placeholder="0.00"
              />
              {errors.contract_registration_fee && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contract_registration_fee.message}
                </p>
              )}
              <p className="text-xs text-[#2a2718]/70 mt-1">
                Contract registration fee amount
              </p>
            </div>
          </div>
        </div>
         
      

        {/* Period Information */}
        <div className="bg-white p-6 rounded-xl border border-[#f0cd6e]">
          <h3 className="text-lg font-semibold text-[#2a2718] mb-4">
            Lease Period & Dates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lease Period */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                Lease Period (Years) *
              </label>
              <input
                type="number"
                min="1"
                {...register("lease_period_years", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              />
              {errors.lease_period_years && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lease_period_years.message}
                </p>
              )}
            </div>

            {/* Payment Term */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                Payment Term (Years) *
              </label>
              <input
                type="number"
                min="1"
                {...register("payment_term_years", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              />
              {errors.payment_term_years && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.payment_term_years.message}
                </p>
              )}
            </div>

            {/* Contract Date */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                Contract Date *
              </label>
              <input
                type="date"
                max={today}
                {...register("contract_date")}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              />
              {errors.contract_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contract_date.message}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                Start Date *
              </label>
              <input
                type="date"
                min={today}
                {...register("start_date")}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            {/* Expiry Date (calculated, read-only) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                Expiry Date (calculated)
              </label>
              <input
                type="text"
                value={expiryDate || "Enter start date and lease period"}
                readOnly
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl bg-[#f0cd6e]/10 text-[#2a2718]"
              />
              <p className="text-xs text-[#2a2718]/70 mt-1">
                Calculated based on start date + lease period
              </p>
            </div>
          </div>
        </div>

        {/* Legal Framework */}
        <div className="bg-white p-6 rounded-xl border border-[#f0cd6e]">
          <h3 className="text-lg font-semibold text-[#2a2718] mb-4">
            Legal Information
          </h3>
          <div>
            <label className="block text-sm font-semibold text-[#2a2718] mb-2">
              Legal Framework *
            </label>
            <textarea
              rows={3}
              {...register("legal_framework")}
              placeholder="e.g. Proclamation No. 721/2011, Urban Lands Lease Holding Proclamation"
              className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] resize-none"
            />
            {errors.legal_framework && (
              <p className="mt-1 text-sm text-red-600">
                {errors.legal_framework.message}
              </p>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#f0cd6e]/10 border border-[#f0cd6e] rounded-lg p-4">
          <p className="text-sm text-[#2a2718] flex items-center gap-2">
            <Receipt size={16} />
            <span>
              <strong>Note:</strong> Additional fees (demarcation, engineering, registration) are stored separately and do not affect the lease payment calculations or installment plans.
            </span>
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 rounded-xl border border-[#f0cd6e] text-[#2a2718] font-semibold hover:bg-[#f0cd6e]/20 transition"
            >
              ← Back
            </button>
            
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 rounded-xl border border-[#f0cd6e] text-[#2a2718] font-semibold hover:bg-[#f0cd6e]/20 transition"
            >
              Skip Lease
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save Lease & Continue →"}
          </button>
        </div>
      </form>
    </>
  );
};

export default LeaseStep;