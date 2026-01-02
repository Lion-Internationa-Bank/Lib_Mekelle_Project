// src/modals/EditLeaseModal.tsx
import { useEffect, useState } from "react";
import  { type ParcelDetail ,updateLeaseApi} from "../../../services/parcelDetailApi";

type Lease = NonNullable<ParcelDetail["lease_agreement"]>;

type Props = {
  lease: Lease;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

const EditLeaseModal = ({ lease, open, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && lease) {
      setForm({
        annual_lease_fee: lease.annual_lease_fee?.toString() || "",
        total_lease_amount: lease.total_lease_amount?.toString() || "",
        down_payment_amount: lease.down_payment_amount?.toString() || "",
        annual_installment: lease.annual_installment?.toString() || "",
        price_per_m2: lease.price_per_m2?.toString() || "",
        lease_period_years: lease.lease_period_years?.toString() || "",
        payment_term_years: lease.payment_term_years?.toString() || "",
        start_date: lease.start_date?.slice(0, 10) || "",
        expiry_date: lease.expiry_date?.slice(0, 10) || "",
        legal_framework: lease.legal_framework || "",
      });
    }
  }, [open, lease]);

  const handleSave = async () => {
    try {
      const formatted = {
        ...form,
        annual_lease_fee: form.annual_lease_fee ? Number(form.annual_lease_fee) : undefined,
        total_lease_amount: form.total_lease_amount ? Number(form.total_lease_amount) : undefined,
        down_payment_amount: form.down_payment_amount ? Number(form.down_payment_amount) : undefined,
        annual_installment: form.annual_installment ? Number(form.annual_installment) : undefined,
        price_per_m2: form.price_per_m2 ? Number(form.price_per_m2) : undefined,
        lease_period_years: form.lease_period_years ? Number(form.lease_period_years) : undefined,
        payment_term_years: form.payment_term_years ? Number(form.payment_term_years) : undefined,
      };

      await updateLeaseApi(lease.lease_id, formatted);
      await onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to update lease");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full my-8">
        <h2 className="text-2xl font-bold mb-6">Edit Lease Agreement</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(form).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                {key.replace(/_/g, " ")}
              </label>
              <input
                type={
                  key.includes("date")
                    ? "date"
                    : key.includes("amount") ||
                      key.includes("price") ||
                      key.includes("period") ||
                      key.includes("payment_term") ||
                      key.includes("fee") ||
                      key.includes("installment")
                    ? "number"
                    : "text"
                }
                step={key.includes("price") || key.includes("fee") ? "0.01" : undefined}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLeaseModal;