// src/components/parcelDetail/sections/LeaseSection.tsx
import { useState } from "react";
import { useTranslate } from "../../../i18n/useTranslate";
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
  const { t } = useTranslate('leaseSection');

  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const isSubcityNormal = user?.role === "SUBCITY_NORMAL";
  const [showCreateLease, setShowCreateLease] = useState(false);
  

  
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
        title: t('approval.title'),
        description: t('approval.description', { upin: parcel.upin }),
        resultData: result
      });
      setShowApprovalDocsModal(true);
      toast.success(result.message || t('messages.submitted'));
    } 
   
 
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
    toast.success(t('messages.updated'));
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-[#f0cd6e] p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#2a2718]">
            {t('title')}
          </h2>
          {lease && isSubcityNormal && (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2 text-sm font-medium text-[#f0cd6e] bg-white border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/20 hover:border-[#2a2718] transition-all shadow-sm"
            >
              {t('editButton')}
            </button>
          )}
        </div>

        {lease ? (
          <LeaseCard lease={lease} />
        ) : isSubcityNormal ? (
          <div className="text-center py-12 bg-[#f0cd6e]/5 rounded-xl border border-dashed border-[#f0cd6e]">
            <p className="text-[#2a2718] mb-2">
              {t('empty.title')}
            </p>
            <p className="text-sm text-[#2a2718]/70 mb-6">
              {t('empty.description')}
              {user?.role === "SUBCITY_NORMAL" && (
                ` ${t('empty.approvalNote')}`
              )}
            </p>
            <button
              onClick={handleCreateLeaseClick}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white text-sm font-medium shadow-sm"
            >
              + {t('empty.createButton')}
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