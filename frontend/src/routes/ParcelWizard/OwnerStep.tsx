// OwnerStep.tsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createOwner } from "../../services/parcelApi";
import type { OwnerStepProps } from "../../types/wizard";

const OwnerStep = ({ nextStep, prevStep, onCreated }: OwnerStepProps) => {
  const [searchParams] = useSearchParams();

  const upin = searchParams.get("upin") || "";
  const subCity = searchParams.get("sub_city") || "";

  // Default to today in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    full_name: "",
    national_id: "",
    tin_number: "",
    phone_number: "",
    share_ratio: 1.0,
    acquired_at: today, // default to today
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Include upin from URL params in the request
      const payload = {
        ...formData,
        upin, // ← Critical: send upin to backend
      };

      const res = await createOwner(payload);

      if (res.success) {
        const { owner_id } = res.data;
        onCreated({ owner_id });
        // Navigation to next step is handled in ParcelWizard via goToStep()
      } else {
        setError(res.message || "Failed to create owner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create owner");
    } finally {
      setLoading(false);
    }
  };

  // Safety check — though should never happen due to wizard flow
  if (!upin) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-red-600 mb-4">Missing Parcel Information</p>
        <p className="text-gray-600 mb-6">Please complete the Parcel step first.</p>
        <button
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Register Owner</h2>
      <p className="text-gray-600 mb-8">
        Owner for <span className="font-semibold text-blue-600">{upin}</span> ({subCity})
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
          <input
            required
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="e.g. John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">National ID *</label>
          <input
            required
            type="text"
            value={formData.national_id}
            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
          <input
            required
            type="tel"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="+251911223344"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">TIN Number</label>
          <input
            type="text"
            value={formData.tin_number}
            onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Acquired At *</label>
          <input
            required
            type="date"
            value={formData.acquired_at}
            max={today} // Prevent future dates
            onChange={(e) => setFormData({ ...formData, acquired_at: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Share Ratio *</label>
          <input
            required
            type="number"
            min="0.01"
            max="1"
            step="0.01"
            value={formData.share_ratio}
            onChange={(e) => setFormData({ ...formData, share_ratio: parseFloat(e.target.value) || 1.0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">e.g. 1.0 = full ownership, 0.5 = 50%</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">UPIN (Auto-filled)</label>
          <input
            type="text"
            value={upin}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-mono"
          />
        </div>

        {error && (
          <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            {error}
          </div>
        )}

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
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {loading ? "Creating Owner..." : "Create Owner & Next"}
          </button>
        </div>
      </form>
    </>
  );
};

export default OwnerStep;