// src/modals/EncumbranceModal.tsx
import { useEffect, useState } from "react";
import {
  createEncumbranceApi,
  updateEncumbranceApi,
} from "../../../services/parcelDetailApi";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import {
  EncumbranceFormSchema,
  type EncumbranceFormData,
} from "../../../validation/schemas";
import { ZodError } from "zod";

type Encumbrance = ParcelDetail["encumbrances"][number];

type Props = {
  upin: string;
  encumbrance?: Encumbrance | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (encumbranceId?: string) => Promise<void>;
};

const EncumbranceModal = ({
  upin,
  encumbrance,
  open,
  onClose,
  onSuccess,
}: Props) => {
  const isEdit = !!encumbrance;

  const [form, setForm] = useState({
    type: "" as EncumbranceFormData["type"] | "",
    issuing_entity: "",
    reference_number: "",
    status: "ACTIVE" as EncumbranceFormData["status"],
    registration_date: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isEdit && encumbrance) {
      setForm({
        type: (encumbrance.type as EncumbranceFormData["type"]) || "",
        issuing_entity: encumbrance.issuing_entity || "",
        reference_number: encumbrance.reference_number || "",
        status: (encumbrance.status as EncumbranceFormData["status"]) || "ACTIVE",
        registration_date: encumbrance.registration_date?.slice(0, 10) || "",
      });
    } else {
      setForm({
        type: "",
        issuing_entity: "",
        reference_number: "",
        status: "ACTIVE",
        registration_date: "",
      });
    }
    setError(null);
  }, [open, isEdit, encumbrance]);

  const handleSubmit = async () => {
    try {
      setError(null);
      setSaving(true);

      const parsed = EncumbranceFormSchema.parse(form) as EncumbranceFormData;

      if (isEdit && encumbrance) {
        await updateEncumbranceApi(encumbrance.encumbrance_id, parsed);
        await onSuccess();
      } else {
        const result = await createEncumbranceApi({
          ...parsed,
          upin,
        });

        const createdId =
          result.data?.encumbrance_id || result.data?.id || result.id;
        if (createdId) {
          await onSuccess(createdId);
        } else {
          await onSuccess();
        }
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Validation failed");
      } else if (err instanceof Error) {
        setError(err.message || "Operation failed");
      } else {
        setError("Operation failed");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full my-8">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Encumbrance" : "Add New Encumbrance"}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as EncumbranceFormData["type"] | "",
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select type</option>
              <option value="MORTGAGE">Mortgage</option>
              <option value="COURT_FREEZE">Court Freeze</option>
              <option value="GOVT_RESERVATION">Govt Reservation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuing Entity *
            </label>
            <input
              value={form.issuing_entity}
              onChange={(e) =>
                setForm((f) => ({ ...f, issuing_entity: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              value={form.reference_number}
              onChange={(e) =>
                setForm((f) => ({ ...f, reference_number: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as EncumbranceFormData["status"],
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ACTIVE">Active</option>
              <option value="RELEASED">Released</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Date
            </label>
            <input
              type="date"
              value={form.registration_date}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  registration_date: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.type || !form.issuing_entity}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncumbranceModal;
