// src/components/parcelDetail/modals/CreateLeaseModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LeaseStepFormSchema,
  type LeaseStepFormData,
} from "../../../validation/schemas";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import { createLease } from "../../../services/parcelApi";
import { useAuth } from "../../../contexts/AuthContext";
import { AlertCircle, Receipt, Ruler, FileText } from "lucide-react";
import { toast } from "sonner";

type Props = {
  parcel: ParcelDetail;
  open: boolean;
  onClose: () => void;
  onCreated: (result: any) => Promise<void> | void;
};

const CreateLeaseModal = ({ parcel, open, onClose, onCreated }: Props) => {
  const { user } = useAuth();
  const isSubcityNormal = user?.role === "SUBCITY_NORMAL";
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeaseStepFormData>({
    resolver: zodResolver(LeaseStepFormSchema),
    defaultValues: {
      price_per_m2: 0,
      total_lease_amount: 0,
      down_payment_amount: 0,
      other_payment: 0,
      demarcation_fee: 0,
      contract_registration_fee: 0,
      engineering_service_fee: 0,
      lease_period_years: 0,
      payment_term_years: 0,
      legal_framework: "",
      contract_date: "",
      start_date: "",
    },
  });

  if (!open) return null;

  const onSubmit = async (data: LeaseStepFormData) => {
    try {
      const payload = {
        ...data,
        upin: parcel.upin, // required by backend
        // expiry_date is computed on backend
      };

      const response = await createLease(payload);
      
      // Check if approval is required
      if (response.data?.approval_request_id) {
        toast.info(response.message || "Lease creation request submitted for approval");
        await onCreated({
          approval_request_id: response.data.approval_request_id,
          ...response.data
        });
      } else if (response.data?.lease_id) {
        // Immediate execution
        toast.success(response.message || "Lease agreement created successfully");
        await onCreated({
          lease_id: response.data.lease_id,
          ...response.data
        });
      } else {
        // Fallback - try to extract ID from response
        const leaseId = response.data?.lease_id || response.data?.id || response.id;
        toast.success(response.message || "Lease agreement created successfully");
        await onCreated({ lease_id: leaseId, ...response.data });
      }

      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create lease");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with gradient */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Create Lease Agreement
              </h3>
              <p className="mt-1 text-sm text-emerald-100">
                Parcel: <span className="font-mono bg-emerald-700/30 px-2 py-0.5 rounded">{parcel.upin}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info Banner - Show approval info for SUBCITY_NORMAL */}
        {isSubcityNormal && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-6 mt-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Lease Creation Request</p>
                <p>
                  Your lease creation will be submitted for approval. 
                  You can upload supporting documents after submission.
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-6 text-sm"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Price per m² */}
            <div>
              <label className="block text-gray-700 mb-1">
                Price per m² <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                {...register("price_per_m2")}
              />
              {errors.price_per_m2 && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.price_per_m2.message}
                </p>
              )}
            </div>

            {/* Total lease amount */}
            <div>
              <label className="block text-gray-700 mb-1">
                Total lease amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                {...register("total_lease_amount")}
              />
              {errors.total_lease_amount && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.total_lease_amount.message}
                </p>
              )}
            </div>

            {/* Down payment amount */}
            <div>
              <label className="block text-gray-700 mb-1">
                Down payment amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                {...register("down_payment_amount")}
              />
              {errors.down_payment_amount && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.down_payment_amount.message}
                </p>
              )}
            </div>
            
            {/* Other payment amount */}
            <div>
              <label className="block text-gray-700 mb-1">
                Other payment amount
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                {...register("other_payment")}
              />
              {errors.other_payment && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.other_payment.message}
                </p>
              )}
            </div>

            {/* NEW: Demarcation Fee */}
            <div>
              <label className="block text-gray-700 mb-1 flex items-center gap-1">
                <Ruler size={16} className="text-gray-500" />
                Demarcation Fee
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional"
                {...register("demarcation_fee")}
              />
              {errors.demarcation_fee && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.demarcation_fee.message}
                </p>
              )}
            </div>

            {/* NEW: Engineering Service Fee */}
            <div>
              <label className="block text-gray-700 mb-1 flex items-center gap-1">
                <FileText size={16} className="text-gray-500" />
                Engineering Service Fee
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                {...register("engineering_service_fee")}
              />
              {errors.engineering_service_fee && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.engineering_service_fee.message}
                </p>
              )}
            </div>

            {/* NEW: Contract Registration Fee*/}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1 flex items-center gap-1">
                <Receipt size={16} className="text-gray-500" />
                Contract Registration Fee 
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0"
                {...register("contract_registration_fee",{valueAsNumber:true})}
              />
              {errors.contract_registration_fee && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.contract_registration_fee.message}
                </p>
              )}
            
            </div>
            
            {/* Lease period years */}
            <div>
              <label className="block text-gray-700 mb-1">
                Lease period (years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                {...register("lease_period_years")}
              />
              {errors.lease_period_years && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.lease_period_years.message}
                </p>
              )}
            </div>

            {/* Payment term years */}
            <div>
              <label className="block text-gray-700 mb-1">
                Payment term (years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                {...register("payment_term_years")}
              />
              {errors.payment_term_years && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.payment_term_years.message}
                </p>
              )}
            </div>

            {/* Legal framework */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1">
                Legal framework <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                {...register("legal_framework")}
              />
              {errors.legal_framework && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.legal_framework.message}
                </p>
              )}
            </div>

            {/* Contract date */}
            <div>
              <label className="block text-gray-700 mb-1">
                Contract date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                {...register("contract_date")}
              />
              {errors.contract_date && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.contract_date.message}
                </p>
              )}
            </div>

            {/* Start date */}
            <div>
              <label className="block text-gray-700 mb-1">
                Start date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.start_date.message}
                </p>
              )}
            </div>
          </div>

          {/* Additional fees info banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-purple-700 flex items-center gap-1">
              <Receipt size={14} />
              Additional fees (demarcation, engineering, registration)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                isSubcityNormal ? 'Submit for Approval' : 'Save Lease'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeaseModal;