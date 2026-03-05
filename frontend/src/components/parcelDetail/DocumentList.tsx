// src/components/parcelDetail/DocumentList.tsx
import { useTranslate } from "../../i18n/useTranslate";
import type { ParcelDocument } from "../../services/parcelDetailApi";
import { openDocument } from "../../services/documentService";

interface DocumentListProps {
  documents: ParcelDocument[];
  title?: string;
}

const DocumentList = ({ documents, title }: DocumentListProps) => {
  const { t } = useTranslate('parcelDetail');
  const { t: tCommon } = useTranslate('common');
  
  const handleViewDocument = (doc: ParcelDocument) => {
    openDocument(doc.file_url);
  };

  const displayTitle = title || t('documents.title');

  if (!documents || documents.length === 0) {
    return <p className="text-sm text-[#2a2718]/70">{t('documents.empty', { title: displayTitle.toLowerCase() })}</p>;
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-[#2a2718]/70 mb-2">{displayTitle}</h4>
      <ul className="divide-y divide-[#f0cd6e] rounded-xl border border-[#f0cd6e] bg-white">
        {documents.map((doc) => (
          <li key={doc.doc_id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium text-[#2a2718] truncate max-w-xs">{doc.file_name}</div>
              <div className="text-xs text-[#2a2718]/70">
                {doc.doc_type} • {new Date(doc.upload_date).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => handleViewDocument(doc)}
              className="ml-3 px-3 py-1.5 text-xs font-semibold text-[#f0cd6e] border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/20"
            >
              {t('documents.view')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;