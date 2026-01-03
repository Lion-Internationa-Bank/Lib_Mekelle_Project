// LeaseStep.tsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createLease } from "../../services/parcelApi";
import type { LeaseStepProps } from "../../types/wizard";

const LeaseStep = ({ nextStep, prevStep, onCreated }: LeaseStepProps) => {
  const [searchParams] = useSearchParams();
  const upin = searchParams.get("upin") || "";

  // Default today for contract_date
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Safety guard
  if (!upin) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-red-600 mb-4">Missing Parcel Information</p>
        <p className="text-gray-600 mb-6">Please register a parcel first.</p>
        <button onClick={prevStep} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium">
          ← Go Back
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        upin, // ← Sent to backend, even though not editable
      };

      const res = await createLease(payload);

      if (res.success) {
        const { lease_id } = res.data;
        onCreated({ lease_id });
        // Navigation handled by ParcelWizard
      } else {
        setError(res.message || "Failed to create lease");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create lease");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Register Lease Agreement</h2>
      <p className="text-gray-600 mb-8">
        Lease details for <span className="font-semibold text-purple-600">{upin}</span>
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Price per m² (ETB) *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={formData.price_per_m2}
            onChange={(e) => setFormData({ ...formData, price_per_m2: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Total Lease Amount (ETB) *</label>
          <input
            required
            type="number"
            min="0"
            value={formData.total_lease_amount}
            onChange={(e) => setFormData({ ...formData, total_lease_amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Row 2 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Down Payment Amount (ETB)</label>
          <input
            type="number"
            min="0"
            value={formData.down_payment_amount}
            onChange={(e) => setFormData({ ...formData, down_payment_amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Installment (ETB)</label>
          <input
            type="number"
            min="0"
            value={formData.annual_installment}
            onChange={(e) => setFormData({ ...formData, annual_installment: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Row 3 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Lease Fee (ETB)</label>
          <input
            type="number"
            min="0"
            value={formData.annual_lease_fee}
            onChange={(e) => setFormData({ ...formData, annual_lease_fee: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Lease Period (Years) *</label>
          <input
            required
            type="number"
            min="1"
            value={formData.lease_period_years}
            onChange={(e) => setFormData({ ...formData, lease_period_years: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Row 4 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Term (Years) *</label>
          <input
            required
            type="number"
            min="1"
            value={formData.payment_term_years}
            onChange={(e) => setFormData({ ...formData, payment_term_years: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contract Date *</label>
          <input
            required
            type="date"
            value={formData.contract_date}
            max={today}
            onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Row 5 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={formData.start_date}
            min={formData.contract_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
          <input
            type="date"
            value={formData.expiry_date}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Row 6 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Legal Framework</label>
          <textarea
            value={formData.legal_framework}
            onChange={(e) => setFormData({ ...formData, legal_framework: e.target.value })}
            rows={3}
            placeholder="e.g. Proclamation No. 721/2011, Urban Lands Lease Holding Proclamation"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            {error}
          </div>
        )}

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
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {loading ? "Creating Lease..." : "Create Lease & Next"}
          </button>
        </div>
      </form>
    </>
  );
};

export default LeaseStep;