// src/modals/EditOwnerModal.tsx
import { useEffect, useState } from "react";
import { updateOwnerApi } from "../../../services/parcelDetailApi";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import {
  EditOwnerFormSchema,
  type EditOwnerFormData,
} from "../../../validation/schemas";
import { z } from "zod";
import { toast } from "sonner";

type Owner = ParcelDetail["owners"][number]["owner"];

type Props = {
  owner: Owner;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

const EditOwnerModal = ({ owner, open, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState({
    full_name: "",
    national_id: "",
    phone_number: "",
    tin_number: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && owner) {
      setForm({
        full_name: owner.full_name || "",
        national_id: owner.national_id || "",
        phone_number: owner.phone_number || "",
        tin_number: owner.tin_number || "",
      });
      setError(null);
    }
  }, [open, owner]);

  const handleSave = async () => {
    try {
      setError(null);
      const parsed = EditOwnerFormSchema.parse({
        full_name: form.full_name || undefined,
        national_id: form.national_id || undefined,
        phone_number: form.phone_number || undefined,
        tin_number: form.tin_number || undefined,
      }) as EditOwnerFormData;

     const res = await updateOwnerApi(owner.owner_id, parsed);
      
      await onSuccess();
      toast.success(res.message || "Owner updated successfuly")
      onClose();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || "Validation failed");
      } else {
        toast.error(err.message || "Update failed")
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-[#2a2718] mb-6">Edit Owner</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {Object.keys(form).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[#2a2718] capitalize mb-1">
                {key.replace(/_/g, " ")}
              </label>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-[#f0cd6e] text-[#2a2718] hover:bg-[#f0cd6e]/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] text-white hover:from-[#2a2718] hover:to-[#f0cd6e]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOwnerModal;