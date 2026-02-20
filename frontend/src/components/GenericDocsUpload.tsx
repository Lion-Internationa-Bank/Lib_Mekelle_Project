import { useState, useEffect } from "react";
import { 
  uploadApprovalDocument, 
  getApprovalRequestDocuments,
  deleteApprovalDocument 
} from "../services/approvalRequestApi"; 
import { toast } from "sonner";
import { openDocument } from '../services/documentService';  

export type GenericDocType = string;

export interface GenericDocsUploadProps {
  upin?: string;
  subCity?: string;
  title: string;
  ownerId?: string;
  leaseId?: string;
  encumbranceId?: string;
  historyId?: string;
  
  // New props for approval requests
  approvalRequestId?: string;
  isApprovalRequest?: boolean;
  
  allowedDocTypes: { value: GenericDocType; label: string }[];
  
  /** Called after each successful upload */
  onUploadSuccess?: (documents: any[]) => void;
  
  /** If provided, shows a "Continue" button at the bottom */
  onAllUploaded?: () => void;
  
  /** Hide the internal title/heading */
  hideTitle?: boolean;
  
  /** Allow document deletion (only for pending approval requests) */
  allowDelete?: boolean;
  
  /** Show existing documents */
  showExisting?: boolean;
  
  /** Maximum number of files allowed */
  maxFiles?: number;
}

interface UploadedDocument {
  id: string;
  document_type: GenericDocType;
  file_name: string;
  file_url?: string;
  status: "uploading" | "success" | "error" | "existing";
  file_size?: number;
  mime_type?: string;
}

