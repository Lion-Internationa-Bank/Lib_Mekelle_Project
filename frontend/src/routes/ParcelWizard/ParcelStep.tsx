// ParcelStep.tsx
import { useState } from "react";
import type { ParcelStepProps } from "../../types/wizard";
import { createParcel } from "../../services/parcelApi";

interface ParcelFormData {
  upin: string;
  file_number: string;
  sub_city: string;
  tabia: string;
  ketena: string;
  block: string;
  total_area_m2: number;
  land_use: string;
  land_grade: string;
  tenure_type: string;
  geometry_data?: string;
}

const ParcelStep = ({ nextStep, onCreated }: ParcelStepProps) => {
  const [formData, setFormData] = useState<ParcelFormData>({
    upin: "",
    file_number: "",
    sub_city: "",
    tabia: "",
    ketena: "",
    block: "",
    total_area_m2: 0,
    land_use: "",
    land_grade: "",
    tenure_type: "",
    geometry_data: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await createParcel(formData);
      if (res.success) {
        const { upin, sub_city } = res.data;
        console.log("from response upin", upin, "sub_city", sub_city);
        onCreated({ upin, sub_city });
      } else {
        setError(res.message || "Failed to create parcel");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create parcel");
    } finally {
      setLoading(false);
    }
  };

  const fillExampleGeometry = () => {
    const example = {
      type: "Polygon",
      coordinates: [
        [
          [38.7570, 9.0300],
          [38.7590, 9.0300],
          [38.7590, 9.0320],
          [38.7570, 9.0320],
          [38.7570, 9.0300],
        ],
      ],
    };
    setFormData({ ...formData, geometry_data: JSON.stringify(example, null, 2) });
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Register Land Parcel</h2>
      <p className="text-gray-600 mb-8">Fill in all required fields to register a new parcel</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Row 1 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">UPIN *</label>
          <input
            required
            value={formData.upin}
            onChange={(e) => setFormData({ ...formData, upin: e.target.value.toUpperCase() })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
            placeholder="e.g. MANC-2347"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">File Number *</label>
          <input
            required
            value={formData.file_number}
            onChange={(e) => setFormData({ ...formData, file_number: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. FIL-2026-001"
          />
        </div>

        {/* Row 2 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sub City *</label>
          <select
            required
            value={formData.sub_city}
            onChange={(e) => setFormData({ ...formData, sub_city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Sub City</option>
            <option>Adi Haki</option>
            <option>Kijite Kasaba</option>
            <option>Lahaya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ketena *</label>
          <input
            required
            value={formData.ketena}
            onChange={(e) => setFormData({ ...formData, ketena: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Ketena 01"
          />
        </div>

        {/* Row 3 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tabia *</label>
          <input
            required
            value={formData.tabia}
            onChange={(e) => setFormData({ ...formData, tabia: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Tabia 05"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Block *</label>
          <input
            required
            value={formData.block}
            onChange={(e) => setFormData({ ...formData, block: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Block A"
          />
        </div>

        {/* Row 4 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Total Area (m²) *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={formData.total_area_m2 || ""}
            onChange={(e) => setFormData({ ...formData, total_area_m2: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Land Use *</label>
          <select
            required
            value={formData.land_use}
            onChange={(e) => setFormData({ ...formData, land_use: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Land Use</option>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Industrial</option>
            <option>Agricultural</option>
            <option>Mixed</option>
          </select>
        </div>

        {/* Row 5 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Land Grade *</label>
          <select
            required
            value={formData.land_grade}
            onChange={(e) => setFormData({ ...formData, land_grade: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Grade</option>
            <option>Grade 1</option>
            <option>Grade 2</option>
            <option>Grade 3</option>
            <option>Grade 4</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tenure Type *</label>
          <select
            required
            value={formData.tenure_type}
            onChange={(e) => setFormData({ ...formData, tenure_type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Tenure Type</option>
            <option>LEASE</option>
            <option>OLD_POSSESSION</option>
          </select>
        </div>

        {/* Geometry Data - User Friendly */}
        <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-lg font-semibold text-gray-800">
              Parcel Boundary (Optional)
            </label>
            <span className="text-sm text-blue-700 bg-white px-3 py-1 rounded-full border border-blue-300">
              Advanced Feature
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Paste GeoJSON to display this parcel on a map. You can skip this and add it later.
          </p>

          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={fillExampleGeometry}
              className="px-5 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              📍 Use Example Rectangle
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, geometry_data: "" })}
              className="px-5 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              🗑️ Clear
            </button>
          </div>

          <textarea
            value={formData.geometry_data || ""}
            onChange={(e) => setFormData({ ...formData, geometry_data: e.target.value })}
            rows={10}
            className="w-full px-5 py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 font-mono text-sm resize-vertical bg-white shadow-inner"
            placeholder="Paste valid GeoJSON here...\n\nTip: Draw on https://geojson.io → Copy → Paste here"
          />

          <div className="mt-4 flex items-start gap-3 text-sm text-blue-700">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>Pro tip:</strong> Go to{" "}
              <a
                href="https://geojson.io"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900 font-medium"
              >
                geojson.io
              </a>
              {" → draw your parcel → copy the GeoJSON → paste above."}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="md:col-span-2 p-5 bg-red-50 border border-red-200 rounded-xl text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Submit */}
        <div className="md:col-span-2 flex justify-end mt-8">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg flex items-center gap-3"
          >
            {loading ? (
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