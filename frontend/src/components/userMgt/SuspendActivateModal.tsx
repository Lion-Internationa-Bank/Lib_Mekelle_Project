// src/components/admin/SuspendActivateModal.tsx
import { UserX, UserCheck } from 'lucide-react';
import type { User } from '../../services/userService';

interface SuspendActivateModalProps {
  isOpen: boolean;
  user: User | null;
  suspend: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SuspendActivateModal = ({ isOpen, user, suspend, onClose, onConfirm }: SuspendActivateModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          suspend ? 'bg-red-100' : 'bg-green-100'
        }`}>
          {suspend ? (
            <UserX className="w-6 h-6 text-red-600" />
          ) : (
            <UserCheck className="w-6 h-6 text-green-600" />
          )}
        </div>
        <h3 className="text-xl font-bold text-[#2a2718] mb-2">
          {suspend ? 'Suspend User' : 'Activate User'}
        </h3>
        <p className="text-[#2a2718]/70 mb-2">
          Are you sure you want to {suspend ? 'suspend' : 'activate'} <span className="font-semibold">{user.full_name}</span>?
        </p>
        <p className="text-sm text-[#2a2718]/70 mb-6">
          {suspend
            ? 'This user will lose access to the system until activated again.'
            : 'This user will regain access to the system.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-[#f0cd6e]/10 text-[#2a2718] rounded-xl hover:bg-[#f0cd6e]/20 font-medium transition-colors border border-[#f0cd6e]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl text-white font-medium transition-colors ${
              suspend
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {suspend ? 'Suspend User' : 'Activate User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendActivateModal;