import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { SimpleStepProps } from "../../types/wizard";
import { uploadDocument } from "../../services/parcelApi";

interface OwnerDocsStepProps {
  upin: string;
  subCity: string;
  ownerId: string;
  nextStep: () => void;
  prevStep: () => void;
}

type UploadStatus = "uploading" | "success" | "error";

interface OwnerDocItem {
  id: string;
  document_type: string;
  file_name: string;
  status: UploadStatus;
}

const ownerDocumentTypes = [
  { value: "OWNER_ID_COPY", label: "Owner ID Copy" },

];

const OwnerDocsStep = ({ nextStep, prevStep }: SimpleStepProps) => {
    const [searchParams] = useSearchParams();
const upin = searchParams.get("upin") || "";
const subCity = searchParams.get("sub_city") || "";
const ownerId = searchParams.get("owner_id") || "";

  const [documents, setDocuments] = useState<OwnerDocItem[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const newDoc: OwnerDocItem = {
      id: tempId,
      document_type: documentType,
      file_name: file.name,
      status: "uploading",
    };

    setDocuments(prev => [...prev, newDoc]);
    setUploadingId(tempId);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("document_type", documentType);
      formData.append("upin", upin);
      formData.append("sub_city", subCity);
      formData.append("owner_id", ownerId);
      formData.append("lease_id", "");
      formData.append("is_lease", "false");

      const res = await uploadDocument(formData); // expects success + data[web:56]
      if (res.success) {
        setDocuments(prev =>
          prev.map(d =>
            d.id === tempId ? { ...d, status: "success" } : d
          )
        );
      } else {
        setDocuments(prev =>
          prev.map(d =>
            d.id === tempId ? { ...d, status: "error" } : d
          )
        );
      }
    } catch (err) {
      setDocuments(prev =>
        prev.map(d =>
          d.id === tempId ? { ...d, status: "error" } : d
        )
      );
    } finally {
      setUploadingId(null);
      e.target.value = "";
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Owner Documents
      </h2>
      <p className="text-gray-600 mb-8">
        Upload documents for owner of{" "}
        <span className="font-semibold text-blue-600">{upin}</span>{" "}
        <span className="text-gray-500">({subCity})</span>
      </p>

      {/* Uploaded list */}
      <div className="space-y-3 mb-8">
        {documents.map(doc => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className={
                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold " +
                  (doc.status === "success"
                    ? "bg-green-100 text-green-700"
                    : doc.status === "uploading"
                    ? "bg-blue-100 text-blue-700 animate-pulse"
                    : "bg-red-100 text-red-700")
                }
              >
                {doc.status === "success"
                  ? "✅"
                  : doc.status === "uploading"
                  ? "⏳"
                  : "❌"}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {doc.document_type.replace(/_/g, " ")}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {doc.file_name}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeDocument(doc.id)}
              className="ml-3 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <p className="text-sm text-gray-500">
            No documents uploaded yet. Use the buttons below to add PDFs.
          </p>
        )}
      </div>

      {/* Upload controls */}
      <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-6 mb-10 bg-white/60">
        <p className="font-semibold text-gray-800 mb-4">
          Add a document (single file each time)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ownerDocumentTypes.map(type => (
            <label
              key={type.value}
              className="relative cursor-pointer group"
            >
              <div className="p-4 rounded-xl border border-gray-200 group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-colors flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    PDF / image, single file
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center text-indigo-600 text-lg">
                  +
                </div>
              </div>
              <input
                type="file"
                accept="application/pdf,image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => handleFileUpload(e, type.value)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end  pt-4">
      
        <button
          type="button"
          disabled={!!uploadingId}
          onClick={nextStep}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          Continue to Lease
          {uploadingId && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
        </button>
      </div>
    </>
  );
};

export default OwnerDocsStep;
