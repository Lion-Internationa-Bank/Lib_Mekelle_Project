import { useState, useEffect } from "react";
import EncumbranceCard from "../cards/EncumbranceCard";
import EncumbranceModal from "../modals/EncumbranceModal";
import GenericDocsUpload from "../../GenericDocsUpload";
import ApprovalRequestDocsModal from "../../ApprovalRequestDocsModal";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import { useAuth } from "../../../contexts/AuthContext";

type Props = {
  encumbrances: ParcelDetail["encumbrances"];
  upin: string;
  onReload: () => Promise<void>;
};

const EncumbrancesSection = ({ encumbrances, upin, onReload }: Props) => {
  const [editing, setEditing] = useState<ParcelDetail["encumbrances"][number] | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const { user } = useAuth();
  const isSubcityNormal = user?.role === "SUBCITY_NORMAL";
  
  // State for post-creation upload step (for immediate execution)
  const [showUploadStep, setShowUploadStep] = useState(false);
  const [latestEncumbranceId, setLatestEncumbranceId] = useState<string | null>(null);
  
  // State for approval request document upload
  const [showApprovalDocsModal, setShowApprovalDocsModal] = useState(false);
  const [currentApprovalRequest, setCurrentApprovalRequest] = useState<{
    id: string;
    title: string;
    description: string;
    resultData?: any;
  } | null>(null);

  const handleEncumbranceSuccess = async (result?: any) => {
    console.log("Encumbrance success result:", result);
    
    // If result contains approval_request_id, show approval docs modal
    if (result?.approval_request_id) {
      setCurrentApprovalRequest({
        id: result.approval_request_id,
        title: "Upload Encumbrance Documents",
        description: "Upload supporting documents for the encumbrance approval request",
        resultData: result
      });
      setShowApprovalDocsModal(true);
      setAddingNew(false);
      setEditing(null);
    } 
    // If immediate execution (self-approval or no approval needed)
    else if (result?.encumbrance_id) {
      setLatestEncumbranceId(result.encumbrance_id);
      setAddingNew(false);
      setEditing(null);
      setShowUploadStep(true); // Show immediate document upload
    }
    
    await onReload();
  };

  const handleUploadComplete = async () => {
    setShowUploadStep(false);
    setLatestEncumbranceId(null);
    await onReload();
  };

  const handleSkipUpload = () => {
    setShowUploadStep(false);
    setLatestEncumbranceId(null);
  };

  const handleApprovalDocsModalClose = () => {
    setShowApprovalDocsModal(false);
    setCurrentApprovalRequest(null);
    onReload();
  };

  const handleApprovalDocsComplete = () => {
    setShowApprovalDocsModal(false);
    setCurrentApprovalRequest(null);
    
    // Show success message if we have result data
    if (currentApprovalRequest?.resultData) {
      // You can show a toast or update UI here
      console.log("Documents uploaded for approval request:", currentApprovalRequest.id);
    }
    
    onReload();
  };

  return (
    <>
      <div className="space-y-6">
        {isSubcityNormal && encumbrances.length === 0 ? (
          <div className="text-center py-8">
            <button
              onClick={() => setAddingNew(true)}
              className="px-6 py-3 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
            >
              + Add First Encumbrance
            </button>
          </div>
        ) : (
          encumbrances.map((e) => (
            <EncumbranceCard
              key={e.encumbrance_id}
              encumbrance={e}
              onEdit={() => setEditing(e)}
            />
          ))
        )}

        {isSubcityNormal && encumbrances.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setAddingNew(true)}
              className="px-6 py-3 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
            >
              + Add New Encumbrance
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isSubcityNormal && (
          <EncumbranceModal
            upin={upin}
            encumbrance={editing}
            open={!!editing || addingNew}
            onClose={() => {
              setEditing(null);
              setAddingNew(false);
            }}
            onSuccess={handleEncumbranceSuccess}
          />
        )}
      </div>

      {/* === Document Upload Modal After Immediate Creation === */}
      {isSubcityNormal && showUploadStep && latestEncumbranceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-gray-200 bg-liear-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Encumbrance Registered ✓
                  </h2>
                  <p className="text-gray-600">
                    Upload supporting documents for parcel{" "}
                    <span className="font-mono font-bold text-blue-600">{upin}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-4 py-2 text-sm font-bold bg-amber-100 text-amber-800 rounded-full">
                    Optional Step
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <GenericDocsUpload
                title="Encumbrance supporting documents"
                upin={upin}
                subCity=""
                encumbranceId={latestEncumbranceId}
                hideTitle={true}
                allowedDocTypes={[
                  { value: "ENCUMBRANCE_CERT", label: "Encumbrance Certificate" },
                  { value: "COURT_ORDER", label: "Court Order" },
                  { value: "BANK_LETTER", label: "Bank/Mortgage Letter" },
                  { value: "RELEASE_LETTER", label: "Release Letter (if applicable)" },
                  { value: "OTHER", label: "Other Supporting Document" },
                ]}
                onUploadSuccess={onReload}
              />
            </div>

            <div className="p-8 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <button
                onClick={handleSkipUpload}
                className="text-sm text-gray-600 hover:text-gray-900 underline transition"
              >
                Skip for now
              </button>
              <button
                onClick={handleUploadComplete}
                className="px-8 py-3 rounded-xl bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Done – Close
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Approval Request Document Upload Modal === */}
      {isSubcityNormal && showApprovalDocsModal && currentApprovalRequest && (
        <ApprovalRequestDocsModal
          isOpen={showApprovalDocsModal}
          onClose={handleApprovalDocsModalClose}
          onComplete={handleApprovalDocsComplete}
          approvalRequestId={currentApprovalRequest.id}
          title={currentApprovalRequest.title}
          description={currentApprovalRequest.description}
          entityType="ENCUMBRANCES"
          actionType="CREATE"
        />
      )}
    </>
  );
};

export default EncumbrancesSection;