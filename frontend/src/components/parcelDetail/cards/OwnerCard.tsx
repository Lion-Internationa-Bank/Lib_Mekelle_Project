// src/components/parcelDetail/OwnerCard.tsx
import { useState } from "react";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import DocumentList from "../DocumentList";

interface OwnerCardProps {
  ownerRelation: ParcelDetail["owners"][number];
  onEditOwner: () => void;
  onEditShare: () => void;
  onTransfer: () => void;
}

const OwnerCard = ({
  ownerRelation,
  onEditOwner,
  onEditShare,
  onTransfer,
}: OwnerCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Safety guard (should never happen with proper filtering upstream)
  if (!ownerRelation || !ownerRelation.owner) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
        Invalid owner data
      </div>
    );
  }

  const { owner, share_ratio } = ownerRelation;
  const sharePercent = (Number(share_ratio) * 100).toFixed(2);

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* 3-dot menu */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Owner actions menu"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <>
            {/* Backdrop to close menu when clicking outside */}
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-30 overflow-hidden">
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
                  onEditShare();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Edit Share Ratio
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

      {/* Card Content */}
      <div className="p-8 pt-14">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Owner Details */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{owner.full_name}</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">National ID:</span>{" "}
                <span className="font-mono">{owner.national_id || "—"}</span>
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                <span className="font-mono">{owner.phone_number || "—"}</span>
              </p>
              <p>
                <span className="font-medium">TIN:</span>{" "}
                <span className="font-mono">{owner.tin_number || "—"}</span>
              </p>
            </div>

            {/* Share Highlight */}
            <div className="mt-6 inline-flex items-center gap-3 bg-blue-50 px-5 py-3 rounded-xl">
              <span className="text-2xl font-bold text-blue-700">{sharePercent}%</span>
              <span className="text-sm font-medium text-blue-900">Ownership Share</span>
            </div>
          </div>

          {/* Owner Documents */}
          <div className="lg:w-96">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Owner Documents</h4>
            <div className="bg-gray-50 rounded-xl p-4 min-h-[120px]">
              <DocumentList
                documents={owner.documents || []}
                // emptyMessage="No documents uploaded for this owner"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerCard;