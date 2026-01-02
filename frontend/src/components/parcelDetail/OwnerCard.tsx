// components/OwnerCard.tsx
import type { ParcelDetail } from "../../services/parcelDetailApi";
import DocumentList from "./DocumentList";

interface OwnerCardProps {
  ownerRelation: ParcelDetail["owners"][number];
  onEditOwner: () => void;
  onEditShare: () => void;
}

const OwnerCard = ({ ownerRelation, onEditOwner, onEditShare }: OwnerCardProps) => {
  const { owner, share_ratio } = ownerRelation;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-xl p-4">
      <div>
        <div className="font-semibold text-gray-900">{owner.full_name}</div>
        <div className="text-xs text-gray-500">National ID: {owner.national_id || "-"}</div>
        <div className="text-xs text-gray-500">Phone: {owner.phone_number || "-"}</div>
        <div className="text-xs text-gray-500">TIN No: {owner.tin_number || "-"}</div>
        <div className="text-xs text-gray-500">Share: {Number(share_ratio) * 100}%</div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={onEditOwner}
            className="px-5 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
          >
            Edit owner
          </button>
          <button
            onClick={onEditShare}
           className="px-5 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
          >
            Edit share
          </button>
        </div>
      </div>
      <div className="md:w-72">
        <DocumentList documents={owner.documents} title="Owner Documents" />
      </div>
    </div>
  );
};

export default OwnerCard;