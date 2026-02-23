// src/components/parcelDetail/ParcelInfoSection.tsx
import { useState, useEffect } from "react";
import ParcelInfoCard from "../cards/ParcelInfoCard";
import EditParcelModal from "../modals/EditParcelModal";
import { CreateOwnerModal, OwnerDocsUploadModal } from "../../ownership/OwnershipModals";
import SubdivideParcelModal from "../modals/SubdivideParcelModal";
import ApprovalRequestDocsModal from "../../../components/common/ApprovalRequestDocsModal";
import { searchOwnersLiteApi, addOwnerToParcel, } from "../../../services/parcelDetailApi";
import { createOwner } from "../../../services/parcelApi";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";
import { X,AlertCircle,Plus } from "lucide-react";
import UniversalDateInput from "../../common/UniversalDateInput";
import { formatLocalDate, parseLocalDate } from "../../../utils/calendarUtils";
type Props = {
  parcel: ParcelDetail;
  onReload: () => Promise<void>;
};

const ParcelInfoSection = ({ parcel, onReload }: Props) => {
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
      console.log("date at handle add exiteing owner",acquiredAt)
      const result = await addOwnerToParcel(parcel.upin, selectedOwner.owner_id, acquiredAt);
      
      // Check if approval is required
      if (result.data?.approval_request_id) {
        setCurrentApprovalRequest({
          id: result.data.approval_request_id,
          title: "Upload Co-Owner Documents",
          description: `Upload supporting documents for adding ${selectedOwner.full_name} as co-owner`,
          resultData: result.data
        });
        setShowApprovalDocsModal(true);
        toast.success(result.message || "Co-owner addition request submitted for approval");
      } else {
        // Immediate execution
        toast.success(result.message || "Co-owner added successfully");
        await onReload();
      }
      
      // Reset state
      setShowAddAcquiredDate(false);
      setSelectedOwner(null);
      setAcquiredAt(new Date().toISOString().split('T')[0]);
      setOwnerSearch("");
      setSearchResults([]);
      
    } catch (err: any) {
      toast.error(err.message || "Failed to add co-owner");
    } finally {
      setAddingOwner(false);
    }
  };

  const handleCreateNewOwner = async () => {
    // Validate form
    if (!newOwnerForm.full_name || !newOwnerForm.national_id) {
      toast.error("Full name and National ID are required");
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
          title: "Upload New Owner Documents",
          description: `Upload supporting documents for new owner ${newOwnerForm.full_name}`,
          resultData: response.data
        });
        setShowApprovalDocsModal(true);
        toast.success(response.message || "New owner creation request submitted for approval");
      } else {
        // Immediate execution
        const ownerId = response.data.owner_id;
        setNewOwnerId(ownerId);
        setShowCreateOwner(false);
        setShowOwnerDocsUpload(true);
        toast.success(response.message || "Owner created successfully");
      }
      
      await onReload();
      
    } catch (err: any) {
      toast.error(err.message || "Failed to create owner");
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
          Loading parcel data...
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
              <h2 className="text-xl font-semibold text-[#2a2718]">Add Co-Owner</h2>
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
                    <p className="font-medium mb-1">Adding Co-Owner to {parcel.upin}</p>
                    <p>Current owners: {parcel.owners?.length || 0}</p>
                    <p className="mt-2 text-xs">
                      {user?.role === "SUBCITY_NORMAL" 
                        ? "Your request will be submitted for approval by a higher authority."
                        : "You have permission to add owners directly."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search existing */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2a2718] mb-2">
                  Search Existing Owner
                </label>
                <input
                  type="text"
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  placeholder="Search by name, national ID, phone or TIN..."
                  className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e]"
                  autoFocus
                />
              </div>

              {isSearching ? (
                <div className="text-center py-8 text-[#2a2718]/70">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#f0cd6e] border-t-transparent" />
                  <p className="mt-2">Searching...</p>
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
                        {owner.national_id && `ID: ${owner.national_id} • `}
                        {owner.phone_number || "No phone"}
                        {owner.tin_number && ` • TIN: ${owner.tin_number}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : ownerSearch.length >= 2 ? (
                <div className="text-center py-8 text-[#2a2718]/70">
                  No matching owners found
                </div>
              ) : null}

              <div className="my-8 text-center text-[#2a2718]/50">— OR —</div>

              <button
                onClick={() => {
                  setShowAddCoOwnerSearch(false);
                  setShowCreateOwner(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Create New Owner
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
        <h2 className="text-xl font-semibold text-[#2a2718]">Add Co-Owner</h2>
        <button
          onClick={handleCloseAcquiredDate}
          className="p-2 rounded-full hover:bg-[#f0cd6e]/20"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-6">
        <p className="text-[#2a2718] mb-6">
          Adding <span className="font-medium">{selectedOwner.full_name}</span> as co-owner to <br />
          <span className="font-mono text-[#f0cd6e]">{parcel.upin}</span>
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2a2718] mb-2">
            Acquisition Date <span className="text-red-500">*</span>
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
  placeholder="Select acquisition date"
/>
          <p className="text-xs text-[#2a2718]/70 mt-1">
            Date when this owner acquired ownership of the parcel acquiredAt: {acquiredAt}
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
                Processing...
              </>
            ) : (
              'Submit for Approval'
            )}
          </button>
          <button
            onClick={handleCloseAcquiredDate}
            className="flex-1 py-2.5 border border-[#f0cd6e] text-[#2a2718] rounded-lg hover:bg-[#f0cd6e]/20 transition-colors"
            disabled={addingOwner}
          >
            Back
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

      {/* Document Upload after new owner creation (immediate execution) */}
      {isSubcityNormal && showOwnerDocsUpload && newOwnerId && (
        <OwnerDocsUploadModal
          ownerId={newOwnerId}
          onClose={() => {
            setShowOwnerDocsUpload(false);
            setNewOwnerId(null);
          }}
          onRefresh={onReload}
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