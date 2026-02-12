import React from 'react';
import { type Document, formatFileSize, formatDate } from '../../utils/documentHelpers';

const VITE_API_PDF_URL = import.meta.env.VITE_API_PDF_URL || import.meta.env.VITE_API_URL || '';

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

  const openDocument = () => {
    if (!file_url) return;
    const baseUrl = VITE_API_PDF_URL.endsWith('/') ? VITE_API_PDF_URL.slice(0, -1) : VITE_API_PDF_URL;
    const urlPath = file_url.startsWith('/') ? file_url : `/${file_url}`;
    const url = `${baseUrl}${urlPath}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Compact variant - list item style
  if (variant === 'compact') {
    return (
      <li className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate max-w-xs">
            {file_name || 'Unnamed Document'}
          </div>
          <div className="text-xs text-gray-500">
            {document_type?.replace(/_/g, ' ') || 'Document'}
            {file_size && ` • ${formatFileSize(file_size)}`}
            {mime_type && ` • ${mime_type.split('/').pop()?.toUpperCase()}`}
            {showUploadInfo && metadata?.uploaded_at && ` • ${formatDate(metadata.uploaded_at)}`}
          </div>
        </div>
        <button
          onClick={openDocument}
          className="ml-3 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          View
        </button>
      </li>
    );
  }

  // Full variant - card style
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📄</span>
            <div>
              <div className="font-medium text-gray-900 truncate max-w-md">
                {file_name || 'Unnamed Document'}
              </div>
              {document_type && (
                <span className="text-xs text-gray-500">
                  {document_type.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
            {file_size && (
              <>
                <span className="text-gray-500">Size:</span>
                <span className="font-medium text-gray-900">{formatFileSize(file_size)}</span>
              </>
            )}
            {mime_type && (
              <>
                <span className="text-gray-500">Type:</span>
                <span className="font-medium text-gray-900">
                  {mime_type.split('/').pop()?.toUpperCase()}
                </span>
              </>
            )}
            {metadata?.uploaded_at && (
              <>
                <span className="text-gray-500">Uploaded:</span>
                <span className="font-medium text-gray-900">{formatDate(metadata.uploaded_at)}</span>
              </>
            )}
            {metadata?.uploaded_by_role && (
              <>
                <span className="text-gray-500">Uploaded by:</span>
                <span className="font-medium text-gray-900">
                  {metadata.uploaded_by_role.replace(/_/g, ' ')}
                </span>
              </>
            )}
          </div>
        </div>
        
        <button
          onClick={openDocument}
          className="ml-3 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          View Document
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;