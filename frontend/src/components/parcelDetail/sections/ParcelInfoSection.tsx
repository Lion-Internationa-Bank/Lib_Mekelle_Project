
// src/components/parcelDetail/ParcelInfoSection.tsx
import { useState, useEffect } from "react";
import ParcelInfoCard from "../cards/ParcelInfoCard";
import EditParcelModal from "../modals/EditParcelModal";
import { CreateOwnerModal, OwnerDocsUploadModal } from "../../ownership/OwnershipModals";
import SubdivideParcelModal from "../modals/SubdivideParcelModal"; // ← Make sure this import exists
import { searchOwnersLiteApi, addCoOwnerToParcel } from "../../../services/parcelDetailApi";
import { createOwner } from "../../../services/parcelApi";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

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
  const [showSubdivide, setShowSubdivide] = useState(false); // ← New state for subdivision modal

  // Search state for existing owners
  const [ownerSearch, setOwnerSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form state for new owner
  const [newOwnerForm, setNewOwnerForm] = useState({
    full_name: "",
    national_id: "",
    tin_number: "",
    phone_number: "",
  });

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

  const handleAddExistingOwner = async (ownerId: string) => {
    try {
      await addCoOwnerToParcel(parcel.upin, ownerId);
      await onReload();
      setShowAddCoOwnerSearch(false);
      alert("Co-owner added successfully!");
    } catch (err: any) {
      alert("Failed to add co-owner: " + (err.message || "Unknown error"));
    }
  };

  const handleCreateNewOwner = () => {
    setShowCreateOwner(true);
    setShowAddCoOwnerSearch(false);
  };

  const handleSaveNewOwner = async () => {
    try {
      const payload = {
        ...newOwnerForm,
        upin: parcel.upin,
        acquired_at: new Date().toISOString(),
      };

      const response = await createOwner(payload);
      const ownerId = response.data.owner_id; // adjust based on your API response

      setNewOwnerId(ownerId);
      setShowCreateOwner(false);
      setShowOwnerDocsUpload(true);

      await onReload();
    } catch (err: any) {
      alert("Failed to create owner: " + (err.message || "Unknown error"));
    }
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
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
    Loading parcel data...
  </div>
)}

      {/* Edit Parcel Modal */}
      <EditParcelModal
        parcel={parcel}
        open={showEditParcel}
        onClose={() => setShowEditParcel(false)}
        onSuccess={onReload}
      />

      {/* Add Co-Owner - Search Existing */}
      {showAddCoOwnerSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Add Co-Owner</h2>

              {/* Search existing */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Search Existing Owner
                </label>
                <input
                  type="text"
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  placeholder="Search by name, national ID, phone or TIN..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isSearching ? (
                <div className="text-center py-8 text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                  {searchResults.map((owner) => (
                    <div
                      key={owner.owner_id}
                      onClick={() => handleAddExistingOwner(owner.owner_id)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="font-medium">{owner.full_name}</div>
                      <div className="text-sm text-gray-500">
                        {owner.national_id} • {owner.phone_number || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : ownerSearch.length >= 2 ? (
                <div className="text-center py-8 text-gray-500">
                  No matching owners found
                </div>
              ) : null}

              <div className="my-8 text-center text-gray-500">— OR —</div>

              <button
                onClick={handleCreateNewOwner}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Owner
              </button>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAddCoOwnerSearch(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Owner Modal */}
      {showCreateOwner && (
        <CreateOwnerModal
          saving={false}
          form={newOwnerForm}
          onChangeForm={setNewOwnerForm}
          onClose={() => setShowCreateOwner(false)}
          onSave={handleSaveNewOwner}
        />
      )}

      {/* Document Upload after new owner creation */}
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

      {/* Subdivision Modal */}
      {showSubdivide && (
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