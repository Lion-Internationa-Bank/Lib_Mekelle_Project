// src/components/parcelDetail/OwnerCard.tsx
import { useState } from "react";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import DocumentList from "../DocumentList";

interface OwnerCardProps {
  ownerRelation: ParcelDetail["owners"][number];
  onEditOwner: () => void;
  onTransfer: () => void;
}

const OwnerCard = ({
  ownerRelation,
  onEditOwner,
  onTransfer,
}: OwnerCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!ownerRelation || !ownerRelation.owner) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
        Invalid owner data
      </div>
    );
  }

  const { owner } = ownerRelation;


  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* 3-dot menu */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Owner actions menu"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <button
                onClick={() => {
                  onEditOwner();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Owner Info
              </button>
              <button
                onClick={() => {
                  onTransfer();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-5 py-3 text-sm font-medium text-amber-700 hover:bg-amber-50 transition flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transfer Ownership
              </button>
            </div>
          </>
        )}
      </div>

      {/* Card Content - Better balanced layout */}
      <div className="p-8 pt-14 grid lg:grid-cols-[3fr_2fr] gap-10">
        {/* Left: Owner Details - More space */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">{owner.full_name}</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-medium text-gray-600">National ID:</span>{" "}
              <span className="font-mono">{owner.national_id || "—"}</span>
            </p>
            <p>
              <span className="font-medium text-gray-600">Phone:</span>{" "}
              <span className="font-mono">{owner.phone_number || "—"}</span>
            </p>
            <p>
              <span className="font-medium text-gray-600">TIN:</span>{" "}
              <span className="font-mono">{owner.tin_number || "—"}</span>
            </p>
          </div>
        </div>

        {/* Right: Owner Documents - Slightly shifted left, more compact */}
        <div className="lg:pl-6">
          <h4 className="text-base font-semibold text-gray-700 mb-4">Owner Documents</h4>
          <div className="bg-gray-50 rounded-xl p-5 min-h-[160px] border border-gray-200">
            <DocumentList documents={owner.documents || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerCard;