// src/components/common/DocumentList.tsx
import React from 'react';
import DocumentCard from './DocumentCard';
import { type Document, isDocument } from '../../utils/documentHelpers';

interface DocumentListProps {
  documents: Document[] | any[];
  title?: string;
  variant?: 'compact' | 'full';
  showUploadInfo?: boolean;
  emptyMessage?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  title = "Documents",
  variant = 'compact',
  showUploadInfo = false,
  emptyMessage = "No documents uploaded."
}) => {
  // Filter out non-document objects and ensure it's an array
  const validDocuments = Array.isArray(documents) 
    ? documents.filter(isDocument)
    : [];

  if (validDocuments.length === 0) {
    return (
      <div>
        {title && <h4 className="text-xs font-semibold text-[#2a2718]/70 mb-2">{title}</h4>}
        <p className="text-sm text-[#2a2718]/70">{emptyMessage}</p>
      </div>
    );
  }

  // Compact variant - list view
  if (variant === 'compact') {
    return (
      <div>
        {title && (
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-[#2a2718]/70">{title}</h4>
            <span className="text-xs text-[#2a2718]/70">{validDocuments.length} file(s)</span>
          </div>
        )}
        <ul className="divide-y divide-[#f0cd6e] rounded-xl border border-[#f0cd6e] bg-white">
          {validDocuments.map((doc, index) => (
            <DocumentCard
              key={doc.id || doc.doc_id || index}
              document={doc}
              variant="compact"
              showUploadInfo={showUploadInfo}
            />
          ))}
        </ul>
      </div>
    );
  }

  // Full variant - grid view
  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-[#2a2718]">{title}</h4>
          <span className="text-xs bg-[#f0cd6e]/20 text-[#2a2718] px-2 py-1 rounded-full border border-[#f0cd6e]">
            {validDocuments.length} file(s)
          </span>
        </div>
      )}
      <div className="space-y-3">
        {validDocuments.map((doc, index) => (
          <DocumentCard
            key={doc.id || doc.doc_id || index}
            document={doc}
            variant="full"
            showUploadInfo={showUploadInfo}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentList;