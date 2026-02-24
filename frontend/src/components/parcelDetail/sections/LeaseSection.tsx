// src/components/parcelDetail/sections/LeaseSection.tsx
import { useState } from "react";
import LeaseCard from "../cards/LeaseCard";
import EditLeaseModal from "../modals/EditLeaseModal";
import CreateLeaseModal from "../modals/CreateLeaseModal";
import GenericDocsUpload from "../../common/GenericDocsUpload";
import ApprovalRequestDocsModal from "../../common/ApprovalRequestDocsModal";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";

type Props = {
  parcel: ParcelDetail;
  lease: ParcelDetail["lease_agreement"] | null;
  onReload: () => Promise<void>;
};

const LeaseSection = ({ parcel, lease, onReload }: Props) => {
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const isSubcityNormal = user?.role === "SUBCITY_NORMAL";
  const [showCreateLease, setShowCreateLease] = useState(false);
  
  // State for immediate execution document upload
  const [showLeaseDocsUpload, setShowLeaseDocsUpload] = useState(false);
  const [createdLeaseId, setCreatedLeaseId] = useState<string | null>(null);
  
  // State for approval request document upload
  const [showApprovalDocsModal, setShowApprovalDocsModal] = useState(false);
  const [currentApprovalRequest, setCurrentApprovalRequest] = useState<{
    id: string;
    title: string;
    description: string;
    resultData?: any;
  } | null>(null);

  const handleCreateLeaseClick = () => {
    setShowCreateLease(true);
  };

  const handleLeaseCreated = async (result: any) => {
    console.log("Lease created result:", result);
    
    // Check if approval is required
    if (result?.approval_request_id) {
      setCurrentApprovalRequest({
        id: result.approval_request_id,
        title: "Upload Lease Documents",
        description: `Upload supporting documents for lease agreement on parcel ${parcel.upin}`,
        resultData: result
      });
      setShowApprovalDocsModal(true);
      toast.success(result.message || "Lease creation request submitted for approval");
    } 
    // If immediate execution (self-approval or no approval needed)
    else if (result?.lease_id) {
      setCreatedLeaseId(result.lease_id);
      setShowLeaseDocsUpload(true);
      toast.success(result.message || "Lease agreement created successfully");
    }
    
    await onReload();
  };

  const handleLeaseDocsDone = async () => {
    setShowLeaseDocsUpload(false);
    setCreatedLeaseId(null);
    await onReload();
  };

  const handleSkipUpload = async () => {
    setShowLeaseDocsUpload(false);
    setCreatedLeaseId(null);
    await onReload();
  };

  const handleApprovalDocsModalClose = () => {
    setShowApprovalDocsModal(false);
    setCurrentApprovalRequest(null);
    onReload();
  };

  const handleApprovalDocsComplete = () => {
    setShowApprovalDocsModal(false);
    setCurrentApprovalRequest(null);
    onReload();
  };

  const handleEditSuccess = async () => {
    await onReload();
    setEditing(false);
    toast.success("Lease agreement updated successfully");
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-[#f0cd6e] p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#2a2718]">
            Lease Agreement
          </h2>
          {lease && isSubcityNormal && (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2 text-sm font-medium text-[#f0cd6e] bg-white border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/20 hover:border-[#2a2718] transition-all shadow-sm"
            >
              Edit Lease
            </button>
          )}
        </div>

        {lease ? (
          <LeaseCard lease={lease} />
        ) : isSubcityNormal ? (
          <div className="text-center py-12 bg-[#f0cd6e]/5 rounded-xl border border-dashed border-[#f0cd6e]">
            <p className="text-[#2a2718] mb-2">
              No lease agreement recorded for this parcel yet
            </p>
            <p className="text-sm text-[#2a2718]/70 mb-6">
              Create a lease agreement and submit for approval.
              {user?.role === "SUBCITY_NORMAL" && (
                " Your request will be reviewed by a higher authority."
              )}
            </p>
            <button
              onClick={handleCreateLeaseClick}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white text-sm font-medium shadow-sm"
            >
              + Create Lease Agreement
            </button>
          </div>
        ) : null}
      </div>

      {/* Edit existing lease */}
      {lease && isSubcityNormal && (
        <EditLeaseModal
          lease={lease}
          open={editing}
          onClose={() => setEditing(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Create lease modal */}
      {isSubcityNormal && (
        <CreateLeaseModal
          parcel={parcel}
          open={showCreateLease}
          onClose={() => setShowCreateLease(false)}
          onCreated={handleLeaseCreated}
        />
      )}

      {/* Lease docs upload after immediate execution (no approval needed) */}
      {isSubcityNormal && showLeaseDocsUpload && createdLeaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="p-8 border-b border-[#f0cd6e] bg-gradient-to-r from-[#f0cd6e]/10 to-[#2a2718]/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#2a2718] mb-2">
                    Lease Created ✓
                  </h2>
                  <p className="text-[#2a2718]/70">
                    Upload supporting documents for{" "}
                    <span className="font-mono font-bold text-[#f0cd6e]">
                      {parcel.upin}
                    </span>
                  </p>
                </div>
                <span className="inline-block px-4 py-1.5 text-sm font-semibold bg-[#f0cd6e] text-[#2a2718] rounded-full whitespace-nowrap">
                  Optional Step
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <GenericDocsUpload
                title="Lease agreement documents"
                upin={parcel.upin}
                subCity={parcel.sub_city?.name || "—"}
                leaseId={createdLeaseId}
                hideTitle={true}
                allowedDocTypes={[
                  { value: "LEASE_CONTRACT", label: "Signed Lease Contract" },
                  { value: "PAYMENT_PROOF", label: "Payment Receipts" },
                  {
                    value: "COUNCIL_DECISION",
                    label: "Council/Board Decision",
                  },
                  { value: "OTHER", label: "Other Lease Document" },
                ]}
                onUploadSuccess={handleLeaseDocsDone}
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
                onClick={handleLeaseDocsDone}
                className="w-full sm:w-auto px-10 py-3 rounded-xl bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white font-semibold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Done – Close
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Request Document Upload Modal */}
      {isSubcityNormal && showApprovalDocsModal && currentApprovalRequest && (
        <ApprovalRequestDocsModal
          isOpen={showApprovalDocsModal}
          onClose={handleApprovalDocsModalClose}
          onComplete={handleApprovalDocsComplete}
          approvalRequestId={currentApprovalRequest.id}
          title={currentApprovalRequest.title}
          description={currentApprovalRequest.description}
          entityType="LEASE_AGREEMENTS"
          actionType="CREATE"
        />
      )}
    </>
  );
};

export default LeaseSection;