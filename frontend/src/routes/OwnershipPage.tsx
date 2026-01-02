import { useEffect, useState, useCallback } from "react";
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

  // hover state for detail card
  const [hoverOwnerId, setHoverOwnerId] = useState<string | null>(null);

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

  const [deletingOwner, setDeletingOwner] = useState<OwnerWithParcels | null>(null);
  const [saving, setSaving] = useState(false);

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
      await createOwnerOnly({
        full_name: createForm.full_name,
        national_id: createForm.national_id,
        tin_number: createForm.tin_number || undefined,
        phone_number: createForm.phone_number || undefined,
      });
      setShowCreate(false);
      resetCreateForm();
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
    // search state already bound to input
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
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
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
                        isHovered={hoverOwnerId === owner.owner_id}
                        onHover={() => setHoverOwnerId(owner.owner_id)}
                        onLeave={() => setHoverOwnerId((id) => (id === owner.owner_id ? null : id))}
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
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-2xl p-4">
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
                <label className="block text-gray-700 mb-1">National ID *</label>
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
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const OwnerRow = ({
  owner,
  isHovered,
  onHover,
  onLeave,
  onEdit,
  onDelete,
}: OwnerRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const parcelCount = owner.parcels.length;
  const latestParcel = owner.parcels[0];

  return (
    <div
      className="relative group"
      onMouseEnter={onHover}
      onMouseLeave={() => {
        onLeave();
        setMenuOpen(false);
      }}
    >
      <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_2fr_auto] gap-4 px-4 py-4 text-sm hover:bg-gray-50/60 transition-colors">
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
        <div className="flex justify-end">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
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
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={onEdit}
                >
                  Edit owner
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={onDelete}
                >
                  Delete owner
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover detail card */}
      {isHovered && owner.parcels.length > 0 && latestParcel && (
        <div className="absolute left-4 right-4 md:left-auto md:right-4 top-full mt-1 z-10">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 text-xs">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-gray-900">
                Latest Parcel: {latestParcel.parcel.upin}
              </div>
              <div className="text-gray-500">
                {new Date(latestParcel.acquired_at).toLocaleDateString()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-gray-700">
              <div>
                <div className="font-medium">Sub City</div>
                <div>{latestParcel.parcel.sub_city}</div>
              </div>
              <div>
                <div className="font-medium">Ketena</div>
                <div>{latestParcel.parcel.ketena}</div>
              </div>
              <div>
                <div className="font-medium">Area (m²)</div>
                <div>
                  {Number(latestParcel.parcel.total_area_m2).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium">Land Use</div>
                <div>{latestParcel.parcel.land_use}</div>
              </div>
            </div>
            <div className="mt-3 text-gray-600">
              Share: {Number(latestParcel.share_ratio) * 100}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnershipPage;
