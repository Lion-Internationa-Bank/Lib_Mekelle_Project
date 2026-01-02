// ParcelDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ParcelInfoCard from "../components/parcelDetail/ParcelInfoCard";
import OwnerCard from "../components/parcelDetail/OwnerCard";
import LeaseCard from "../components/parcelDetail/LeaseCard";
import EncumbranceCard from "../components/parcelDetail/EncumbranceCard";
import BuildingCard from "../components/parcelDetail/BuildingCard";
import BillingCard from "../components/parcelDetail/BillingCard";
import DocumentList from "../components/parcelDetail/DocumentList";
import {
  fetchParcelDetail,
  type ParcelDetail,
  createEncumbranceApi,
} from "../services/parcelDetailApi";
import {
  updateParcelApi,
  deleteParcelApi,
  updateOwnerApi,
  updateLeaseApi,
  updateEncumbranceApi,
  updateOwnerShareApi,
} from "../services/parcelDetailApi";

type DetailTab = "parcel" | "lease" | "encumbrances" | "buildings" | "billing";

const ParcelDetailPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { upin } = useParams<{ upin: string }>();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tab, setTab] = useState<DetailTab>("parcel");
  const [data, setData] = useState<ParcelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit states
  const [showParcelEdit, setShowParcelEdit] = useState(false);
  const [showParcelDeleteConfirm, setShowParcelDeleteConfirm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<ParcelDetail["owners"][number] | null>(null);
  const [editingShare, setEditingShare] = useState<{ parcel_owner_id: string; share_ratio: string } | null>(null);
  const [editingLease, setEditingLease] = useState(false);
  const [editingEncumbrance, setEditingEncumbrance] = useState<ParcelDetail["encumbrances"][number] | null>(null);
const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
const [deleting, setDeleting] = useState(false);
const [showAddEncumbrance, setShowAddEncumbrance] = useState(false);
const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Form states
  const [parcelForm, setParcelForm] = useState<any>({});
  const [ownerForm, setOwnerForm] = useState<any>({});
  const [shareForm, setShareForm] = useState("");
  const [leaseForm, setLeaseForm] = useState<any>({});
  const [encumbranceForm, setEncumbranceForm] = useState<any>({});

  useEffect(() => {
    if (!upin) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchParcelDetail(upin);
        if (res.success) {
          setData(res.data);
        } else {
          setError("Failed to load parcel detail");
        }
      } catch (err: any) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [upin]);

  useEffect(() => {
    if (!data) return;

    setParcelForm({
      file_number: data.file_number || "",
      sub_city: data.sub_city || "",
      tabia: data.tabia || "",
      ketena: data.ketena || "",
      block: data.block || "",
      total_area_m2: data.total_area_m2?.toString() || "",
      land_use: data.land_use || "",
      land_grade: data.land_grade || "",
      tenure_type: data.tenure_type || "",
    });

    // Safe access to lease_agreement
    if (data.lease_agreement) {
      const l = data.lease_agreement;
      setLeaseForm({
        annual_lease_fee: l.annual_lease_fee?.toString() || "",
        total_lease_amount: l.total_lease_amount?.toString() || "",
        down_payment_amount: l.down_payment_amount?.toString() || "",
        annual_installment: l.annual_installment?.toString() || "",
        price_per_m2: l.price_per_m2?.toString() || "",
        lease_period_years: l.lease_period_years?.toString() || "",
        payment_term_years: l.payment_term_years?.toString() || "",
        start_date: l.start_date?.slice(0, 10) || "",
        expiry_date: l.expiry_date?.slice(0, 10) || "",
        legal_framework: l.legal_framework || "",
      });
    }
  }, [data]);

  useEffect(() => {
    if (editingOwner) {
      const o = editingOwner.owner;
      setOwnerForm({
        full_name: o.full_name || "",
        national_id: o.national_id || "",
        phone_number: o.phone_number || "",
        tin_number: o.tin_number || "",
      });
    }
  }, [editingOwner]);

  useEffect(() => {
    if (editingEncumbrance) {
      setEncumbranceForm({
        type: editingEncumbrance.type || "",
        issuing_entity: editingEncumbrance.issuing_entity || "",
        reference_number: editingEncumbrance.reference_number || "",
        status: editingEncumbrance.status || "",
        registration_date: editingEncumbrance.registration_date?.slice(0, 10) || "",
      });
    }
  }, [editingEncumbrance]);

  useEffect(() => {
    if (editingShare) {
      setShareForm(editingShare.share_ratio);
    }
  }, [editingShare]);

  if (!user) return <Navigate to="/login" replace />;

  const reload = async () => {
    if (!upin) return;
    const res = await fetchParcelDetail(upin);
    if (res.success) setData(res.data);
  };

  const handleUpdate = async (fn: () => Promise<void>, onSuccess: () => void) => {
    try {
      await fn();
      await reload();
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Update failed");
    }
  };
  const handleParcelDelete = async () => {
  if (!data || deleteConfirmInput !== data.upin) return;

  try {
    setDeleting(true);
    await deleteParcelApi(data.upin);
    navigate("/home");
  } catch (err: any) {
    alert(err.message || "Failed to delete parcel");
    setDeleting(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200">
            <p className="text-red-800 font-semibold">{error || "Parcel not found"}</p>
            <Link to="/home" className="mt-4 inline-block text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`lg:w-64 fixed lg:static inset-y-0 left-0 z-40 transform transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <Sidebar />
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Parcel Detail — <span className="font-mono text-blue-600">{data.upin}</span>
                </h1>
                <p className="text-gray-600 mt-1">
                  {data.sub_city} • {data.ketena || "N/A"}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/home"
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  ← Dashboard
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: "parcel", label: "Parcel & Owners" },
                  { id: "lease", label: "Lease" },
                  { id: "encumbrances", label: "Encumbrances" },
                  { id: "buildings", label: "Buildings" },
                  { id: "billing", label: "Billing" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id as DetailTab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      tab === t.id
                        ? "border-blue-600 text-blue-700"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
             {tab === "parcel" && (
  <>
    <ParcelInfoCard data={data} onEdit={() => setShowParcelEdit(true)} />

    {/* Owners */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Owners</h2>
      {data.owners.length === 0 ? (
        <p className="text-gray-500">No owners registered</p>
      ) : (
        <div className="space-y-6">
          {data.owners.map((po) => (
            <OwnerCard
              key={po.parcel_owner_id}
              ownerRelation={po}
              onEditOwner={() => setEditingOwner(po)}
              onEditShare={() =>
                setEditingShare({
                  parcel_owner_id: po.parcel_owner_id,
                  share_ratio: po.share_ratio.toString(),
                })
              }
            />
          ))}
        </div>
      )}
    </div>

    {/* Parcel Documents */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Parcel Documents</h2>
      <DocumentList documents={data.documents} title="Parcel Documents" />
    </div>

    {/* DANGER ZONE */}
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
      <p className="text-sm text-red-700 mb-6">
        Once you delete a parcel, there is no going back. All data, documents, owners, lease, and billing records will be permanently removed.
      </p>
      <button
        onClick={() => setShowParcelDeleteConfirm(true)}
        className="px-6 py-3 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
      >
        Delete this parcel
      </button>
    </div>
  </>
)}
              {/* Fixed: Safe null check for lease_agreement */}
              {tab === "lease" && data.lease_agreement && (
                <LeaseCard lease={data.lease_agreement} onEdit={() => setEditingLease(true)} />
              )}

             {tab === "encumbrances" && (
  <div className="space-y-6">
    {data.encumbrances.length === 0 ? (
      <EncumbranceCard isNew onAddNew={() => setShowAddEncumbrance(true)} />
    ) : (
      data.encumbrances.map((e) => (
        <EncumbranceCard
          key={e.encumbrance_id}
          encumbrance={e}
          onEdit={() => {
            setEditingEncumbrance(e);
            setIsEditingExisting(true); // you'll need this state
          }}
        />
      ))
    )}

    {/* Always show "Add New" button if there are existing ones */}
    {data.encumbrances.length > 0 && (
      <div className="text-center">
        <button
          onClick={() => setShowAddEncumbrance(true)}
          className="px-6 py-3 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
        >
          + Add New Encumbrance
        </button>
      </div>
    )}
  </div>
)}

              {tab === "buildings" && data.buildings.length > 0 && (
                <div className="space-y-6">
                  {data.buildings.map((b) => (
                    <BuildingCard key={b.building_id} building={b} />
                  ))}
                </div>
              )}

              {tab === "billing" && data.billing_records.length > 0 && (
                <div className="space-y-6">
                  {data.billing_records.map((bill) => (
                    <BillingCard key={bill.bill_id} bill={bill} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modals */}
      {/* Parcel Edit */}
      {showParcelEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-6">Edit Parcel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(parcelForm).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                    {key.replace(/_/g, " ")}
                  </label>
                  <input
                    type={key.includes("area") ? "number" : "text"}
                    value={parcelForm[key]}
                    onChange={(e) =>
                      setParcelForm({ ...parcelForm, [key]: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => setShowParcelEdit(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(() => updateParcelApi(data.upin, parcelForm), () => setShowParcelEdit(false))}
                className="px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
     {/* Delete Confirmation with UPIN verification */}
{showParcelDeleteConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
      <h2 className="text-2xl font-bold text-red-700 mb-4">Confirm Parcel Deletion</h2>
      <p className="text-gray-700 mb-6">
        This action <strong>cannot be undone</strong>. All data associated with this parcel will be permanently deleted.
      </p>

      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-2">
          To confirm, type the parcel UPIN below:
        </p>
        <code className="block p-3 bg-gray-100 rounded-lg font-mono text-lg text-center text-gray-900">
          {data.upin}
        </code>
        <input
          type="text"
          value={deleteConfirmInput}
          onChange={(e) => setDeleteConfirmInput(e.target.value)}
          placeholder="Enter UPIN to confirm"
          className="mt-4 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-mono"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            setShowParcelDeleteConfirm(false);
            setDeleteConfirmInput("");
          }}
          className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleParcelDelete}
          disabled={deleteConfirmInput !== data.upin}
          className="px-6 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: deleteConfirmInput === data.upin ? "#dc2626" : "#9ca3af",
          }}
        >
          {deleting ? "Deleting..." : "Permanently Delete"}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Owner Edit */}
      {editingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">Edit Owner</h2>
            <div className="space-y-4">
              {Object.keys(ownerForm).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                    {key.replace(/_/g, " ")}
                  </label>
                  <input
                    value={ownerForm[key]}
                    onChange={(e) =>
                      setOwnerForm({ ...ownerForm, [key]: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => setEditingOwner(null)}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(() => updateOwnerApi(editingOwner.owner.owner_id, ownerForm), () => setEditingOwner(null))}
                className="px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Edit */}
      {editingShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-6">Update Share Ratio</h2>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={shareForm}
              onChange={(e) => setShareForm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setEditingShare(null)}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(() => updateOwnerShareApi(editingShare.parcel_owner_id, parseFloat(shareForm)), () => setEditingShare(null))}
                className="px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lease Edit */}
      {/* Lease Edit */}
{editingLease && data?.lease_agreement && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full my-8">
      <h2 className="text-xl font-bold mb-6">Edit Lease Agreement</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(leaseForm).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
              {key.replace(/_/g, " ")}
            </label>
            <input
              type={
                key.includes("date")
                  ? "date"
                  : key.includes("amount") ||
                    key.includes("price") ||
                    key.includes("period") ||
                    key.includes("payment_term")
                  ? "number"
                  : "text"
              }
              value={leaseForm[key]}
              onChange={(e) =>
                setLeaseForm({ ...leaseForm, [key]: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => setEditingLease(false)}
          className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            handleUpdate(
              () => updateLeaseApi(data.lease_agreement!.lease_id, leaseForm), // ← Use ! to assert non-null
              () => setEditingLease(false)
            )
          }
          className="px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

  {/* Encumbrance Edit / Create Modal */}
{(editingEncumbrance || showAddEncumbrance) && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full my-8">
      <h2 className="text-xl font-bold mb-6">
        {showAddEncumbrance ? "Add New Encumbrance" : "Edit Encumbrance"}
      </h2>

      <div className="space-y-4">
        {/* Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select
            value={encumbranceForm.type}
            onChange={(e) => setEncumbranceForm({ ...encumbranceForm, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select type</option>
            <option value="MORTGAGE">MORTGAGE</option>
            <option value="COURT_FREEZE">COURT FREEZE</option>
            <option value="GOVT_RESERVATION">GOVT RESERVATION</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Entity *</label>
          <input
            value={encumbranceForm.issuing_entity}
            onChange={(e) => setEncumbranceForm({ ...encumbranceForm, issuing_entity: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
          <input
            value={encumbranceForm.reference_number}
            onChange={(e) => setEncumbranceForm({ ...encumbranceForm, reference_number: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={encumbranceForm.status || (showAddEncumbrance ? "ACTIVE" : editingEncumbrance?.status)}
            onChange={(e) => setEncumbranceForm({ ...encumbranceForm, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="RELEASED">RELEASED</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
          <input
            type="date"
            value={encumbranceForm.registration_date}
            onChange={(e) => setEncumbranceForm({ ...encumbranceForm, registration_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => {
            setEditingEncumbrance(null);
            setShowAddEncumbrance(false);
            setEncumbranceForm({
              type: "",
              issuing_entity: "",
              reference_number: "",
              status: "ACTIVE",
              registration_date: "",
            });
          }}
          className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (showAddEncumbrance) {
              handleUpdate(
                () => createEncumbranceApi({
                  upin: data.upin,
                  type: encumbranceForm.type,
                  issuing_entity: encumbranceForm.issuing_entity,
                  reference_number: encumbranceForm.reference_number || undefined,
                  registration_date: encumbranceForm.registration_date || undefined,
                }),
                () => {
                  setShowAddEncumbrance(false);
                  setEncumbranceForm({
                    type: "",
                    issuing_entity: "",
                    reference_number: "",
                    status: "ACTIVE",
                    registration_date: "",
                  });
                }
              );
            } else {
              handleUpdate(
                () => updateEncumbranceApi(editingEncumbrance!.encumbrance_id, encumbranceForm),
                () => setEditingEncumbrance(null)
              );
            }
          }}
          disabled={!encumbranceForm.type || !encumbranceForm.issuing_entity}
          className="px-5 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
        >
          {showAddEncumbrance ? "Create Encumbrance" : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ParcelDetailPage;