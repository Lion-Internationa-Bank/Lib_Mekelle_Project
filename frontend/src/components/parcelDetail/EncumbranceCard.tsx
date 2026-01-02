// components/parcelDetail/EncumbranceCard.tsx
import type { ParcelDetail } from "../../services/parcelDetailApi";
import DocumentList from "./DocumentList";

interface EncumbranceCardProps {
  encumbrance?: ParcelDetail["encumbrances"][number]; // optional for "add new"
  onEdit?: () => void;
  onAddNew?: () => void; // new prop for adding
  isNew?: boolean; // flag to indicate this is the "add new" placeholder
}

const EncumbranceCard = ({ encumbrance, onEdit, onAddNew, isNew = false }: EncumbranceCardProps) => {
  if (isNew) {
    return (
      <div className="bg-white/80 border border-dashed border-gray-300 rounded-2xl p-8 text-center">
        <p className="text-gray-500 mb-4">No encumbrances recorded yet.</p>
        <button
          onClick={onAddNew}
          className="px-6 py-3 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
        >
          + Add New Encumbrance
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header with Edit Button */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {encumbrance!.type} ({encumbrance!.status})
        </h3>
        <button
          onClick={onEdit}
          className="px-5 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
        >
          Edit Encumbrance
        </button>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-600">Issuing Entity</dt>
            <dd className="mt-1 text-gray-900">{encumbrance!.issuing_entity}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">Reference Number</dt>
            <dd className="mt-1 text-gray-900">{encumbrance!.reference_number || "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">Registration Date</dt>
            <dd className="mt-1 text-gray-900">
              {encumbrance!.registration_date
                ? new Date(encumbrance!.registration_date).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                  encumbrance!.status === "ACTIVE"
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {encumbrance!.status}
              </span>
            </dd>
          </div>
        </dl>

        {/* Documents */}
        <div className="pt-4 border-t border-gray-200">
          <DocumentList
            documents={encumbrance!.documents}
            title="Encumbrance Documents"
          />
        </div>
      </div>
    </div>
  );
};

export default EncumbranceCard;