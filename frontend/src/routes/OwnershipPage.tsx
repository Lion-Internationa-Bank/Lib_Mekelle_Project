import { useEffect, useState, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../auth/AuthContext";
import {
  fetchOwnersWithParcels,
  type OwnerWithParcels,
  type OwnersPagination,
  createOwnerOnly,
  updateOwnerApi,
  deleteOwnerApi,
} from "../services/ownersApi";
import GenericDocsUpload from "../components/GenericDocsUpload";

const OwnershipPage = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [owners, setOwners] = useState<OwnerWithParcels[]>([]);
  const [pagination, setPagination] = useState<OwnersPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

const [expandedOwnerId, setExpandedOwnerId] = useState<string | null>(null);

  // modals
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: "",
    national_id: "",
    tin_number: "",
    phone_number: "",
  });

  const [editingOwner, setEditingOwner] = useState<OwnerWithParcels | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    national_id: "",
    tin_number: "",
    phone_number: "",
  });

  const [deletingOwner, setDeletingOwner] = useState<OwnerWithParcels | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  // owner docs after create
  const [showOwnerUploadStep, setShowOwnerUploadStep] = useState(false);
  const [latestOwnerId, setLatestOwnerId] = useState<string | null>(null);

  const loadOwners = useCallback(
    async (pageArg: number, searchArg: string) => {
      try {
        setLoading(true);
        setError("");
        const res = await fetchOwnersWithParcels({
          page: pageArg,
          limit,
          search: searchArg,
        });
        if (res.success) {
          setOwners(res.data.owners);
          setPagination(res.data.pagination);
        } else {
          setError("Failed to load owners");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load owners");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadOwners(page, search);
  }, [page, search, loadOwners]);

  useEffect(() => {
    if (editingOwner) {
      setEditForm({
        full_name: editingOwner.full_name || "",
        national_id: editingOwner.national_id || "",
        tin_number: editingOwner.tin_number || "",
        phone_number: editingOwner.phone_number || "",
      });
    }
  }, [editingOwner]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const resetCreateForm = () => {
    setCreateForm({
      full_name: "",
      national_id: "",
      tin_number: "",
      phone_number: "",
    });
  };

  const handleCreateOwner = async () => {
    if (!createForm.full_name || !createForm.national_id) {
      alert("Full name and National ID are required");
      return;
    }
    try {
      setSaving(true);
      const result = await createOwnerOnly({
        full_name: createForm.full_name,
        national_id: createForm.national_id,
        tin_number: createForm.tin_number || undefined,
        phone_number: createForm.phone_number || undefined,
      });

      const newOwnerId = result.data?.owner_id;
      if (!newOwnerId) {
        console.warn("No owner_id returned after creation", result);
      }

      setLatestOwnerId(newOwnerId || "");
      setShowCreate(false);
      resetCreateForm();

      if (newOwnerId) {
        setShowOwnerUploadStep(true);
      }

      await loadOwners(page, search);
    } catch (err: any) {
      alert(err.message || "Failed to create owner");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOwner = async () => {
    if (!editingOwner) return;
    try {
      setSaving(true);
      await updateOwnerApi(editingOwner.owner_id, {
        full_name: editForm.full_name || undefined,
        national_id: editForm.national_id || undefined,
        tin_number: editForm.tin_number || undefined,
        phone_number: editForm.phone_number || undefined,
      });
      setEditingOwner(null);
      await loadOwners(page, search);
    } catch (err: any) {
      alert(err.message || "Failed to update owner");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOwner = async () => {
    if (!deletingOwner) return;
    try {
      setSaving(true);
      await deleteOwnerApi(deletingOwner.owner_id);
      setDeletingOwner(null);
      await loadOwners(page, search);
    } catch (err: any) {
      alert(err.message || "Failed to delete owner");
    } finally {
      setSaving(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`lg:w-64 lg:flex-shrink-0 fixed lg:static inset-y-0 left-0 z-40 transform transition-transform lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } lg:block`}
        >
          <Sidebar />
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pt-4 lg:pt-0 px-6 lg:px-8 pb-12 lg:pb-16 min-h-screen overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header row */}
            <div className="flex items-center justify-between mt-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ownership</h1>
                <p className="text-sm text-gray-600">
                  Owners and their active land parcels
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md"
              >
                <span className="text-lg leading-none">+</span>
                <span>Add Owner</span>
              </button>
            </div>

            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/80 rounded-2xl border border-gray-200 px-4 py-3 flex items-center gap-3"
            >
              <input
                type="text"
                placeholder="Search owner by name, national ID, or phone..."
                className="flex-1 border-none focus:ring-0 text-sm bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            {/* Table / list */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-visible">
              {loading && (
                <div className="p-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
                  <p className="text-xl font-semibold text-gray-700">
                    Loading owners...
                  </p>
                  <p className="text-gray-500 mt-2">Connecting to backend API</p>
                </div>
              )}

              {error && !loading && (
                <div className="p-16 text-center border-t border-gray-200 bg-red-50/50">
                  <div className="text-6xl mb-6">Warning</div>
                  <h3 className="text-2xl font-bold text-red-800 mb-4">
                    {error}
                  </h3>
                  <button
                    onClick={() => loadOwners(page, search)}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && owners.length === 0 && (
                <div className="p-16 text-center border-t border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <span className="text-6xl mb-4 block">👥</span>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    No owners found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or add the first owner.
                  </p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Add Owner
                  </button>
                </div>
              )}

              {!loading && !error && owners.length > 0 && (
                <div>
                  {/* header */}
                  <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_2fr_auto] gap-4 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50/90 border-b border-gray-200">
                    <div>Owner</div>
                    <div>National ID</div>
                    <div>TIN</div>
                    <div>Phone</div>
                    <div>Parcels (count)</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {/* rows */}
                  <div className="divide-y divide-gray-200/70">
  {owners.map((owner) => (
    <OwnerRow
      key={owner.owner_id}
      owner={owner}
      isExpanded={expandedOwnerId === owner.owner_id}
      onToggle={() =>
        setExpandedOwnerId((current) =>
          current === owner.owner_id ? null : owner.owner_id
        )
      }
      onEdit={() => setEditingOwner(owner)}
      onDelete={() => setDeletingOwner(owner)}
    />
  ))}
</div>

                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && owners.length > 0 && (
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                  Page{" "}
                  <span className="font-semibold text-gray-900">
                    {pagination.page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {pagination.totalPages}
                  </span>{" "}
                  •{" "}
                  <span className="font-semibold text-gray-900">
                    {pagination.total.toLocaleString()}
                  </span>{" "}
                  owners
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrev || loading}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNext || loading}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

     

      {/* Create owner modal */}
      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-sm">
            <h2 className="text-lg font-semibold mb-4">Add Owner</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1">Full Name *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={createForm.full_name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  National ID *
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={createForm.national_id}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, national_id: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Phone</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={createForm.phone_number}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, phone_number: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">TIN</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={createForm.tin_number}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, tin_number: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreate(false);
                  resetCreateForm();
                }}
                className="px-4 py-2 rounded-lg border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOwner}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Document Upload Modal After Creation */}
      {showOwnerUploadStep && latestOwnerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Owner Created ✓
                  </h2>
                  <p className="text-gray-600">
                    Upload supporting documents for the new owner
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-4 py-2 text-sm font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    Optional Step
                  </span>
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="p-8">
              <GenericDocsUpload
                title="Owner supporting documents"
                upin=""
                subCity=""
                ownerId={latestOwnerId}
                hideTitle={true}
                allowedDocTypes={[
                  { value: "ID_COPY", label: "National ID Copy" },
                  { value: "PASSPORT_PHOTO", label: "Passport-size Photo" },
                  { value: "TIN_CERT", label: "TIN Certificate" },
                  { value: "POWER_OF_ATTORNEY", label: "Power of Attorney" },
                  { value: "OTHER", label: "Other Document" },
                ]}
                onUploadSuccess={() => loadOwners(page, search)}
              />
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <button
                onClick={() => {
                  setShowOwnerUploadStep(false);
                  setLatestOwnerId(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline transition"
              >
                Skip for now
              </button>

              <button
                onClick={() => {
                  setShowOwnerUploadStep(false);
                  setLatestOwnerId(null);
                  loadOwners(page, search);
                }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Done – Close
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit owner modal */}
      {editingOwner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-sm">
            <h2 className="text-lg font-semibold mb-4">Edit Owner</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">National ID</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editForm.national_id}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, national_id: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Phone</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editForm.phone_number}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone_number: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">TIN</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editForm.tin_number}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, tin_number: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingOwner(null)}
                className="px-4 py-2 rounded-lg border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOwner}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete owner confirm */}
      {deletingOwner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-sm">
            <h2 className="text-lg font-semibold mb-4 text-red-700">
              Delete Owner
            </h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete owner{" "}
              <span className="font-semibold">{deletingOwner.full_name}</span>?
              Owners with active parcels cannot be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingOwner(null)}
                className="px-4 py-2 rounded-lg border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOwner}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



interface OwnerRowProps {
  owner: OwnerWithParcels;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const OwnerRow = ({
  owner,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: OwnerRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuFlipUp, setMenuFlipUp] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const parcelCount = owner.parcels.length;

  // Decide menu placement when opening
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const willOpen = !menuOpen;

    if (willOpen && rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 160; // approx menu height
      setMenuFlipUp(spaceBelow < menuHeight + 16);
    }

    setMenuOpen(willOpen);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="border-b border-gray-200/70">
      {/* Main row */}
      <div
        ref={rowRef}
        className="grid grid-cols-[auto_2fr_2fr_1.5fr_1.5fr_2fr_auto] gap-4 px-4 py-3 text-sm items-center cursor-pointer hover:bg-gray-50/80 transition-colors"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        {/* Chevron */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-transform"
        >
          <svg
            className={`w-3 h-3 transform transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <div className="font-semibold text-gray-900 truncate">
          {owner.full_name}
        </div>
        <div className="font-mono text-xs text-gray-800 truncate">
          {owner.national_id}
        </div>
        <div className="text-gray-700 truncate">
          {owner.tin_number || "-"}
        </div>
        <div className="text-gray-700 truncate">
          {owner.phone_number || "-"}
        </div>
        <div className="text-gray-700">
          {parcelCount === 0
            ? "No parcels"
            : `${parcelCount} parcel${parcelCount > 1 ? "s" : ""}`}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <div className="relative" ref={menuRef}>
            <button
              ref={menuButtonRef}
              onClick={handleMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            {menuOpen && (
              <div
                className={`
                  absolute right-0 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50
                  ${menuFlipUp ? "bottom-full mb-2" : "top-full mt-2"}
                `}
              >
                <button
                  className="w-full text-left px-5 py-3 text-sm hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit();
                  }}
                >
                  Edit owner
                </button>
                <button
                  className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete();
                  }}
                >
                  Delete owner
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details panel (unchanged) */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-gray-50/60">
          {parcelCount === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-xs text-gray-600 text-center">
              No parcels registered for this owner.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {owner.parcels.map((ownership, index) => {
                const parcel = ownership.parcel;
                return (
                  <div
                    key={parcel.upin || index}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-xs"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-gray-900">
                        UPIN: {parcel.upin}
                      </div>
                      <div className="text-gray-500">
                        {new Date(
                          ownership.acquired_at
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-gray-700">
                      <div>
                        <div className="font-medium text-gray-600">
                          Sub City
                        </div>
                        <div>{parcel.sub_city || "-"}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600">
                          Ketena
                        </div>
                        <div>{parcel.ketena || "-"}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600">
                          Area (m²)
                        </div>
                        <div>
                          {Number(
                            parcel.total_area_m2
                          ).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600">
                          Land Use
                        </div>
                        <div>{parcel.land_use || "-"}</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <span className="font-medium text-gray-700">
                        Ownership Share:
                      </span>{" "}
                      <span className="font-bold text-indigo-600">
                        {(Number(ownership.share_ratio) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};




interface OwnerHoverCardContainerProps {
  owner: OwnerWithParcels;
  onClose: () => void;
  onEnterCard: () => void;
  onLeaveCard: () => void;
}

const OwnerHoverCardContainer = ({
  owner,
  onClose,
  onEnterCard,
  onLeaveCard,
}: OwnerHoverCardContainerProps) => {
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(
    null
  );

  useEffect(() => {
    const el = document.querySelector<HTMLDivElement>(
      `[data-owner-row="${owner.owner_id}"]`
    );
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const cardHeight = 420;

    let top = rect.bottom + 8;
    if (vh - rect.bottom < cardHeight + 16) {
      top = rect.top - cardHeight - 8;
    }
    const left = Math.min(rect.left, window.innerWidth - 360);
    setCardPos({ top, left });
  }, [owner.owner_id]);

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [onClose]);

  if (!cardPos) return null;

  const parcelCount = owner.parcels.length;

  if (parcelCount === 0) {
    return (
      <div
        className="fixed z-[120]"
        style={{ top: cardPos.top, left: cardPos.left, width: 360 }}
        onMouseEnter={onEnterCard}
        onMouseLeave={onLeaveCard}
      >
        <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl p-6 text-center text-gray-600 font-medium">
          No parcels registered for this owner
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed z-[120]"
      style={{ top: cardPos.top, left: cardPos.left, width: 360 }}
      onMouseEnter={onEnterCard}
      onMouseLeave={onLeaveCard}
    >
      <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl p-6 text-xs max-h-96 overflow-y-auto">
        <div className="font-bold text-gray-900 mb-5 text-base">
          All Parcels ({parcelCount})
        </div>
        <div className="flex flex-col gap-4">
          {owner.parcels.map((ownership, index) => {
            const parcel = ownership.parcel;
            return (
              <div
                key={parcel.upin || index}
                className="flex-none w-full bg-gray-50/80 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="font-bold text-gray-900 text-sm">
                    UPIN: {parcel.upin}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(ownership.acquired_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-gray-600">Sub City</div>
                      <div className="truncate font-medium">
                        {parcel.sub_city || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Ketena</div>
                      <div className="truncate font-medium">
                        {parcel.ketena || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Area (m²)</div>
                      <div className="font-semibold">
                        {Number(parcel.total_area_m2).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Land Use</div>
                      <div className="truncate font-medium">
                        {parcel.land_use || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-300">
                    <span className="font-medium text-gray-700">
                      Ownership Share:
                    </span>{" "}
                    <span className="font-bold text-indigo-600 text-lg">
                      {(Number(ownership.share_ratio) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {owner.parcels.length > 6 && (
          <div className="mt-5 text-center text-xs text-gray-500 italic">
            Scroll to view all parcels
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnershipPage;
