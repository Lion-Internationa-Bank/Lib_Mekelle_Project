// src/components/parcelDetail/modals/CreateLeaseModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LeaseStepFormSchema,
  type LeaseStepFormData,
} from "../../../validation/schemas";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import { createLease } from "../../../services/parcelApi";
import { toast } from "sonner";

type Props = {
  parcel: ParcelDetail;
  open: boolean;
  onClose: () => void;
  onCreated: (leaseId: string) => Promise<void> | void;
};

const CreateLeaseModal = ({ parcel, open, onClose, onCreated }: Props) => {
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
      const leaseId = response.data?.lease_id as string;

      reset();
      await onCreated(leaseId);
    toast.success(response.message || "Successfuly registered lease agreement")
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create lease")
      console.error(err);
  
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Create Lease Agreement
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the lease details for parcel{" "}
            <span className="font-mono font-semibold">{parcel.upin}</span>.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-6 text-sm"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-1">
                Price per m² *
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2"
                {...register("price_per_m2")}
              />
              {errors.price_per_m2 && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.price_per_m2.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Total lease amount *
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2"
                {...register("total_lease_amount")}
              />
              {errors.total_lease_amount && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.total_lease_amount.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Down payment amount *
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2"
                {...register("down_payment_amount")}
              />
              {errors.down_payment_amount && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.down_payment_amount.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-1">
                Lease period (years) *
              </label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                {...register("lease_period_years")}
              />
              {errors.lease_period_years && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.lease_period_years.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Payment term (years) *
              </label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                {...register("payment_term_years")}
              />
              {errors.payment_term_years && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.payment_term_years.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1">
                Legal framework *
              </label>
              <textarea
                rows={2}
                className="w-full border rounded-lg px-3 py-2"
                {...register("legal_framework")}
              />
              {errors.legal_framework && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.legal_framework.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Contract date *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                {...register("contract_date")}
              />
              {errors.contract_date && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.contract_date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Start date *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.start_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Lease"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeaseModal;
