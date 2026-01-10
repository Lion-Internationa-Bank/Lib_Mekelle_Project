// src/components/admin/DeleteUserModal.tsx
import { Trash2, AlertCircle } from 'lucide-react';
import type { User } from '../../services/userService';

interface DeleteUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUserModal = ({ isOpen, user, onClose, onConfirm }: DeleteUserModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
        <p className="text-gray-600 mb-2">
          Are you sure you want to delete <span className="font-semibold">{user.full_name}</span>?
        </p>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            This action cannot be undone
          </p>
          <p className="text-xs text-red-600 mt-1">
            All user data will be permanently removed from the system.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;