const GenericDocsUpload = ({
  upin = "",
  subCity = "",
  title,
  ownerId = "",
  leaseId = "",
  encumbranceId = "",
  historyId = "",
  approvalRequestId,
  isApprovalRequest = false,
  allowedDocTypes,
  onUploadSuccess,
  onAllUploaded,
  hideTitle = false,
  allowDelete = false,
  showExisting = true,
  maxFiles = 5,
}: GenericDocsUploadProps) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<UploadedDocument | null>(null);
  const [loading, setLoading] = useState(false);

  // Load existing documents for approval requests
  useEffect(() => {
    if (isApprovalRequest && approvalRequestId && showExisting) {
      loadExistingDocuments();
    }
  }, [isApprovalRequest, approvalRequestId, showExisting]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      documents.forEach(doc => {
        if (doc.file_url && doc.file_url.startsWith('blob:')) {
          URL.revokeObjectURL(doc.file_url);
        }
      });
    };
  }, [documents]);

  const loadExistingDocuments = async () => {
    if (!approvalRequestId) return;
    
    try {
      setLoading(true);
      const response = await getApprovalRequestDocuments(approvalRequestId);
      
      if (response.documents && Array.isArray(response.documents)) {
        const existingDocs: UploadedDocument[] = response.documents.map((doc: any) => ({
          id: doc.id,
          document_type: doc.document_type,
          file_name: doc.file_name,
          file_url: doc.file_url,
          file_size: doc.file_size,
          mime_type: doc.mime_type,
          status: "existing"
        }));
        
        setDocuments(existingDocs);
      }
    } catch (error: any) {
      console.error("Failed to load existing documents:", error);
      toast.error(error.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: GenericDocType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      e.target.value = "";
      return;
    }

    // Check maximum files
    if (maxFiles && documents.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      e.target.value = "";
      return;
    }

    // Prevent re-uploading same type + filename if already exists
    const alreadyExists = documents.some(
      (d) => d.document_type === docType && 
             d.file_name === file.name && 
             (d.status === "success" || d.status === "existing")
    );
    
    if (alreadyExists) {
      toast.warning(`"${file.name}" has already been uploaded`);
      e.target.value = "";
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDoc: UploadedDocument = {
      id: tempId,
      document_type: docType,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      status: "uploading",
    };

    setDocuments((prev) => [...prev, newDoc]);
    setUploadingDoc(newDoc);

    try {
      if (isApprovalRequest && approvalRequestId) {
        // Upload to approval request
        await uploadApprovalDocument(approvalRequestId, file, docType);
        
        // After successful upload, refresh the document list from server
        await loadExistingDocuments();
        
        // Remove the temporary document
        setDocuments((prev) => prev.filter((doc) => doc.id !== tempId));
        
        toast.success("Document uploaded successfully");
      } else {
        // Legacy upload (for immediate execution)
        const formData = new FormData();
        formData.append("document", file);
        formData.append("document_type", docType);
        
        if (upin) formData.append("upin", upin);
        if (subCity) formData.append("sub_city", subCity);
        if (ownerId) formData.append("owner_id", ownerId);
        if (leaseId) formData.append("lease_id", leaseId);
        if (encumbranceId) formData.append("encumbrance_id", encumbranceId);
        if (historyId) formData.append("history_id", historyId);

        // Import your API function for legacy uploads
        const { apiFetch } = await import("../services/api");
        const response = await apiFetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.success && response.data) {
          const uploadedDoc = response.data;
          
          // Update document with real ID from backend
          setDocuments((prevDocs) =>
            prevDocs.map((doc) =>
              doc.id === tempId
                ? {
                    id: uploadedDoc.id || tempId,
                    document_type: uploadedDoc.document_type || docType,
                    file_name: uploadedDoc.file_name || file.name,
                    file_url: uploadedDoc.file_url,
                    file_size: uploadedDoc.file_size || file.size,
                    mime_type: uploadedDoc.mime_type || file.type,
                    status: "success"
                  }
                : doc
            )
          );

          // Get updated documents for callback
          const updatedDocs = documents.map((doc) =>
            doc.id === tempId
              ? {
                  id: uploadedDoc.id || tempId,
                  document_type: uploadedDoc.document_type || docType,
                  file_name: uploadedDoc.file_name || file.name,
                  file_url: uploadedDoc.file_url,
                  file_size: uploadedDoc.file_size || file.size,
                  mime_type: uploadedDoc.mime_type || file.type,
                  status: "success"
                }
              : doc
          ).filter(doc => doc.id !== tempId || doc.status === "success");

          onUploadSuccess?.(updatedDocs);
          toast.success("Document uploaded successfully");
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      // Remove the uploading document on error
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== tempId));
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setUploadingDoc(null);
      e.target.value = ""; // Clear file input
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!isApprovalRequest || !approvalRequestId || !allowDelete) {
      return;
    }

    try {
      // Show confirmation dialog
      if (!window.confirm("Are you sure you want to delete this document?")) {
        return;
      }

      await deleteApprovalDocument(approvalRequestId, documentId);
      
      // After successful deletion, refresh the document list
      await loadExistingDocuments();
      
      toast.success("Document deleted successfully");
      
      // Notify parent with updated documents
      if (onUploadSuccess) {
        const response = await getApprovalRequestDocuments(approvalRequestId);
        onUploadSuccess(response.documents || []);
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete document");
    }
  };

  const handleOpenDocument = (file_url: string | undefined) => {
    if (!file_url) {
      toast.error("Document URL is not available");
      return;
    }
    
    console.log("📄 Opening document:", file_url);
    openDocument(file_url);
  };

  const hasErrors = documents.some((d) => d.status === "error");
  const hasUploads = documents.length > 0;
  const remainingSlots = maxFiles ? maxFiles - documents.length : 0;

  return (
    <div className="space-y-8">
      {/* Title Section */}
      {!hideTitle && (
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            {upin && (
              <p className="text-gray-600">
                Upload documents for <strong className="text-blue-600">{upin}</strong>
                {subCity && ` (${subCity})`}
              </p>
            )}
            {isApprovalRequest && approvalRequestId && (
              <p className="text-sm text-gray-500 mt-1">
                Approval Request ID: <code className="bg-gray-100 px-2 py-1 rounded">{approvalRequestId}</code>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {maxFiles && (
              <div className="text-sm text-gray-500">
                {documents.length} / {maxFiles} files
                {remainingSlots > 0 && ` (${remainingSlots} remaining)`}
              </div>
            )}
            {isApprovalRequest && (
              <button
                onClick={loadExistingDocuments}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                title="Refresh documents"
              >
                <svg 
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Refresh
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      )}

      {/* Uploaded Documents List */}
      {hasUploads && !loading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {isApprovalRequest ? "Submitted Documents" : "Uploaded Documents"}
            </h3>
            <span className="text-sm text-gray-500">
              Total: {documents.length} document{documents.length !== 1 ? 's' : ''}
            </span>
          </div>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                doc.status === "success" || doc.status === "existing"
                  ? "bg-green-50 border-green-200 hover:border-green-300"
                  : doc.status === "uploading"
                  ? "bg-blue-50 border-blue-200 animate-pulse"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                    doc.status === "success" || doc.status === "existing"
                      ? "bg-green-100 text-green-700 border-2 border-green-300"
                      : doc.status === "uploading"
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                      : "bg-red-100 text-red-700 border-2 border-red-300"
                  }`}
                >
                  {doc.status === "uploading" ? "⏳" : 
                   doc.status === "success" || doc.status === "existing" ? "✓" : "❌"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {doc.document_type.replace(/_/g, " ")}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{doc.file_name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </span>
                    {doc.status === "uploading" && (
                      <span className="text-xs text-blue-600 animate-pulse">Uploading...</span>
                    )}
                    {doc.status === "success" && (
                      <span className="text-xs text-green-600">Uploaded</span>
                    )}
                    {doc.status === "existing" && (
                      <span className="text-xs text-gray-600">Submitted</span>
                    )}
                    {doc.status === "error" && (
                      <span className="text-xs text-red-600">Failed</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {(doc.status === "success" || doc.status === "existing") && (
                  <button
                    onClick={() => handleOpenDocument(doc.file_url)}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1"
                    title="View document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                )}
              
                {allowDelete && doc.status === "existing" && isApprovalRequest && (
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors flex items-center gap-1"
                    title="Delete document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Grid (only show if not at max files) */}
      {(!maxFiles || documents.length < maxFiles) && (
        <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 hover:border-blue-400 transition-all duration-200 hover:shadow-md bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl">
              📄
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Select a document type and click to upload (PDF, JPG, PNG up to 10MB)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {allowedDocTypes.map((type) => {
                const isUploaded = documents.some(
                  (d) => d.document_type === type.value && (d.status === "success" || d.status === "existing")
                );

                return (
                  <label
                    key={type.value}
                    className={`group relative cursor-pointer ${isUploaded ? "opacity-70" : ""}`}
                    title={isUploaded ? "Already uploaded" : "Click to upload"}
                  >
                    <div
                      className={`p-6 border-2 border-dashed rounded-xl transition-all duration-200 text-center ${
                        isUploaded
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 group-hover:shadow-md"
                      } ${uploadingDoc ? "opacity-50 cursor-not-allowed" : ""}`}
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
                      {isUploaded && (
                        <div className="text-xs text-green-600 mt-1">Already uploaded</div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => handleFileUpload(e, type.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      disabled={!!uploadingDoc || isUploaded}
                    />
                  </label>
                );
              })}
            </div>
            
            {maxFiles && remainingSlots > 0 && (
              <p className="mt-4 text-sm text-gray-500">
                You can upload up to {remainingSlots} more file{remainingSlots !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Summary */}
      {hasErrors && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Some documents failed to upload
          </div>
          <p className="text-sm text-red-600">
            Please try uploading the failed documents again or contact support if the issue persists.
          </p>
        </div>
      )}

      {/* Optional Continue Button */}
      {onAllUploaded && hasUploads && !hasErrors && !uploadingDoc && (
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