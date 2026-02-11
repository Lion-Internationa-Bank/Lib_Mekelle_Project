// components/ApprovalRequestDocsModal.tsx
import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import GenericDocsUpload from './GenericDocsUpload';
import { toast } from 'sonner';

interface ApprovalRequestDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvalRequestId: string;
  title: string;
  description?: string;
  entityType: string;
  actionType: string;
  onComplete?: () => void;
}

const ApprovalRequestDocsModal: React.FC<ApprovalRequestDocsModalProps> = ({
  isOpen,
  onClose,
  approvalRequestId,
  title,
  description,
  entityType,
  actionType,
  onComplete,
}) => {
  const [documentsUploaded, setDocumentsUploaded] = useState(false);

  if (!isOpen) return null;

  // Determine allowed document types based on entity and action
  const getAllowedDocTypes = () => {
    const baseTypes = [
      { value: "SUPPORTING_DOCUMENT", label: "Supporting Document" },
      {value:"GENERAL_DOCUMENT" ,label: "General Document"},
      { value: "OTHER", label: "Other Document" },
    ];

    switch (entityType) {
      case 'OWNERS':
        return [
          { value: "ID_COPY", label: "National ID Copy" },
          { value: "TIN_CERT", label: "TIN Certificate" },
          ...baseTypes,
        ];
      
      case 'LAND_PARCELS':
        switch (actionType) {
          case 'TRANSFER':
            return [
              { value: "TRANSFER_CONTRACT", label: "Transfer Contract" },
              { value: "ID_COPY", label: "ID Copies (Both Parties)" },
              { value: "PAYMENT_PROOF", label: "Payment Receipt" },
              { value: "POWER_OF_ATTORNEY", label: "Power of Attorney" },
              ...baseTypes,
            ];
          
          case 'SUBDIVIDE':
            return [
              { value: "SUBDIVISION_PLAN", label: "Subdivision Plan" },
              { value: "SURVEY_REPORT", label: "Survey Report" },
              { value: "APPROVAL_LETTER", label: "Approval Letter" },
              ...baseTypes,
            ];
          
          case 'ADD_OWNER':
            return [
              { value: "OWNERSHIP_PROOF", label: "Ownership Proof" },
              { value: "ID_COPY", label: "Owner ID Copy" },
              ...baseTypes,
            ];
          
          default:
            return baseTypes;
        }
      
      case 'ENCUMBRANCES':
        return [
          { value: "ENCUMBRANCE_CERT", label: "Encumbrance Certificate" },
          { value: "COURT_ORDER", label: "Court Order" },
          { value: "AGREEMENT", label: "Agreement" },
          ...baseTypes,
        ];
      
      default:
        return baseTypes;
    }
  };

  const handleUploadSuccess = (documents: any[]) => {
    setDocumentsUploaded(documents.length > 0);
    toast.success(`${documents.length} document(s) uploaded`);
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <FileText size={14} />
              <span>Request ID: <code className="font-mono bg-gray-100 px-2 py-0.5 rounded">{approvalRequestId}</code></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Document Upload Guidelines:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Upload supporting documents for the approver's review</li>
                <li>Documents will be permanently linked after approval</li>
                <li>You can delete documents before approval</li>
                <li>Maximum file size: 10MB per file</li>
                <li>Supported formats: PDF, JPG, PNG, DOC, XLS</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <GenericDocsUpload
            title=""
            approvalRequestId={approvalRequestId}
            isApprovalRequest={true}
            hideTitle={true}
            allowedDocTypes={getAllowedDocTypes()}
            allowDelete={true}
            showExisting={true}
            maxFiles={5}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {documentsUploaded ? (
              <span className="flex items-center gap-2 text-green-600">
                <Upload size={16} />
                Documents ready for review
              </span>
            ) : (
              <span className="text-gray-500">No documents uploaded yet</span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              Complete
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalRequestDocsModal;