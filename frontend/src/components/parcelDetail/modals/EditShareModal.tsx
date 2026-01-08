// src/modals/EditShareModal.tsx
import { useState, useEffect } from "react";
import { updateOwnerShareApi } from "../../../services/parcelDetailApi";
import {
  EditShareFormSchema,
  type EditShareFormData,
} from "../../../validation/schemas";
import { z } from "zod";

type Props = {
  parcelOwnerId: string;
  currentShare: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

const EditShareModal = ({
  parcelOwnerId,
  currentShare,
  open,
  onClose,
  onSuccess,
}: Props) => {
  const [share, setShare] = useState(currentShare);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setShare(currentShare);
      setError(null);
    }
  }, [open, currentShare]);

  const handleSave = async () => {
    try {
      setError(null);
      const parsed = EditShareFormSchema.parse({
        share_ratio: share,
      }) as EditShareFormData;

      await updateOwnerShareApi(parcelOwnerId, parsed.share_ratio);
      await onSuccess();
      onClose();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
         const firstIssue = err.issues[0];
    setError(firstIssue?.message || "Validation failed");
      } else {
        alert(err.message || "Update failed");
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-6">Update Share Ratio</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={share}
          onChange={(e) => setShare(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
        />
        <div className="flex justify-end gap-4">
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditShareModal;
