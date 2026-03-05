// src/components/userMgt/DeleteUserModal.tsx
import { Trash2, Clock } from 'lucide-react';
import type { User } from '../../services/userService';
import { useState } from 'react';
import { useTranslate } from '../../i18n/useTranslate';

interface DeleteUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting?: boolean;
}

const DeleteUserModal = ({ isOpen, user, onClose, onConfirm, isSubmitting = false }: DeleteUserModalProps) => {
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const [reason, setReason] = useState('');

  if (!isOpen || !user) return null;

  const handleConfirm = async () => {
    await onConfirm();
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-[#2a2718] mb-2">{t('deleteModal.title')}</h3>
        <p className="text-[#2a2718]/70 mb-2">
          {t('deleteModal.confirmMessage', { name: user.full_name })}
        </p>
        
        {/* Reason input for approval workflow */}
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-[#2a2718]/70 mb-1">
            {t('deleteModal.reasonLabel')}
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('deleteModal.reasonPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] focus:border-transparent"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-700 font-medium">
                {t('deleteModal.requiresApproval')}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                {t('deleteModal.approvalMessage')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#f0cd6e]/10 text-[#2a2718] rounded-xl hover:bg-[#f0cd6e]/20 font-medium transition-colors border border-[#f0cd6e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {tCommon('submitting')}
              </>
            ) : (
              t('deleteModal.confirmButton')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;