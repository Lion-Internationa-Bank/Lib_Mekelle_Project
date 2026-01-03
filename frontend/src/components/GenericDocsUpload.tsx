// components/GenericDocsUpload.tsx
import { useState } from "react";
import { uploadDocument } from "../services/parcelApi";
export type GenericDocType = string;

export interface GenericDocsUploadProps {
  upin: string;
  subCity: string;
  title: string;
  ownerId?: string;
  leaseId?: string;
  encumbranceId?: string;
  historyId?: string;
  allowedDocTypes: { value: GenericDocType; label: string }[];
  /** Called after each successful upload (e.g. to refresh data or show toast) */
  onUploadSuccess?: () => void;
  /** If provided, shows a "Continue" button at the bottom (for wizard steps) */
  onAllUploaded?: () => void;
  /** Hide the internal title/heading (use when parent already has one) */
  hideTitle?: boolean;
}

interface UploadedDocument {
  id: string;
  document_type: GenericDocType;
  file_name: string;
  status: "uploading" | "success" | "error";
}

const GenericDocsUpload = ({
  upin,
  subCity,
  title,
  ownerId = "",
  leaseId = "",
  encumbranceId = "",
  historyId = "",
  allowedDocTypes,
  onUploadSuccess,
  onAllUploaded,
  hideTitle = false,
}: GenericDocsUploadProps) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<UploadedDocument | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: GenericDocType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Prevent re-uploading same type + filename if already success
    const alreadyUploaded = documents.some(
      (d) => d.document_type === docType && d.file_name === file.name && d.status === "success"
    );
    if (alreadyUploaded) {
      alert(`"${file.name}" has already been uploaded for this document type.`);
      return;
    }

    const newDoc: UploadedDocument = {
      id: `${Date.now()}-${Math.random()}`,
      document_type: docType,
      file_name: file.name,
      status: "uploading",
    };

    setDocuments((prev) => [...prev, newDoc]);
    setUploadingDoc(newDoc);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("document_type", docType);
      formData.append("upin", upin);
      formData.append("sub_city", subCity);
      formData.append("owner_id", ownerId);
      formData.append("lease_id", leaseId);
      formData.append("encumbrance_id", encumbranceId || "");
      formData.append("history_id", historyId || "");

      const response = await uploadDocument(formData);

      if (response.success) {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === newDoc.id ? { ...doc, status: "success" } : doc
          )
        );
        onUploadSuccess?.();
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === newDoc.id ? { ...doc, status: "error" } : doc
        )
      );
      alert(error.message || "Upload failed. Please try again.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const hasErrors = documents.some((d) => d.status === "error");
  const hasUploads = documents.length > 0;

  return (
    <div className="space-y-8">
      {/* Title Section - Hidden when hideTitle is true */}
      {!hideTitle && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">
            Upload documents for <strong className="text-blue-600">{upin}</strong> ({subCity})
          </p>
        </div>
      )}

      {/* Uploaded Documents List */}
      {hasUploads && (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                    doc.status === "success"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : doc.status === "uploading"
                      ? "bg-blue-100 text-blue-700 border-blue-300 animate-pulse"
                      : "bg-red-100 text-red-700 border-red-300"
                  }`}
                >
                  {doc.status === "uploading" ? "⏳" : doc.status === "success" ? "✅" : "❌"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {doc.document_type.replace(/_/g, " ")}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{doc.file_name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Grid */}
      <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 hover:border-blue-400 transition-all duration-200 hover:shadow-md bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl">
            📄
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Select a document type and click to upload (PDF, JPG, PNG)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {allowedDocTypes.map((type) => {
              const isUploaded = documents.some(
                (d) => d.document_type === type.value && d.status === "success"
              );

              return (
                <label
                  key={type.value}
                  className={`group relative cursor-pointer ${isUploaded ? "opacity-70" : ""}`}
                >
                  <div
                    className={`p-6 border-2 border-dashed rounded-xl transition-all duration-200 text-center ${
                      isUploaded
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 group-hover:shadow-md"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${
                        isUploaded ? "bg-green-200" : "bg-blue-100 group-hover:bg-blue-200"
                      }`}
                    >
                      <span className="text-xl font-bold text-blue-600">
                        {isUploaded ? "✓" : "📄"}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
                    <div className="text-sm text-gray-500">
                      {isUploaded ? "Uploaded" : "Click to upload"}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, type.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={!!uploadingDoc || isUploaded}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optional Continue Button - Only shown in wizard steps */}
      {onAllUploaded && hasUploads && !hasErrors && (
        <div className="flex justify-end pt-8">
          <button
            onClick={onAllUploaded}
            disabled={!!uploadingDoc}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
          >
            Continue →
            {uploadingDoc && (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default GenericDocsUpload;