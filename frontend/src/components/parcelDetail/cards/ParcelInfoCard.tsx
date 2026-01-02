// components/parcelDetail/ParcelInfoCard.tsx
import type { ParcelDetail } from "../../../services/parcelDetailApi";

interface ParcelInfoCardProps {
  data: ParcelDetail;
  onEdit: () => void; // ← New prop to trigger edit modal
}

const ParcelInfoCard = ({ data, onEdit }: ParcelInfoCardProps) => {
  return (
    <div className="bg-white/80 border border-gray-200 rounded-2xl p-6 relative">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Parcel Information</h3>
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
        >
          Edit Parcel
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Basic Info
          </h4>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-600">UPIN</dt>
              <dd className="mt-1 font-mono text-lg text-gray-900">{data.upin || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">File Number</dt>
              <dd className="mt-1 text-gray-900">{data.file_number || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Area</dt>
              <dd className="mt-1 text-gray-900">
                {Number(data.total_area_m2).toLocaleString()} m²
              </dd>
            </div>
          </dl>
        </div>

        {/* Right Column */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Location & Tenure
          </h4>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <dt className="font-medium text-gray-600">Sub City</dt>
              <dd className="mt-1 text-gray-900">{data.sub_city || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Ketena</dt>
              <dd className="mt-1 text-gray-900">{data.ketena || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Tabia</dt>
              <dd className="mt-1 text-gray-900">{data.tabia || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Block</dt>
              <dd className="mt-1 text-gray-900">{data.block || "-"}</dd>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <dt className="font-medium text-gray-600">Land Use</dt>
              <dd className="mt-1 text-gray-900">{data.land_use || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Tenure Type</dt>
              <dd className="mt-1 text-gray-900">{data.tenure_type || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Land Grade</dt>
              <dd className="mt-1 text-gray-900">{data.land_grade || "-"}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelInfoCard;