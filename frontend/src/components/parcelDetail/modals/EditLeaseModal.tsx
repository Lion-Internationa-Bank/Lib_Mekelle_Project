// src/modals/EditLeaseModal.tsx
import { useEffect, useState } from "react";
import {
  type ParcelDetail,
  updateLeaseApi,
} from "../../../services/parcelDetailApi";
import {
  EditLeaseFormSchema,
  type EditLeaseFormData,
} from "../../../validation/schemas";
import { z } from "zod";

type Lease = NonNullable<ParcelDetail["lease_agreement"]>;

type Props = {
  lease: Lease;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

const EditLeaseModal = ({ lease, open, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState<Partial<EditLeaseFormData>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !lease) return;

    // Pre-fill form with real numbers (safe type handling)
    setForm({
      annual_lease_fee: Number(lease.annual_lease_fee) ?? undefined,
      total_lease_amount: Number( lease.total_lease_amount) ?? undefined,
      down_payment_amount: Number( lease.down_payment_amount) ?? undefined,
      annual_installment: Number( lease.annual_installment ) ?? undefined,
      price_per_m2: Number( lease.price_per_m2) ?? undefined,
      lease_period_years:Number(lease.lease_period_years )  ?? undefined,
          payment_term_years:Number(  lease.payment_term_years) ?? undefined,
      contract_date: lease.contract_date?.slice(0, 10) || undefined,
      start_date: lease.start_date?.slice(0, 10) || undefined,
      expiry_date: lease.expiry_date?.slice(0, 10) || undefined,
      legal_framework: lease.legal_framework || undefined,
    });
    setError(null);
  }, [open, lease]);

  const handleSave = async () => {
    try {
      setError(null);
      setSaving(true);

      // Zod validates numbers directly
      const parsed = EditLeaseFormSchema.parse(form) as EditLeaseFormData;

      await updateLeaseApi(lease.lease_id, parsed);
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        // Show first error message
        setError(err.issues[0]?.message || "Validation failed");
      } else if (err instanceof Error) {
        setError(err.message || "Failed to update lease");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full my-8">
        <h2 className="text-2xl font-bold mb-6">Edit Lease Agreement</h2>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Annual Lease Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Lease Fee
            </label>
            <input
              type="number"
              step="0.01"
              value={form.annual_lease_fee ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  annual_lease_fee: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Total Lease Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Lease Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={form.total_lease_amount ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  total_lease_amount: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Down Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={form.down_payment_amount ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  down_payment_amount: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Annual Installment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Installment
            </label>
            <input
              type="number"
              step="0.01"
              value={form.annual_installment ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  annual_installment: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price per m² */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per m²
            </label>
            <input
              type="number"
              step="0.01"
              value={form.price_per_m2 ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  price_per_m2: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lease Period Years */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lease Period (Years)
            </label>
            <input
              type="number"
              value={form.lease_period_years ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  lease_period_years: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Term Years */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Term (Years)
            </label>
            <input
              type="number"
              value={form.payment_term_years ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  payment_term_years: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contract Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Date
            </label>
            <input
              type="date"
              value={form.contract_date ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contract_date: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={form.start_date ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  start_date: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={form.expiry_date ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  expiry_date: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Legal Framework */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legal Framework
            </label>
            <input
              type="text"
              value={form.legal_framework ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  legal_framework: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-10 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLeaseModal;