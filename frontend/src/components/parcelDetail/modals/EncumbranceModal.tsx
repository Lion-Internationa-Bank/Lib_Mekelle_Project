import { useEffect, useState } from "react";
import {
  createEncumbranceApi,
  updateEncumbranceApi,
} from "../../../services/parcelDetailApi";
import {
  getConfig,
  type ConfigOption,
} from "../../../services/cityAdminService";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import {
  EncumbranceFormSchema,
  type EncumbranceFormData,
} from "../../../validation/schemas";
import { ZodError } from "zod";
import { toast } from "sonner";

type Encumbrance = ParcelDetail["encumbrances"][number];

type Props = {
  upin: string;
  encumbrance?: Encumbrance | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (result?: any) => Promise<void>;
};

const EncumbranceModal = ({
  upin,
  encumbrance,
  open,
  onClose,
  onSuccess,
}: Props) => {
  const isEdit = !!encumbrance;

  const [form, setForm] = useState<EncumbranceFormData>({
    type: "",
    issuing_entity: "",
    reference_number: "",
    status: "ACTIVE",
    registration_date: "",
  });

  const [encumbranceTypes, setEncumbranceTypes] = useState<ConfigOption[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesError, setTypesError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch encumbrance types from backend
  useEffect(() => {
    if (!open) return;

    const loadTypes = async () => {
      setLoadingTypes(true);
      setTypesError(null);
      const res = await getConfig("ENCUMBRANCE_TYPE");
      if (res.success && res.data?.options) {
        setEncumbranceTypes(res.data.options);
        // Pre-select type if editing
        if (isEdit && encumbrance) {
          setForm({
            type: encumbrance.type as EncumbranceFormData["type"],
            issuing_entity: encumbrance.issuing_entity || "",
            reference_number: encumbrance.reference_number || "",
            status: encumbrance.status as EncumbranceFormData["status"],
            registration_date: encumbrance.registration_date?.slice(0, 10) || "",
          });
        }
      } else {
        setTypesError(res.error || "Failed to load encumbrance types");
      }
      setLoadingTypes(false);
    };

    loadTypes();
  }, [open, isEdit, encumbrance]);

  const handleSubmit = async () => {
    try {
      setError(null);
      setSaving(true);

      const parsed = EncumbranceFormSchema.parse(form);

      if (isEdit && encumbrance) {
        const res = await updateEncumbranceApi(encumbrance.encumbrance_id, parsed);
        if (res.success) {
          toast.success(res.message || "Encumbrance updated successfully");
          await onSuccess(res.data);
        } else {
          throw new Error(res.error || "Failed to update encumbrance");
        }
      } else {
        const result = await createEncumbranceApi({
          ...parsed,
          upin,
        });

        console.log("Create encumbrance result:", result);
        
        if (result.success) {
          // Check if approval is required
          if (result.data?.approval_request_id) {
            toast.info(result.message || "Encumbrance creation request submitted for approval");
            await onSuccess({
              approval_request_id: result.data.approval_request_id,
              ...result.data
            });
          } else if (result.data?.encumbrance_id) {
            // Immediate execution (self-approval or no approval needed)
            toast.success(result.message || "Encumbrance created successfully");
            await onSuccess({
              encumbrance_id: result.data.encumbrance_id,
              ...result.data
            });
          } else {
            // Fallback - try to extract ID from response
            const createdId = result.data?.encumbrance_id || result.data?.id || result.id;
            toast.success(result.message || "Encumbrance created successfully");
            await onSuccess({
              encumbrance_id: createdId,
              ...result.data
            });
          }
        } else {
          throw new Error(result.error || "Failed to create encumbrance");
        }
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMsg = err.issues[0]?.message || "Validation failed";
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message || "Operation failed");
      } else {
        setError("An unexpected error occurred");
        toast.error("Operation failed");
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

        {typesError && !loadingTypes && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
            {typesError}
          </div>
        )}

        <div className="space-y-4">
          {/* Type - Dynamic from backend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            {loadingTypes ? (
              <div className="text-sm text-gray-500">Loading types...</div>
            ) : encumbranceTypes.length === 0 ? (
              <div className="text-sm text-gray-500">No types available</div>
            ) : (
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as EncumbranceFormData["type"],
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select type</option>
                {encumbranceTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value} {opt.description ? `(${opt.description})` : ""}
                  </option>
                ))}
              </select>
            )}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            disabled={saving}
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