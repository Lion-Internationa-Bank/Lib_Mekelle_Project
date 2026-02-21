// src/components/parcelDetail/cards/TransferHistoryCard.tsx
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import DocumentList from "../DocumentList";

interface TransferHistoryCardProps {
  entry: ParcelDetail["history"][number];
  upin: string;
  onReload: () => Promise<void>;
}

const TransferHistoryCard = ({ entry }: TransferHistoryCardProps) => {
  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "-";

  // FIXED: Properly handle transfer_price as string | null
  const formatPrice = (price: string | null) => {
    if (price === null || price === "" || price === "0") return "-";

    // Convert string to number safely
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price; // fallback if somehow not numeric

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  return (
    <div className="bg-white border border-[#f0cd6e] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#f0cd6e]/10 to-[#2a2718]/10 px-6 py-4 border-b border-[#f0cd6e]">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-[#2a2718]">
              {entry.transfer_type.replace("_", " ")} Transfer
            </h3>
            <p className="text-sm text-[#2a2718]/70 mt-1">
              Date: <span className="font-medium">{formatDate(entry.transfer_date)}</span>
              {entry.reference_no && (
                <> • Ref: <span className="font-mono">{entry.reference_no}</span></>
              )}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#f0cd6e]">
              {formatPrice(entry.transfer_price)}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <dt className="text-sm font-medium text-[#2a2718]/70">From Owner</dt>
            <dd className="mt-1 text-[#2a2718]">
              {entry.from_owner_name ? (
                <span className="font-medium">{entry.from_owner_name }</span>
              ) : (
                <span className="italic text-[#2a2718]/50">Original/Old Possession</span>
              )}
            </dd>
          </div>

          <div className="text-center flex items-center justify-center">
            <div className="px-4">
              <div className="w-12 h-12 rounded-full bg-[#f0cd6e]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#2a2718]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <dt className="text-sm font-medium text-[#2a2718]/70">To Owner</dt>
            <dd className="mt-1 text-[#2a2718] font-medium">
              {entry.to_owner_name ? (
                <span>{entry.to_owner_name}</span>
              ) : (
                <span className="italic text-[#2a2718]/50">Unknown</span>
              )}
            </dd>
          </div>
        </div>

        {/* Documents */}
        {entry.documents.length > 0 && (
          <div className="pt-5 border-t border-[#f0cd6e]">
            <DocumentList
              documents={entry.documents}
              title="Transfer Documents"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferHistoryCard;