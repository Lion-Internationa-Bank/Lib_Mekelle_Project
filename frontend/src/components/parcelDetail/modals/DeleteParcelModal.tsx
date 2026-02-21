// src/modals/DeleteParcelModal.tsx
import { useState } from "react";
import { deleteParcelApi } from "../../../services/parcelDetailApi";
import { toast } from "sonner";

type Props = {
  upin: string;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteParcelModal = ({ upin, open, onClose, onDeleted }: Props) => {
  const [input, setInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (input !== upin) return;
    try {
      setDeleting(true);
   const res =    await deleteParcelApi(upin);
    toast.success(res.message || "Successfully deleted Land parcel")
      onDeleted();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Confirm Parcel Deletion</h2>
        <p className="text-[#2a2718] mb-6">
          This action <strong>cannot be undone</strong>. All associated data will be permanently deleted.
        </p>

        <div className="mb-8">
          <p className="text-sm text-[#2a2718]/70 mb-2">Type the UPIN to confirm:</p>
          <code className="block p-3 bg-[#f0cd6e]/10 rounded-lg font-mono text-lg text-center border border-[#f0cd6e]">
            {upin}
          </code>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter UPIN"
            className="mt-4 w-full px-4 py-3 border border-[#f0cd6e] rounded-lg text-center font-mono focus:ring-2 focus:ring-[#f0cd6e]"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              onClose();
              setInput("");
            }}
            className="px-6 py-3 rounded-lg border border-[#f0cd6e] text-[#2a2718] hover:bg-[#f0cd6e]/20"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={input !== upin || deleting}
            className="px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: input === upin ? "#dc2626" : "#9ca3af" }}
          >
            {deleting ? "Deleting..." : "Permanently Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteParcelModal;