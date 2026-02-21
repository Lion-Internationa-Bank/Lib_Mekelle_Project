// src/components/common/DocumentCard.tsx
import React from 'react';
import { type Document, formatFileSize, formatDate } from '../../utils/documentHelpers';
import { openDocument } from '../../services/documentService';

interface DocumentCardProps {
  document: Document;
  variant?: 'compact' | 'full';
  showUploadInfo?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  variant = 'compact',
  showUploadInfo = false
}) => {
  const {
    file_url,
    file_name,
    file_size,
    mime_type,
    document_type,
    metadata
  } = document;

  const handleOpenDocument = (file_url: string) => {
    console.log("handle open document hitted ", file_url);
    openDocument(file_url);
  };

  // Compact variant - list item style
  if (variant === 'compact') {
    return (
      <li className="flex items-center justify-between px-4 py-3 text-sm hover:bg-[#f0cd6e]/10">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[#2a2718] truncate max-w-xs">
            {file_name || 'Unnamed Document'}
          </div>
          <div className="text-xs text-[#2a2718]/70">
            {document_type?.replace(/_/g, ' ') || 'Document'}
            {file_size && ` • ${formatFileSize(file_size)}`}
            {mime_type && ` • ${mime_type.split('/').pop()?.toUpperCase()}`}
            {showUploadInfo && metadata?.uploaded_at && ` • ${formatDate(metadata.uploaded_at)}`}
          </div>
        </div>
       {file_url &&(
         <button
          onClick={() => handleOpenDocument(file_url)}
          className="ml-3 px-3 py-1.5 text-xs font-semibold text-[#f0cd6e] border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/20 transition-colors"
        >
          View
        </button>
       )}
      </li>
    );
  }

  // Full variant - card style
  return (
    <div className="border border-[#f0cd6e] rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📄</span>
            <div>
              <div className="font-medium text-[#2a2718] truncate max-w-md">
                {file_name || 'Unnamed Document'}
              </div>
              {document_type && (
                <span className="text-xs text-[#2a2718]/70">
                  {document_type.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
            {file_size && (
              <>
                <span className="text-[#2a2718]/70">Size:</span>
                <span className="font-medium text-[#2a2718]">{formatFileSize(file_size)}</span>
              </>
            )}
            {mime_type && (
              <>
                <span className="text-[#2a2718]/70">Type:</span>
                <span className="font-medium text-[#2a2718]">
                  {mime_type.split('/').pop()?.toUpperCase()}
                </span>
              </>
            )}
            {metadata?.uploaded_at && (
              <>
                <span className="text-[#2a2718]/70">Uploaded:</span>
                <span className="font-medium text-[#2a2718]">{formatDate(metadata.uploaded_at)}</span>
              </>
            )}
            {metadata?.uploaded_by_role && (
              <>
                <span className="text-[#2a2718]/70">Uploaded by:</span>
                <span className="font-medium text-[#2a2718]">
                  {metadata.uploaded_by_role.replace(/_/g, ' ')}
                </span>
              </>
            )}
          </div>
        </div>
        
        {file_url &&(
          <button
            onClick={() => handleOpenDocument(file_url)}  // Fixed: Wrapped in arrow function
            className="ml-3 px-3 py-1.5 text-xs font-semibold text-[#f0cd6e] border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/20 transition-colors whitespace-nowrap"
          >
            View Document
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;