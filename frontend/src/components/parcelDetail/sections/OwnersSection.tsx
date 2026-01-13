// src/components/parcelDetail/sections/OwnersSection.tsx
import { useState } from "react";
import OwnerCard from "../cards/OwnerCard";
import EditOwnerModal from "../modals/EditOwnerModal";
import TransferOwnershipModal from "../modals/TransferOwnershipModal";
import GenericDocsUpload from "../../GenericDocsUpload";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Props = {
  parcel: ParcelDetail;
  onReload: () => Promise<void>;
};

const OwnersSection = ({ parcel, onReload }: Props) => {
  const [editingOwner, setEditingOwner] = useState<ParcelDetail["owners"][number] | null>(null);
  const [transferFrom, setTransferFrom] = useState<ParcelDetail["owners"][number] | null>(null);
  const [showUploadStep, setShowUploadStep] = useState(false);
  const [latestTransferHistoryId, setLatestTransferHistoryId] = useState<string | null>(null);

  const handleTransferSuccess = async (historyId: string) => {
    setLatestTransferHistoryId(historyId);
    setTransferFrom(null);
    setShowUploadStep(true);
    await onReload();
  };

  const handleUploadComplete = async () => {
    setShowUploadStep(false);
    setLatestTransferHistoryId(null);
    await onReload();
  };

  const handleSkipUpload = () => {
    setShowUploadStep(false);
    setLatestTransferHistoryId(null);
    // Optional: still refresh data even when skipping
    onReload();
  };

  return (
    <>
      {/* Owners List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Current Owners</h2>
          <span className="text-sm text-gray-500">
            {parcel.owners.length} owner{parcel.owners.length !== 1 ? "s" : ""}
          </span>
        </div>

        {parcel.owners.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-2">No owners registered for this parcel yet</p>
            <p className="text-sm text-gray-400">
              Use the transfer function to add the first owner
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {parcel.owners
              .filter((po): po is NonNullable<typeof po> => !!po?.owner)
              .map((po) => (
                <OwnerCard
                  key={po.parcel_owner_id}
                  ownerRelation={po}
                  onEditOwner={() => setEditingOwner(po)}
                  onTransfer={() => setTransferFrom(po)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {editingOwner && (
        <EditOwnerModal
          owner={editingOwner.owner}
          open={true}
          onClose={() => setEditingOwner(null)}
          onSuccess={onReload}
        />
      )}

     {transferFrom && (
  <TransferOwnershipModal
    isOpen={!!transferFrom}
    onClose={() => setTransferFrom(null)}
    parcelUpin={parcel.upin}
    currentOwners={parcel.owners
      .filter(o => o?.owner)
      .map(o => ({
        owner_id: o.owner.owner_id,
        full_name: o.owner.full_name,
      }))}
    onRefreshParcel={onReload}           // ← this refreshes parcel data
    onSuccess={(historyId) => {
      // Optional: do something with historyId right after transfer
      console.log("Transfer history created:", historyId);
    }}
  />
)}

      {/* Document Upload Step after successful transfer */}
      {showUploadStep && latestTransferHistoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Transfer Completed ✓
                  </h2>
                  <p className="text-gray-600">
                    Please upload supporting documents for{" "}
                    <span className="font-mono font-bold text-blue-600">{parcel.upin}</span>
                  </p>
                </div>
                <span className="inline-block px-4 py-1.5 text-sm font-semibold bg-emerald-100 text-emerald-800 rounded-full whitespace-nowrap">
                  Step 2 of 2
                </span>
              </div>
            </div>

            {/* Upload Area */}
            <div className="p-6 md:p-8">
              <GenericDocsUpload
              title="Land transfer supporting docs"
                upin={parcel.upin}
                subCity={parcel.sub_city?.name || "—"}
                historyId={latestTransferHistoryId}
                hideTitle={true}
                allowedDocTypes={[
                  { value: "TRANSFER_CONTRACT", label: "Transfer Contract / Agreement" },
                  { value: "ID_COPY", label: "ID Copies (Buyer & Seller)" },
                  { value: "PAYMENT_PROOF", label: "Payment Receipt" },
                  { value: "POWER_OF_ATTORNEY", label: "Power of Attorney (if applicable)" },
                  { value: "OTHER", label: "Other Supporting Document" },
                ]}
              />
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={handleSkipUpload}
                className="text-sm text-gray-600 hover:text-gray-900 underline transition"
              >
                Skip for now
              </button>

              <button
                onClick={handleUploadComplete}
                className="w-full sm:w-auto px-10 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Done – Close
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnersSection;