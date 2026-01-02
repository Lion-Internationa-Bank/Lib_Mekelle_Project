// src/components/parcelDetail/sections/OwnersSection.tsx
import { useState } from "react";
import OwnerCard from "../cards/OwnerCard";
import EditOwnerModal from "../modals/EditOwnerModal";
import EditShareModal from "../modals/EditShareModal";
import TransferOwnershipModal from "../modals/TransferOwnershipModal";
import GenericDocsUpload from "../../GenericDocsUpload"; // We'll override its UI here
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Props = {
  parcel: ParcelDetail;
  onReload: () => Promise<void>;
};

const OwnersSection = ({ parcel, onReload }: Props) => {
  const [editingOwner, setEditingOwner] = useState<ParcelDetail["owners"][number] | null>(null);
  const [editingShare, setEditingShare] = useState<{ id: string; share: string } | null>(null);
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
  };

  return (
    <>
      {/* Owners List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Owners</h2>

        {parcel.owners.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No owners registered for this parcel</p>
        ) : (
          <div className="space-y-6">
            {parcel.owners
              .filter((po): po is ParcelDetail["owners"][number] => !!po && !!po.owner)
              .map((po) => (
                <OwnerCard
                  key={po.parcel_owner_id}
                  ownerRelation={po}
                  onEditOwner={() => setEditingOwner(po)}
                  onEditShare={() =>
                    setEditingShare({
                      id: po.parcel_owner_id,
                      share: po.share_ratio.toString(),
                    })
                  }
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

      {editingShare && (
        <EditShareModal
          parcelOwnerId={editingShare.id}
          currentShare={editingShare.share}
          open={true}
          onClose={() => setEditingShare(null)}
          onSuccess={onReload}
        />
      )}

      {transferFrom && (
        <TransferOwnershipModal
          fromOwner={{
            ...transferFrom,
            share_ratio: Number(transferFrom.share_ratio),
          }}
          upin={parcel.upin}
          open={true}
          onClose={() => setTransferFrom(null)}
          onSuccess={handleTransferSuccess}
        />
      )}

      {/* === WIZARD STEP 2: Upload Transfer Documents === */}
      {showUploadStep && latestTransferHistoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Transfer Complete ✓
                  </h2>
                  <p className="text-gray-600">
                    Upload supporting documents for parcel{" "}
                    <span className="font-mono font-bold text-blue-600">{parcel.upin}</span>{" "}
                    <span className="text-gray-500">({parcel.sub_city})</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-4 py-2 text-sm font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    Step 2 of 2
                  </span>
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="p-8">
              {/* Reusing GenericDocsUpload but with custom UI */}
              <GenericDocsUpload
                title="" // We hide its default title
                upin={parcel.upin}
                subCity={parcel.sub_city}
                historyId={latestTransferHistoryId}
                allowedDocTypes={[
                  { value: "TRANSFER_CONTRACT", label: "Transfer Contract / Agreement" },
                  { value: "ID_COPY", label: "ID Copies (Buyer & Seller)" },
                  { value: "PAYMENT_PROOF", label: "Payment Receipt" },
                  { value: "POWER_OF_ATTORNEY", label: "Power of Attorney (if applicable)" },
                  { value: "OTHER", label: "Other Supporting Document" },
                ]}
                onUploaded={handleUploadComplete}
              />
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <button
                onClick={handleSkipUpload}
                className="text-sm text-gray-600 hover:text-gray-900 underline transition"
              >
                Skip for now
              </button>

              <button
                onClick={handleUploadComplete}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
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