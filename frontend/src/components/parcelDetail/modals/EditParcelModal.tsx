// src/modals/EditParcelModal.tsx
import { useEffect, useState } from "react";
import { updateParcelApi } from "../../../services/parcelDetailApi";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import {
  EditParcelFormSchema,
  type EditParcelFormData,
} from "../../../validation/schemas";
import { z } from "zod";

type Props = {
  parcel: ParcelDetail;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

const EditParcelModal = ({ parcel, open, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && parcel) {
      setForm({
        file_number: parcel.file_number || "",
        sub_city: parcel.sub_city || "",
        tabia: parcel.tabia || "",
        ketena: parcel.ketena || "",
        block: parcel.block || "",
        total_area_m2: parcel.total_area_m2?.toString() || "",
        land_use: parcel.land_use || "",
        land_grade: parcel.land_grade?.toString() || "",
        tenure_type: parcel.tenure_type || "",
      });
      setError(null);
    }
  }, [open, parcel]);

  const handleSave = async () => {
    try {
      setError(null);

      const parsed = EditParcelFormSchema.parse({
        file_number: form.file_number,
        sub_city: form.sub_city,
        tabia: form.tabia,
        ketena: form.ketena,
        block: form.block,
        total_area_m2: form.total_area_m2,
        land_use: form.land_use,
        land_grade: form.land_grade,
        tenure_type: form.tenure_type || undefined,
      }) as EditParcelFormData;

      await updateParcelApi(parcel.upin, parsed);
      await onSuccess();
      onClose();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        
        setError(err.issues[0].message || "Validation failed");
      } else {
        alert(err.message || "Failed to update parcel");
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-6">Edit Parcel</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(form).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                {key.replace(/_/g, " ")}
              </label>
              <input
                type={key.includes("area") || key.includes("grade") ? "number" : "text"}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditParcelModal;
