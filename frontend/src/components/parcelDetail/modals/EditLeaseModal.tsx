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
import UniversalDateInput from "../../UniversalDateInput";
import { Calendar, DollarSign, Clock, FileText } from "lucide-react";
import { useCalendar } from "../../../contexts/CalendarContext";

type Lease = NonNullable<ParcelDetail["lease_agreement"]>;

type Props = {
  lease: Lease;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

// Local form type: all dates are Date | undefined
type EditLeaseFormWithDates = Omit<
  EditLeaseFormData,
  "contract_date" | "start_date" | "expiry_date"
> & {
  contract_date?: Date;
  start_date?: Date;
  expiry_date?: Date;
};

const EditLeaseModal = ({ lease, open, onClose, onSuccess }: Props) => {
  const { isEthiopian } = useCalendar();
  const [form, setForm] = useState<Partial<EditLeaseFormWithDates>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !lease) return;

    setForm({
      annual_lease_fee: lease.annual_lease_fee
        ? Number(lease.annual_lease_fee)
        : undefined,
      total_lease_amount: lease.total_lease_amount
        ? Number(lease.total_lease_amount)
        : undefined,
      down_payment_amount: lease.down_payment_amount
        ? Number(lease.down_payment_amount)
        : undefined,
      annual_installment: lease.annual_installment
        ? Number(lease.annual_installment)
        : undefined,
      price_per_m2: lease.price_per_m2
        ? Number(lease.price_per_m2)
        : undefined,
      lease_period_years: lease.lease_period_years
        ? Number(lease.lease_period_years)
        : undefined,
      payment_term_years: lease.payment_term_years
        ? Number(lease.payment_term_years)
        : undefined,
      // assume backend sends ISO YYYY-MM-DD
      contract_date: lease.contract_date
        ? new Date(lease.contract_date)
        : undefined,
      start_date: lease.start_date ? new Date(lease.start_date) : undefined,
      expiry_date: lease.expiry_date ? new Date(lease.expiry_date) : undefined,
      legal_framework: lease.legal_framework || undefined,
    });
    setError(null);
  }, [open, lease]);

  const toLocalDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSaving(true);

      // Convert Date fields to strings for validation + API
      const apiData: Partial<EditLeaseFormData> = {
        ...form,
        contract_date:
          form.contract_date instanceof Date
            ? toLocalDateString(form.contract_date)
            : undefined,
        start_date:
          form.start_date instanceof Date
            ? toLocalDateString(form.start_date)
            : undefined,
        expiry_date:
          form.expiry_date instanceof Date
            ? toLocalDateString(form.expiry_date)
            : undefined,
      };

      const filteredData = Object.fromEntries(
        Object.entries(apiData).filter(([, v]) => v !== undefined)
      );

      const parsed = EditLeaseFormSchema.parse(
        filteredData
      ) as EditLeaseFormData;

      await updateLeaseApi(lease.lease_id, parsed);
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Lease Agreement
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-600">Lease ID: {lease.lease_id}</p>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {isEthiopian ? "ዓ/ም" : "GC"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
            <div className="text-red-500 mt-0.5">⚠</div>
            <div>{error}</div>
          </div>
        )}

        <div className="space-y-8">
          {/* Financial Information */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Financial Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Annual Lease Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Lease Fee (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.annual_lease_fee ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      annual_lease_fee: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Total Lease Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Lease Amount (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.total_lease_amount ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      total_lease_amount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Down Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Down Payment Amount (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.down_payment_amount ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      down_payment_amount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Annual Installment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Installment (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.annual_installment ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      annual_installment: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Price per m² */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per m² (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price_per_m2 ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price_per_m2: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Period Information */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Period Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lease Period Years */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lease Period (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.lease_period_years ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      lease_period_years: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 25"
                />
              </div>

              {/* Payment Term Years */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Term (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.payment_term_years ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      payment_term_years: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Date Information
                </h3>
                <p className="text-sm text-gray-500">
                  Dates in {isEthiopian ? "Ethiopian" : "Gregorian"} calendar
                  {isEthiopian && " (hover for Gregorian equivalent)"}
                  {!isEthiopian && " (hover for Ethiopian equivalent)"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contract Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Date
                </label>
                <UniversalDateInput
                  value={form.contract_date ?? null}
                  onChange={(date) =>
                    setForm((f) => ({
                      ...f,
                      contract_date: date ?? undefined,
                    }))
                  }
                  placeholder="Select contract date"
                  size="sm"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <UniversalDateInput
                  value={form.start_date ?? null}
                  onChange={(date) =>
                    setForm((f) => ({
                      ...f,
                      start_date: date ?? undefined,
                    }))
                  }
                  placeholder="Select start date"
                  size="sm"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <UniversalDateInput
                  value={form.expiry_date ?? null}
                  onChange={(date) =>
                    setForm((f) => ({
                      ...f,
                      expiry_date: date ?? undefined,
                    }))
                  }
                  placeholder="Select expiry date"
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Legal Information */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Legal Information
              </h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Proclamation No. 123/2021"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLeaseModal;
