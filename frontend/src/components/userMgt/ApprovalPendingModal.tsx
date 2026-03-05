// src/components/userMgt/ApprovalPendingModal.tsx
import React from 'react';
import { X, Clock } from 'lucide-react';
import { useTranslate } from '../../i18n/useTranslate';

interface ApprovalPendingModalProps {
  isOpen: boolean;
  request: {
    request_id: string;
    status: string;
    entity_type: string;
    action: string;
  } | null;
  onClose: () => void;
}

const ApprovalPendingModal: React.FC<ApprovalPendingModalProps> = ({ isOpen, request, onClose }) => {
  const { t } = useTranslate('users');

  if (!isOpen || !request) return null;

  const getActionMessage = () => {
    const actionMap: Record<string, string> = {
      CREATE: 'creation',
      UPDATE: 'update',
      DELETE: 'deletion',
      SUSPEND: 'suspension',
      ACTIVATE: 'activation',
    };
    return actionMap[request.action] || request.action.toLowerCase();
  };

  const getEntityMessage = () => {
    const entityMap: Record<string, string> = {
      USERS: 'User',
    };
    return entityMap[request.entity_type] || request.entity_type;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#2a2718]/50 hover:text-[#2a2718] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          
          <h3 className="text-xl font-bold text-[#2a2718] mb-2">
            {t('approvalModal.title')}
          </h3>
          
          <p className="text-[#2a2718]/70 mb-4">
            {t('approvalModal.message', { 
              entity: getEntityMessage().toLowerCase(), 
              action: getActionMessage() 
            })}
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#2a2718]/60">{t('approvalModal.requestId')}:</span>
              <span className="text-sm font-mono text-[#2a2718]">{request.request_id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#2a2718]/60">{t('approvalModal.status')}:</span>
              <span className="text-sm font-medium text-yellow-600">{t('approvalModal.pending')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#2a2718]/60">{t('approvalModal.action')}:</span>
              <span className="text-sm text-[#2a2718]">{request.action}</span>
            </div>
          </div>
          
          <p className="text-sm text-[#2a2718]/60 mb-4">
            {t('approvalModal.notification')}
          </p>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#f0cd6e] text-[#2a2718] rounded-xl hover:bg-[#f0cd6e]/80 transition-colors font-medium"
          >
            {t('approvalModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPendingModal;