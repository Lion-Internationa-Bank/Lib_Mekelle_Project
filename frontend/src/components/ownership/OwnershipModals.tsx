import GenericDocsUpload from "../../components/GenericDocsUpload";
import type { OwnerWithParcels } from "../../services/ownersApi";
import { toast } from "sonner";

export const CreateOwnerModal = ({
  saving,
  form,
  onChangeForm,
  onClose,
  onSave,
}: {
  saving: boolean;
  form: {
    full_name: string;
    national_id: string;
    tin_number: string;
    phone_number: string;
  };
  onChangeForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onClose: () => void;
  onSave: () => void;
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-sm">
      <h2 className="text-lg font-semibold mb-4">Add Owner</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-gray-700 mb-1">Full Name *</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.full_name}
            onChange={(e) =>
              onChangeForm((f) => ({ ...f, full_name: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">
            National ID *
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.national_id}
            onChange={(e) =>
              onChangeForm((f) => ({ ...f, national_id: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Phone</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.phone_number}
            onChange={(e) =>
              onChangeForm((f) => ({ ...f, phone_number: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">TIN</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.tin_number}
            onChange={(e) =>
              onChangeForm((f) => ({ ...f, tin_number: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
);

export const OwnerDocsUploadModal = ({
  ownerId,
  onClose,
  onRefresh,
}: {
  ownerId: string;
  onClose: () => void;
  onRefresh: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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

      <div className="p-8">
        <GenericDocsUpload
          title="Owner supporting documents"
          upin=""
          subCity=""
          ownerId={ownerId}
          hideTitle={true}
          allowedDocTypes={[
            { value: "ID_COPY", label: "National ID Copy" },
            { value: "PASSPORT_PHOTO", label: "Passport-size Photo" },
            { value: "TIN_CERT", label: "TIN Certificate" },
            { value: "POWER_OF_ATTORNEY", label: "Power of Attorney" },
            { value: "OTHER", label: "Other Document" },
          ]}
          onUploadSuccess={onRefresh}
        />
      </div>

      <div className="p-8 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-between items-center">
        <button
          onClick={onClose}
          className="text-sm text-gray-600 hover:text-gray-900 underline transition"
        >
          Skip for now
        </button>

        <button
          onClick={() => {
            onClose();
            onRefresh();
          }}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          Done – Close
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  </div>
);

export const EditOwnerModal = ({
  saving,
  form,
  onChangeForm,
  onClose,
  onSave,
}: {
  saving: boolean;
  form: {
    full_name: string;
    national_id: string;
    tin_number: string;
    phone_number: string;
  };
  onChangeForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onClose: () => void;
  onSave: () => void;
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-sm">
      <h2 className="text-lg font-semibold mb-4">Edit Owner</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-gray-700 mb-1">Full Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.full_name}
            onChange={(e) =>
              onChangeForm((f) => ({ ...f, full_name: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">National ID</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.national_id}
            onChange={(e) =>
              onChangeForm((f) => ({ ...f, national_id: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Phone</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.phone_number}
            onChange={(e) =>
              onChangeForm((f) => ({ ...f, phone_number: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">TIN</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.tin_number}
            onChange={(e) =>
              onChangeForm((f) => ({ ...f, tin_number: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
);

export const DeleteOwnerModal = ({
  saving,
  owner,
  onClose,
  onConfirm,
}: {
  saving: boolean;
  owner: OwnerWithParcels;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-sm">
      <h2 className="text-lg font-semibold mb-4 text-red-700">
        Delete Owner
      </h2>
      <p className="mb-4 text-gray-700">
        Are you sure you want to delete owner{" "}
        <span className="font-semibold">{owner.full_name}</span>? Owners
        with active parcels cannot be deleted.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);
