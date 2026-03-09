// src/components/parcelDetail/modals/DeleteParcelModal.tsx
import { useState } from "react";
import { deleteParcelApi } from "../../../services/parcelDetailApi";
import { toast } from "sonner";
import { useTranslate } from "../../../i18n/useTranslate";

type Props = {
  upin: string;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteParcelModal = ({ upin, open, onClose, onDeleted }: Props) => {
  const { t } = useTranslate('parcelDetail');
  const [input, setInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (input !== upin) return;
    try {
      setDeleting(true);
      const res = await deleteParcelApi(upin);
      toast.success(res.message || t('deleteModal.success'));
      onDeleted();
    } catch (err: any) {
      toast.error(err.message || t('deleteModal.error'));
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-red-700 mb-4">
          {t('deleteModal.title')}
        </h2>
        <p className="text-[#2a2718] mb-6">
          {t('deleteModal.warning')} <strong>{t('deleteModal.cannotUndo')}</strong> {t('deleteModal.description')}
        </p>

        <div className="mb-8">
          <p className="text-sm text-[#2a2718]/70 mb-2">
            {t('deleteModal.confirmPrompt')}
          </p>
          <code className="block p-3 bg-[#f0cd6e]/10 rounded-lg font-mono text-lg text-center border border-[#f0cd6e]">
            {upin}
          </code>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('deleteModal.inputPlaceholder')}
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
            {t('deleteModal.cancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={input !== upin || deleting}
            className="px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: input === upin ? "#dc2626" : "#9ca3af" }}
          >
            {deleting ? t('deleteModal.deleting') : t('deleteModal.confirmDelete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteParcelModal;