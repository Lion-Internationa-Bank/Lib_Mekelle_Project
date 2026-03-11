// src/components/parcelDetail/sections/ParcelInfoSection.tsx
import { useState, useEffect } from "react";
import { useTranslate } from "../../../i18n/useTranslate";
import ParcelInfoCard from "../cards/ParcelInfoCard";
import EditParcelModal from "../modals/EditParcelModal";
import { CreateOwnerModal, OwnerDocsUploadModal } from "../../ownership/OwnershipModals";
import SubdivideParcelModal from "../modals/SubdivideParcelModal";
import ApprovalRequestDocsModal from "../../../components/common/ApprovalRequestDocsModal";
import { searchOwnersLiteApi, addOwnerToParcel } from "../../../services/parcelDetailApi";
import { createOwner } from "../../../services/parcelApi";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";
import { X, AlertCircle, Plus } from "lucide-react";
import UniversalDateInput from "../../common/UniversalDateInput";
import { formatLocalDate, parseLocalDate } from "../../../utils/calendarUtils";

type Props = {
  parcel: ParcelDetail;
  onReload: () => Promise<void>;
};

const ParcelInfoSection = ({ parcel, onReload }: Props) => {
  const { t } = useTranslate('parcelInfo');
  const { t: tCommon } = useTranslate('common');
  
  const [showEditParcel, setShowEditParcel] = useState(false);
  const [showAddCoOwnerSearch, setShowAddCoOwnerSearch] = useState(false);
  const [showCreateOwner, setShowCreateOwner] = useState(false);
  const [showOwnerDocsUpload, setShowOwnerDocsUpload] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  const [showSubdivide, setShowSubdivide] = useState(false);
  
  // New state for approval request document upload
  const [showApprovalDocsModal, setShowApprovalDocsModal] = useState(false);
  const [currentApprovalRequest, setCurrentApprovalRequest] = useState<{
    id: string;
    title: string;
    description: string;
    resultData?: any;
  } | null>(null);
  
  // New state for acquired_at date
  const [acquiredAt, setAcquiredAt] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Search state for existing owners
  const [ownerSearch, setOwnerSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any | null>(null);
  const [showAddAcquiredDate, setShowAddAcquiredDate] = useState(false);
  const [addingOwner, setAddingOwner] = useState(false);

  // Form state for new owner
  const [newOwnerForm, setNewOwnerForm] = useState({
    full_name: "",
    national_id: "",
    tin_number: "",
    phone_number: "",
  });
  
  const { user } = useAuth();
  const isSubcityNormal = user?.role === "SUBCITY_NORMAL";

  // Debounced search for existing owners
  useEffect(() => {
    if (!showAddCoOwnerSearch) return;

    const timer = setTimeout(async () => {
      if (ownerSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const owners = await searchOwnersLiteApi(ownerSearch);
        setSearchResults(owners);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [ownerSearch, showAddCoOwnerSearch]);

  const handleSelectOwner = (owner: any) => {
    setSelectedOwner(owner);
    setShowAddAcquiredDate(true);
    setShowAddCoOwnerSearch(false);
  };

  const handleAddExistingOwner = async () => {
    if (!selectedOwner) return;
    
    try {
      setAddingOwner(true);
      
      // Call the API to add owner to parcel
      console.log("date at handle add existing owner", acquiredAt);
      const result = await addOwnerToParcel(parcel.upin, selectedOwner.owner_id, acquiredAt);
      
      // Check if approval is required
      if (result.data?.approval_request_id) {
        setCurrentApprovalRequest({
          id: result.data.approval_request_id,
          title: t('coowner.uploadTitle', { name: selectedOwner.full_name }),
          description: t('coowner.uploadDescription', { name: selectedOwner.full_name }),
          resultData: result.data
        });
        setShowApprovalDocsModal(true);
        toast.success(result.message || t('coowner.submitted'));
      } 
      
      // Reset state
      setShowAddAcquiredDate(false);
      setSelectedOwner(null);
      setAcquiredAt(new Date().toISOString().split('T')[0]);
      setOwnerSearch("");
      setSearchResults([]);
      
    } catch (err: any) {
      toast.error(err.message || t('coowner.addFailed'));
    } finally {
      setAddingOwner(false);
    }
  };

  const handleCreateNewOwner = async () => {
    // Validate form
    if (!newOwnerForm.full_name || !newOwnerForm.national_id) {
      toast.error(t('newowner.validation'));
      return;
    }

    try {
      setAddingOwner(true);
      
      const payload = {
        ...newOwnerForm,
        upin: parcel.upin,
        acquired_at: new Date().toISOString(),
      };

      const response = await createOwner(payload);
      
      // Check if approval is required
      if (response.data?.approval_request_id) {
        setCurrentApprovalRequest({
          id: response.data.approval_request_id,
          title: t('newowner.uploadTitle', { name: newOwnerForm.full_name }),
          description: t('newowner.uploadDescription', { name: newOwnerForm.full_name }),
          resultData: response.data
        });
        setShowApprovalDocsModal(true);
        toast.success(response.message || t('newowner.submitted'));
      } 
    
      
    } catch (err: any) {
      toast.error(err.message || t('newowner.createFailed'));
    } finally {
      setAddingOwner(false);
    }
  };

  const handleCloseAddCoOwner = () => {
    setShowAddCoOwnerSearch(false);
    setOwnerSearch("");
    setSearchResults([]);
    setSelectedOwner(null);
    setShowAddAcquiredDate(false);
    setAcquiredAt(new Date().toISOString().split('T')[0]);
  };

  const handleCloseAcquiredDate = () => {
    setShowAddAcquiredDate(false);
    setSelectedOwner(null);
    setShowAddCoOwnerSearch(true);
    setAcquiredAt(new Date().toISOString().split('T')[0]);
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

  return (
    <>
      {parcel ? (
        <ParcelInfoCard
          data={parcel}
          onEditParcel={() => setShowEditParcel(true)}
          onAddCoOwner={() => setShowAddCoOwnerSearch(true)}
          onSubdivide={() => setShowSubdivide(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0cd6e] p-6 text-center text-[#2a2718]/70">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f0cd6e] mx-auto mb-4" />
          {tCommon('loading')}
        </div>
      )}

      {/* Edit Parcel Modal */}
      {isSubcityNormal && (
        <EditParcelModal
          parcel={parcel}
          open={showEditParcel}
          onClose={() => setShowEditParcel(false)}
          onSuccess={onReload}
        />
      )}

      {/* Add Co-Owner - Search Existing */}
      {isSubcityNormal && showAddCoOwnerSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#f0cd6e] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2a2718]">{t('coowner.modalTitle')}</h2>
              <button
                onClick={handleCloseAddCoOwner}
                className="p-2 rounded-full hover:bg-[#f0cd6e]/20"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Info banner */}
              <div className="bg-[#f0cd6e]/10 border border-[#f0cd6e] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-[#2a2718] mt-0.5 shrink-0" />
                  <div className="text-sm text-[#2a2718]">
                    <p className="font-medium mb-1">{t('coowner.infoTitle', { upin: parcel.upin })}</p>
                    <p>{t('coowner.currentOwners', { count: parcel.owners?.length || 0 })}</p>
                    <p className="mt-2 text-xs">
                      {user?.role === "SUBCITY_NORMAL" 
                        ? t('coowner.approvalNote')
                        : t('coowner.directPermission')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search existing */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2a2718] mb-2">
                  {t('coowner.searchLabel')}
                </label>
                <input
                  type="text"
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  placeholder={t('coowner.searchPlaceholder')}
                  className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e]"
                  autoFocus
                />
              </div>

              {isSearching ? (
                <div className="text-center py-8 text-[#2a2718]/70">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#f0cd6e] border-t-transparent" />
                  <p className="mt-2">{tCommon('searching')}</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto border border-[#f0cd6e] rounded-lg divide-y">
                  {searchResults.map((owner) => (
                    <div
                      key={owner.owner_id}
                      onClick={() => handleSelectOwner(owner)}
                      className="px-4 py-3 hover:bg-[#f0cd6e]/10 cursor-pointer transition-colors"
                    >
                      <div className="font-medium text-[#2a2718]">{owner.full_name}</div>
                      <div className="text-sm text-[#2a2718]/70">
                        {owner.national_id && `${t('coowner.id')}: ${owner.national_id} • `}
                        {owner.phone_number || t('coowner.noPhone')}
                        {owner.tin_number && ` • ${t('coowner.tin')}: ${owner.tin_number}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : ownerSearch.length >= 2 ? (
                <div className="text-center py-8 text-[#2a2718]/70">
                  {t('coowner.noResults')}
                </div>
              ) : null}

              <div className="my-8 text-center text-[#2a2718]/50">— {tCommon('or')} —</div>

              <button
                onClick={() => {
                  setShowAddCoOwnerSearch(false);
                  setShowCreateOwner(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                {t('coowner.createNew')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acquired At Date Modal */}
      {isSubcityNormal && showAddAcquiredDate && selectedOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b border-[#f0cd6e] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2a2718]">{t('coowner.modalTitle')}</h2>
              <button
                onClick={handleCloseAcquiredDate}
                className="p-2 rounded-full hover:bg-[#f0cd6e]/20"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-[#2a2718] mb-6">
                {t('coowner.addingOwner', { name: selectedOwner.full_name })} <br />
                <span className="font-mono text-[#f0cd6e]">{parcel.upin}</span>
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2a2718] mb-2">
                  {t('coowner.acquisitionDate')} <span className="text-red-500">*</span>
                </label>
                <UniversalDateInput
                  value={acquiredAt ? parseLocalDate(acquiredAt) : null}
                  onChange={(date) => {
                    if (date) {
                      console.log("Selected date:", date);
                      const formattedDate = formatLocalDate(date);
                      setAcquiredAt(formattedDate);
                      console.log("Stored date:", formattedDate);
                    }
                  }}
                  required
                  size="md"
                  placeholder={t('coowner.datePlaceholder')}
                />
                <p className="text-xs text-[#2a2718]/70 mt-1">
                  {t('coowner.dateHint')}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddExistingOwner}
                  disabled={!acquiredAt || addingOwner}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingOwner ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {tCommon('processing')}
                    </>
                  ) : (
                    t('coowner.submitForApproval')
                  )}
                </button>
                <button
                  onClick={handleCloseAcquiredDate}
                  className="flex-1 py-2.5 border border-[#f0cd6e] text-[#2a2718] rounded-lg hover:bg-[#f0cd6e]/20 transition-colors"
                  disabled={addingOwner}
                >
                  {tCommon('back')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Owner Modal */}
      {isSubcityNormal && showCreateOwner && (
        <CreateOwnerModal
          saving={addingOwner}
          form={newOwnerForm}
          onChangeForm={setNewOwnerForm}
          onClose={() => {
            setShowCreateOwner(false);
            setNewOwnerForm({
              full_name: "",
              national_id: "",
              tin_number: "",
              phone_number: "",
            });
          }}
          onSave={handleCreateNewOwner}
        />
      )}


      {/* Approval Request Document Upload Modal for Add Owner */}
      {isSubcityNormal && showApprovalDocsModal && currentApprovalRequest && (
        <ApprovalRequestDocsModal
          isOpen={showApprovalDocsModal}
          onClose={handleApprovalDocsModalClose}
          onComplete={handleApprovalDocsComplete}
          approvalRequestId={currentApprovalRequest.id}
          title={currentApprovalRequest.title}
          description={currentApprovalRequest.description}
          entityType="LAND_PARCELS"
          actionType="ADD_OWNER"
        />
      )}

      {/* Subdivision Modal */}
      {isSubcityNormal && showSubdivide && (
        <SubdivideParcelModal
          isOpen={showSubdivide}
          onClose={() => setShowSubdivide(false)}
          parcel={parcel}
          onSuccess={onReload}
        />
      )}
    </>
  );
};

export default ParcelInfoSection;