// src/modals/EncumbranceModal.tsx
import { useEffect, useState } from "react";
import { createEncumbranceApi, updateEncumbranceApi } from "../../../services/parcelDetailApi";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Encumbrance = ParcelDetail["encumbrances"][number];

type Props = {
  upin: string;
  encumbrance?: Encumbrance | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

const EncumbranceModal = ({ upin, encumbrance, open, onClose, onSuccess }: Props) => {
  const isEdit = !!encumbrance;

  const [form, setForm] = useState({
    type: "",
    issuing_entity: "",
    reference_number: "",
    status: "ACTIVE",
    registration_date: "",
  });

  useEffect(() => {
    if (open && isEdit && encumbrance) {
      setForm({
        type: encumbrance.type || "",
        issuing_entity: encumbrance.issuing_entity || "",
        reference_number: encumbrance.reference_number || "",
        status: encumbrance.status || "ACTIVE",
        registration_date: encumbrance.registration_date?.slice(0, 10) || "",
      });
    } else if (open && !isEdit) {
      setForm({ type: "", issuing_entity: "", reference_number: "", status: "ACTIVE", registration_date: "" });
    }
  }, [open, isEdit, encumbrance]);

  const handleSubmit = async () => {
    if (!form.type || !form.issuing_entity) {
      alert("Type and issuing entity are required");
      return;
    }

    try {
      if (isEdit) {
        await updateEncumbranceApi(encumbrance!.encumbrance_id, form);
      } else {
        await createEncumbranceApi({
          upin,
          type: form.type,
          issuing_entity: form.issuing_entity,
          reference_number: form.reference_number || undefined,
          registration_date: form.registration_date || undefined,
        });
      }
      await onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Operation failed");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full my-8">
        <h2 className="text-xl font-bold mb-6">
          {isEdit ? "Edit Encumbrance" : "Add New Encumbrance"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select type</option>
              <option value="MORTGAGE">Mortgage</option>
              <option value="COURT_FREEZE">Court Freeze</option>
              <option value="GOVT_RESERVATION">Govt Reservation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Entity *</label>
            <input
              value={form.issuing_entity}
              onChange={(e) => setForm({ ...form, issuing_entity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
            <input
              value={form.reference_number}
              onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ACTIVE">Active</option>
              <option value="RELEASED">Released</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
            <input
              type="date"
              value={form.registration_date}
              onChange={(e) => setForm({ ...form, registration_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.type || !form.issuing_entity}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncumbranceModal;