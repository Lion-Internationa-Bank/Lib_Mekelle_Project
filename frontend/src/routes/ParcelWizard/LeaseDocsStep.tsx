import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { FinishStepProps } from "../../types/wizard";
import { uploadDocument } from "../../services/parcelApi";
import {toast} from 'sonner';


type UploadStatus = "uploading" | "success" | "error";

interface LeaseDocItem {
  id: string;
  document_type: string;
  file_name: string;
  status: UploadStatus;
}

const leaseDocumentTypes = [
  { value: "LEASE_CONTRACT", label: "Lease Contract" },

];

const LeaseDocsStep = ({ prevStep, onFinish }: FinishStepProps) => {

  const [documents, setDocuments] = useState<LeaseDocItem[]>([]);
  const [searchParams] = useSearchParams();
  const upin = searchParams.get("upin") || "";
const subCity = searchParams.get("sub_city") || "";
const leaseId = searchParams.get("lease_id") || "";
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const newDoc: LeaseDocItem = {
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
      formData.append("owner_id", "");
      formData.append("lease_id", leaseId);
      formData.append("is_lease", "true");

      const res = await uploadDocument(formData);
      if (res.success) {
          toast.success( `upload ${documentType}  document successfuly`)
        setDocuments(prev =>
          prev.map(d => (d.id === tempId ? { ...d, status: "success" } : d))
        );
      } else {
        setDocuments(prev =>
          prev.map(d => (d.id === tempId ? { ...d, status: "error" } : d))
        );
      }
    } catch (err) {
        toast.error('Upload failed')
      setDocuments(prev =>
        prev.map(d => (d.id === tempId ? { ...d, status: "error" } : d))
      );
    } finally {
      setUploadingId(null);
      e.target.value = "";
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const finishWizard = () => {
    onFinish();
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Lease Documents</h2>
      <p className="text-gray-600 mb-8">
        Upload lease documents for{" "}
        <span className="font-semibold text-purple-600">{upin}</span>{" "}
        <span className="text-gray-500">({subCity})</span>
      </p>

      {/* Uploaded list */}
      <div className="space-y-3 mb-8">
        {documents.map(doc => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className={
                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold " +
                  (doc.status === "success"
                    ? "bg-green-100 text-green-700"
                    : doc.status === "uploading"
                    ? "bg-purple-100 text-purple-700 animate-pulse"
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
            No lease documents uploaded yet. Use the buttons below to add PDFs.
          </p>
        )}
      </div>

      {/* Upload controls */}
      <div className="border-2 border-dashed border-purple-300 rounded-2xl p-6 mb-10 bg-white/60">
        <p className="font-semibold text-gray-800 mb-4">
          Add lease document (single file each time)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {leaseDocumentTypes.map(type => (
            <label key={type.value} className="relative cursor-pointer group">
              <div className="p-4 rounded-xl border border-gray-200 group-hover:border-purple-400 group-hover:bg-purple-50 transition-colors flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    PDF / image, single file
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-600 text-lg">
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
      <div className="flex justify-end pt-4">
       
        <button
          type="button"
          disabled={!!uploadingId}
          onClick={finishWizard}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          Finish & Go to Dashboard
          {uploadingId && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
        </button>
      </div>
    </>
  );
};

export default LeaseDocsStep;
