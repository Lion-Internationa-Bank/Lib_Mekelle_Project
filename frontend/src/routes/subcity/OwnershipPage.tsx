// src/routes/OwnershipPage.tsx
import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  fetchOwnersWithParcels,
  type OwnerWithParcels,
  type OwnersPagination,
  createOwnerOnly,
  updateOwnerApi,
  deleteOwnerApi,
} from "../../services/ownersApi";
import OwnershipTable from "../../components/ownership/OwnershipTable";
import {
  CreateOwnerModal,
  EditOwnerModal,
  DeleteOwnerModal,
  OwnerDocsUploadModal,
} from "../../components/ownership/OwnershipModals";
import { ZodError } from "zod";
import {
  CreateOwnerOnlySchema,
  UpdateOwnerFormSchema,
} from "../../validation/schemas";

const PAGE_LIMIT = 20;

const OwnershipPage = () => {
  const { user } = useAuth();
  const [owners, setOwners] = useState<OwnerWithParcels[]>([]);
  const [pagination, setPagination] = useState<OwnersPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedOwnerId, setExpandedOwnerId] = useState<string | null>(null);

  // Create owner modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: "",
    national_id: "",
    tin_number: "",
    phone_number: "",
  });

  // Edit owner modal
  const [editingOwner, setEditingOwner] = useState<OwnerWithParcels | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    national_id: "",
    tin_number: "",
    phone_number: "",
  });

  // Delete owner modal
  const [deletingOwner, setDeletingOwner] = useState<OwnerWithParcels | null>(null);
  const [saving, setSaving] = useState(false);

  // Owner docs upload after create
  const [showOwnerUploadStep, setShowOwnerUploadStep] = useState(false);
  const [latestOwnerId, setLatestOwnerId] = useState<string | null>(null);

  const loadOwners = useCallback(async (pageArg: number, searchArg: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchOwnersWithParcels({
        page: pageArg,
        limit: PAGE_LIMIT,
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
  }, []);

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
    try {
      setSaving(true);

      const parsed = CreateOwnerOnlySchema.parse({
        full_name: createForm.full_name,
        national_id: createForm.national_id,
        tin_number: createForm.tin_number || undefined,
        phone_number: createForm.phone_number || undefined,
      });

      const result = await createOwnerOnly(parsed);

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
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        alert(err.issues[0]?.message || "Validation failed");
      } else if (err instanceof Error) {
        alert(err.message || "Failed to create owner");
      } else {
        alert("Failed to create owner");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOwner = async () => {
    if (!editingOwner) return;
    try {
      setSaving(true);

      const parsed = UpdateOwnerFormSchema.parse({
        full_name: editForm.full_name || undefined,
        national_id: editForm.national_id || undefined,
        tin_number: editForm.tin_number || undefined,
        phone_number: editForm.phone_number || undefined,
      });

      await updateOwnerApi(editingOwner.owner_id, parsed);
      setEditingOwner(null);
      await loadOwners(page, search);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        alert(err.issues[0]?.message || "Validation failed");
      } else if (err instanceof Error) {
        alert(err.message || "Failed to update owner");
      } else {
        alert("Failed to update owner");
      }
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
    <div className="max-w-7xl mx-auto space-y-8 mt-16">
    

      {/* Quick Action */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <span className="text-lg">+</span>
          Add New Owner
        </button>
      </div>

      {/* Search Form */}
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
          className="px-6 py-2 text-sm rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Ownership Table */}
      <OwnershipTable
        owners={owners}
        loading={loading}
        error={error}
        pagination={pagination}
        expandedOwnerId={expandedOwnerId}
        onToggleExpand={(id) => setExpandedOwnerId((current) => (current === id ? null : id))}
        onRetry={() => loadOwners(page, search)}
        onCreate={() => setShowCreate(true)}
        onEdit={(owner) => setEditingOwner(owner)}
        onDelete={(owner) => setDeletingOwner(owner)}
        onPageChange={setPage}
      />

      {/* Create Owner Modal */}
      {showCreate && (
        <CreateOwnerModal
          saving={saving}
          form={createForm}
          onChangeForm={setCreateForm}
          onClose={() => {
            setShowCreate(false);
            resetCreateForm();
          }}
          onSave={handleCreateOwner}
        />
      )}

      {/* Owner Document Upload Modal */}
      {showOwnerUploadStep && latestOwnerId && (
        <OwnerDocsUploadModal
          ownerId={latestOwnerId}
          onClose={() => {
            setShowOwnerUploadStep(false);
            setLatestOwnerId(null);
          }}
          onRefresh={() => loadOwners(page, search)}
        />
      )}

      {/* Edit Owner Modal */}
      {editingOwner && (
        <EditOwnerModal
          saving={saving}
          form={editForm}
          onChangeForm={setEditForm}
          onClose={() => setEditingOwner(null)}
          onSave={handleUpdateOwner}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingOwner && (
        <DeleteOwnerModal
          saving={saving}
          owner={deletingOwner}
          onClose={() => setDeletingOwner(null)}
          onConfirm={handleDeleteOwner}
        />
      )}
    </div>
  );
};

export default OwnershipPage;