// src/components/parcelDetail/sections/EncumbrancesSection.tsx
import { useState } from "react";
import { useTranslate } from "../../../i18n/useTranslate";
import EncumbranceCard from "../cards/EncumbranceCard";
import EncumbranceModal from "../modals/EncumbranceModal";
import ApprovalRequestDocsModal from "../../common/ApprovalRequestDocsModal";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import { useAuth } from "../../../contexts/AuthContext";

type Props = {
  encumbrances: ParcelDetail["encumbrances"];
  upin: string;
  onReload: () => Promise<void>;
};

const EncumbrancesSection = ({ encumbrances, upin, onReload }: Props) => {
  const { t } = useTranslate('encumbrancesSection');
  const [editing, setEditing] = useState<ParcelDetail["encumbrances"][number] | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const { user } = useAuth();
  const isSubcityNormal = user?.role === "SUBCITY_NORMAL";
  
  
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
        title: t('approval.title'),
        description: t('approval.description'),
        resultData: result
      });
      setShowApprovalDocsModal(true);
      setAddingNew(false);
      setEditing(null);
    } 
 
    
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
    
    // Show success message if we have result data
    if (currentApprovalRequest?.resultData) {
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
              className="px-6 py-3 text-sm font-medium text-[#f0cd6e] bg-white border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/20"
            >
              + {t('buttons.addFirst')}
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
              className="px-6 py-3 text-sm font-medium text-[#f0cd6e] bg-white border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/20"
            >
              + {t('buttons.addNew')}
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