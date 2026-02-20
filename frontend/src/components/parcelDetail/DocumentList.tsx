// components/DocumentList.tsx
import type { ParcelDocument } from "../../services/parcelDetailApi";
import { openDocument } from "../../services/documentService";

interface DocumentListProps {
  documents: ParcelDocument[];
  title?: string;
}

const DocumentList = ({ documents, title = "Documents" }: DocumentListProps) => {
  const handleViewDocument = (doc: ParcelDocument) => {
    openDocument(doc.file_url);
  };

  if (!documents || documents.length === 0) {
    return <p className="text-sm text-gray-500">No {title.toLowerCase()} uploaded.</p>;
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 mb-2">{title}</h4>
      <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        {documents.map((doc) => (
          <li key={doc.doc_id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium text-gray-900 truncate max-w-xs">{doc.file_name}</div>
              <div className="text-xs text-gray-500">
                {doc.doc_type} • {new Date(doc.upload_date).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => handleViewDocument(doc)}
              className="ml-3 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;