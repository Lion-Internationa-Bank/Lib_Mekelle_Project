// src/routes/OwnershipPage.tsx
import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
} from "../../components/ownership/OwnershipModals";
import ApprovalRequestDocsModal from "../../components/ApprovalRequestDocsModal";
import { ZodError } from "zod";
import {
  CreateOwnerOnlySchema,
  UpdateOwnerFormSchema,
} from "../../validation/schemas";
import { toast } from "sonner";
import { FileText, AlertCircle } from "lucide-react";

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

  // Approval request document upload
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [currentApprovalRequest, setCurrentApprovalRequest] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);

  // Pending approval requests (to show status to users)
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);


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

  // Load pending approval requests for the current user
  const loadPendingRequests = useCallback(async () => {
    if (!user) return;
    
    try {
    
      // This endpoint should be created in your backend
      // Example: GET /api/approval-requests/pending?entity_type=OWNERS&maker_id=${user.user_id}
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/approval-requests/pending?entity_type=OWNERS&maker_id=${user.user_id}`,
        {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPendingRequests(data.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to load pending requests:", error);
    } finally {
     
    }
  }, [user]);

  useEffect(() => {
    loadOwners(page, search);
    if (user) {
      loadPendingRequests();
    }
  }, [page, search, loadOwners, user, loadPendingRequests]);

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
      console.log("result",result)
      
      // Check if approval is required
      if (result.data.approval_request_id) {
        // Show document upload for approval request
        setCurrentApprovalRequest({
          id: result.data.approval_request_id,
          title: "Upload Owner Creation Documents",
          description: "Upload supporting documents for the owner creation approval request",
        });
        setShowDocsModal(true);
        toast.info(result.message || "Owner creation request submitted for approval");
      } else if (result.data.owner_id) {
        // Immediate execution (self-approval)
        toast.success(result.message || "Owner created successfully");
        // You could still show document upload for immediate creation
        // setCurrentApprovalRequest({
        //   id: result.data.owner_id,
        //   title: "Upload Owner Documents",
        //   description: "Upload supporting documents for the newly created owner",
        // });
        // setShowDocsModal(true);
      }

      setShowCreate(false);
      resetCreateForm();
      await loadOwners(page, search);
      await loadPendingRequests();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0]?.message || "Validation failed");
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to create owner");
      } else {
        toast.error("Failed to create owner");
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

      // Note: Update might also require approval depending on your rules
      const res = await updateOwnerApi(editingOwner.owner_id, parsed);
      toast.success(res.message || "Owner updated successfully");
      setEditingOwner(null);
      await loadOwners(page, search);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0]?.message || "Validation failed");
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to update owner");
      } else {
        toast.error("Failed to update owner");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOwner = async () => {
    if (!deletingOwner) return;
    try {
      setSaving(true);
      const res = await deleteOwnerApi(deletingOwner.owner_id);
      toast.success(res.message || "Owner deleted successfully");
      setDeletingOwner(null);
      await loadOwners(page, search);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete owner");
    } finally {
      setSaving(false);
    }
  };

  const handleDocsModalClose = () => {
    setShowDocsModal(false);
    setCurrentApprovalRequest(null);
    // Refresh data
    loadOwners(page, search);
    loadPendingRequests();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const isSubcityNormal = user.role === "SUBCITY_NORMAL";

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-16">
      {/* Header with pending requests info */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ownership Management</h1>
          <p className="text-gray-600 mt-2">Manage property owners and their details</p>
        </div>
        
        {/* Pending Requests Badge */}
        {pendingRequests.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  You have {pendingRequests.length} pending approval request{pendingRequests.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {pendingRequests.some(r => !r.has_documents) && 
                    "Some requests may need supporting documents"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action */}
      {isSubcityNormal && (
        <div className="flex justify-end gap-4">
          {/* View Pending Requests Button */}
          {pendingRequests.length > 0 && (
            <button
              onClick={() => {
                // Navigate to pending requests page or show modal
                toast.info("Pending requests feature coming soon");
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <FileText size={18} />
              View Pending ({pendingRequests.length})
            </button>
          )}
          
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <span className="text-lg">+</span>
            Add New Owner
          </button>
        </div>
      )}

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
      {isSubcityNormal && showCreate && (
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

      {/* Approval Request Document Upload Modal */}
      {isSubcityNormal && showDocsModal && currentApprovalRequest && (
        <ApprovalRequestDocsModal
          isOpen={showDocsModal}
          onClose={handleDocsModalClose}
          approvalRequestId={currentApprovalRequest.id}
          title={currentApprovalRequest.title}
          description={currentApprovalRequest.description}
          entityType="OWNERS"
          actionType="CREATE"
          onComplete={handleDocsModalClose}
        />
      )}

      {/* Edit Owner Modal */}
      {isSubcityNormal && editingOwner && (
        <EditOwnerModal
          saving={saving}
          form={editForm}
          onChangeForm={setEditForm}
          onClose={() => setEditingOwner(null)}
          onSave={handleUpdateOwner}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isSubcityNormal && deletingOwner && (
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