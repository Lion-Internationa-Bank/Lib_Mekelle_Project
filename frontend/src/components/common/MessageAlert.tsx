// src/components/common/MessageAlert.tsx
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface MessageAlertProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const MessageAlert = ({ type, message, onClose }: MessageAlertProps) => {
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';

  return (
    <div className={`${bgColor} border rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`w-8 h-8 ${iconColor.replace('text-', 'bg-')}100 rounded-full flex items-center justify-center`}>
        {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      </div>
      <p className={`${textColor} font-medium flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MessageAlert;