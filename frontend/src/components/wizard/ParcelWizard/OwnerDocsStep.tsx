// src/components/wizard/ParcelWizard/OwnerDocsStep.tsx
import { useState, useEffect } from "react";
import type { SimpleStepProps } from "../../../types/wizard";
import { useWizard } from "../../../contexts/WizardContext";
import { toast } from 'sonner';
import { openDocument } from "../../../services/documentService";

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
  status?: "uploading" | "success" | "error";
}

const ownerDocumentTypes = [
  { value: "OWNER_ID_COPY", label: "Owner ID Copy" },
  { value: "PASSPORT_COPY", label: "Passport Copy" },
  { value: "BUSINESS_LICENSE", label: "Business License" },
];

const OwnerDocsStep = ({ nextStep, prevStep }: SimpleStepProps) => {
  const { currentSession, uploadDocument, deleteDocument, isLoading } = useWizard();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Load existing documents
  useEffect(() => {
    if (currentSession?.owner_docs) {
      setDocuments(currentSession.owner_docs);
      
    }
  }, [currentSession?.owner_docs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file || !currentSession) {
      e.target.value = '';
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, JPG, or PNG files.');
      e.target.value = '';
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      e.target.value = '';
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempDoc: Document = {
      id: tempId,
      document_type: docType,
      file_name: file.name,
      file_url: '',
      uploaded_at: new Date().toISOString(),
      uploaded_by: '',
      status: "uploading"
    };

    setDocuments(prev => [...prev, tempDoc]);
    setUploadingDoc(tempId);

    try {
      const result = await uploadDocument('owner-docs', docType, file);
      
      setDocuments(prev => prev.map(doc =>
        doc.id === tempId ? { ...result, status: "success" } : doc
      ));
      toast.success(`${docType.replace('_', ' ')} uploaded successfully`);
    } catch (error: any) {
      setDocuments(prev => prev.map(doc =>
        doc.id === tempId ? { ...doc, status: "error" } : doc
      ));
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploadingDoc(null);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
    const result =   await  deleteDocument('owner-docs', documentId);
    console.log("document delete result",result)
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      if(result.success){
         toast.success('Document deleted');
      }
    
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

// In your component, add this temporary debug function
const handleViewDocument = (file_url: string) => {
  openDocument(file_url);
};

  // Show warning if no owner data
  if (!currentSession?.owner_data) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-red-600 mb-4">
          Missing Owner Information
        </p>
        <p className="text-gray-600 mb-6">
          Please complete the Owner step first.
        </p>
        <button
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-[#2a2718] mb-2">
        Owner Documents
      </h2>
      <p className="text-[#2a2718]/70 mb-8">
        Upload supporting documents for the owner (PDF, JPG, PNG up to 10MB)
      </p>

      {/* Documents List */}
      <div className="space-y-4 mb-8">
        {documents.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-[#f0cd6e] rounded-xl">
            <p className="text-[#2a2718]/70">No documents uploaded yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#f0cd6e]/10 to-[#2a2718]/10 rounded-xl border-2 border-[#f0cd6e]">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                  doc.status === "success" || !doc.status ? "bg-[#f0cd6e]/20 text-[#2a2718] border-[#f0cd6e]" :
                  doc.status === "uploading" ? "bg-[#f0cd6e]/30 text-[#2a2718] border-[#f0cd6e] animate-pulse" :
                  "bg-red-100 text-red-700 border-red-300"
                }`}>
                  {doc.status === "uploading" ? "⏳" : doc.status === "success" || !doc.status ? "📄" : "❌"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#2a2718] truncate">
                    {ownerDocumentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                  </div>
                  <div className="text-sm text-[#2a2718]/70 truncate">{doc.file_name}</div>
                  <div className="text-xs text-[#2a2718]/70">
                    {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.uploaded_by || 'You'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
            {   doc.file_url &&(    <button
                  onClick={() => handleViewDocument(doc.file_url)}
                  className="p-2 text-[#f0cd6e] hover:text-[#2a2718] hover:bg-[#f0cd6e]/20 rounded-xl transition-colors"
                  title="View document"
                >
                  👁️ View
                </button>)}
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Remove document"
                  disabled={uploadingDoc === doc.id}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-[#f0cd6e] rounded-2xl p-8 hover:border-[#2a2718] transition-all duration-200 hover:shadow-md bg-gradient-to-br from-[#f0cd6e]/10 to-[#2a2718]/10 mb-10">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl">
            📄
          </div>
          <h3 className="text-xl font-semibold text-[#2a2718] mb-2">Upload Owner Documents</h3>
          <p className="text-[#2a2718]/70 mb-6 max-w-md mx-auto">
            Click below to upload owner identification documents (PDF, JPG, PNG up to 10MB)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {ownerDocumentTypes.map((type) => (
              <label key={type.value} className="group relative cursor-pointer">
                <div className="p-6 border-2 border-dashed border-[#f0cd6e] rounded-xl hover:border-[#2a2718] hover:bg-[#f0cd6e]/20 transition-all duration-200 group-hover:shadow-md text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-[#f0cd6e]/20 group-hover:bg-[#f0cd6e]/30 rounded-xl flex items-center justify-center transition-colors">
                    <span className="text-xl font-bold text-[#2a2718]">📄</span>
                  </div>
                  <div className="font-semibold text-[#2a2718] mb-1">{type.label}</div>
                  <div className="text-sm text-[#2a2718]/70">Click to upload</div>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, type.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading || !!uploadingDoc}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-12 border-t border-[#f0cd6e]">
        <button
          onClick={prevStep}
          className="px-6 py-3 rounded-xl border border-[#f0cd6e] text-[#2a2718] font-semibold hover:bg-[#f0cd6e]/20 transition"
        >
          ← Back
        </button>
        
        <div className="flex gap-4">
          <button
            onClick={nextStep}
            className="bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            disabled={isLoading || !!uploadingDoc}
          >
            Next Step →
            {(isLoading || uploadingDoc) && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          </button>
        </div>
      </div>

      {/* Optional Lease Info */}
      <div className="mt-6 p-4 bg-[#f0cd6e]/10 border border-[#f0cd6e] rounded-xl">
        <h4 className="font-medium text-[#2a2718] mb-1">Optional: Lease Registration</h4>
        <p className="text-sm text-[#2a2718]/70">
          If this parcel has a lease agreement, continue to the next step to register lease details.
          If not, you can skip the lease steps after this.
        </p>
      </div>
    </>
  );
};

export default OwnerDocsStep;