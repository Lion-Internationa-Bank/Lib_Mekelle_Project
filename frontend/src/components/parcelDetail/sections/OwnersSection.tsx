// src/components/parcelDetail/sections/OwnersSection.tsx
import { useState } from "react";
import OwnerCard from "../cards/OwnerCard";
import EditOwnerModal from "../modals/EditOwnerModal";
import TransferOwnershipModal from "../modals/TransferOwnershipModal";
import GenericDocsUpload from "../../common/GenericDocsUpload";
import { CreateOwnerModal, OwnerDocsUploadModal } from "../../ownership/OwnershipModals";
import { createOwner } from "../../../services/parcelApi";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Props = {
  parcel: ParcelDetail;
  onReload: () => Promise<void>;
};

const OwnersSection = ({ parcel, onReload }: Props) => {
  const [editingOwner, setEditingOwner] =
    useState<ParcelDetail["owners"][number] | null>(null);
  const [transferFrom, setTransferFrom] =
    useState<ParcelDetail["owners"][number] | null>(null);

  const [showUploadStep, setShowUploadStep] = useState(false);
  const [latestTransferHistoryId, setLatestTransferHistoryId] =
    useState<string | null>(null);

  // New owner creation state (for parcel with no owners)
  const [showCreateOwner, setShowCreateOwner] = useState(false);
  const [showOwnerDocsUpload, setShowOwnerDocsUpload] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  const [savingNewOwner, setSavingNewOwner] = useState(false);
  const [newOwnerForm, setNewOwnerForm] = useState({
    full_name: "",
    national_id: "",
    tin_number: "",
    phone_number: "",
  });

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
    onReload();
  };

  // When there are no owners, “Add Owner” button
  const handleOpenAddOwner = () => {
    setShowCreateOwner(true);
  };

  const handleSaveNewOwner = async () => {
    if (!newOwnerForm.full_name || !newOwnerForm.national_id) {
      alert("Full name and National ID are required");
      return;
    }

    try {
      setSavingNewOwner(true);

      const payload = {
        ...newOwnerForm,
        upin: parcel.upin,
        acquired_at: new Date().toISOString(),
      };

      const response = await createOwner(payload);
      const ownerId = response.data.owner_id; // adjust if your API is different

      setNewOwnerId(ownerId);
      setShowCreateOwner(false);
      setShowOwnerDocsUpload(true);

      // Clear form for next time
      setNewOwnerForm({
        full_name: "",
        national_id: "",
        tin_number: "",
        phone_number: "",
      });

      await onReload();
    } catch (err: any) {
      console.error(err);
      alert("Failed to create owner: " + (err.message || "Unknown error"));
    } finally {
      setSavingNewOwner(false);
    }
  };

  return (
    <>
      {/* Owners List */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#f0cd6e] p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#2a2718]">Current Owners</h2>
          <span className="text-sm text-[#2a2718]/70">
            {parcel.owners.length} owner{parcel.owners.length !== 1 ? "s" : ""}
          </span>
        </div>

        {parcel.owners.length === 0 ? (
          <div className="text-center py-12 bg-[#f0cd6e]/5 rounded-xl border border-dashed border-[#f0cd6e]">
            <p className="text-[#2a2718] mb-2">
              No owners registered for this parcel yet
            </p>
            <p className="text-sm text-[#2a2718]/70 mb-6">
              Add the first owner and attach supporting documents.
            </p>
            <button
              onClick={handleOpenAddOwner}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white text-sm font-medium shadow-sm"
            >
              + Add Owner
            </button>
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

      {/* Edit owner info */}
      {editingOwner && (
        <EditOwnerModal
          owner={editingOwner.owner}
          open={true}
          onClose={() => setEditingOwner(null)}
          onSuccess={onReload}
        />
      )}

      {/* Transfer ownership */}
      {transferFrom && (
        <TransferOwnershipModal
          isOpen={!!transferFrom}
          onClose={() => setTransferFrom(null)}
          parcelUpin={parcel.upin}
          currentOwners={parcel.owners
            .filter((o) => o?.owner)
            .map((o) => ({
              owner_id: o.owner.owner_id,
              full_name: o.owner.full_name,
            }))}
          onRefreshParcel={onReload}
          onSuccess={handleTransferSuccess}
        />
      )}

      {/* Transfer docs upload */}
      {showUploadStep && latestTransferHistoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="p-8 border-b border-[#f0cd6e] bg-gradient-to-r from-[#f0cd6e]/10 to-[#2a2718]/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#2a2718] mb-2">
                    Transfer Completed ✓
                  </h2>
                  <p className="text-[#2a2718]/70">
                    Please upload supporting documents for{" "}
                    <span className="font-mono font-bold text-[#f0cd6e]">
                      {parcel.upin}
                    </span>
                  </p>
                </div>
                <span className="inline-block px-4 py-1.5 text-sm font-semibold bg-[#f0cd6e] text-[#2a2718] rounded-full whitespace-nowrap">
                  Step 2 of 2
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <GenericDocsUpload
                title="Land transfer supporting docs"
                upin={parcel.upin}
                subCity={parcel.sub_city?.name || "—"}
                historyId={latestTransferHistoryId}
                hideTitle={true}
                allowedDocTypes={[
                  {
                    value: "TRANSFER_CONTRACT",
                    label: "Transfer Contract / Agreement",
                  },
                  {
                    value: "ID_COPY",
                    label: "ID Copies (Buyer & Seller)",
                  },
                  { value: "PAYMENT_PROOF", label: "Payment Receipt" },
                  {
                    value: "POWER_OF_ATTORNEY",
                    label: "Power of Attorney (if applicable)",
                  },
                  { value: "OTHER", label: "Other Supporting Document" },
                ]}
              />
            </div>

            <div className="p-6 md:p-8 border-t border-[#f0cd6e] bg-[#f0cd6e]/5 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={handleSkipUpload}
                className="text-sm text-[#2a2718] hover:text-[#2a2718]/80 underline transition"
              >
                Skip for now
              </button>

              <button
                onClick={handleUploadComplete}
                className="w-full sm:w-auto px-10 py-3 rounded-xl bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white font-semibold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Done – Close
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create new owner (when no owners) */}
      {showCreateOwner && (
        <CreateOwnerModal
          saving={savingNewOwner}
          form={newOwnerForm}
          onChangeForm={setNewOwnerForm}
          onClose={() => setShowCreateOwner(false)}
          onSave={handleSaveNewOwner}
        />
      )}

      {/* Owner docs upload after first owner creation */}
      {showOwnerDocsUpload && newOwnerId && (
        <OwnerDocsUploadModal
          ownerId={newOwnerId}
          onClose={() => {
            setShowOwnerDocsUpload(false);
            setNewOwnerId(null);
          }}
          onRefresh={onReload}
        />
      )}
    </>
  );
};

export default OwnersSection;