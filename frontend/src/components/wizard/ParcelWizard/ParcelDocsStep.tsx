// src/components/wizard/ParcelWizard/ParcelDocsStep.tsx
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

const documentTypes = [
  { value: "SITE_MAP", label: "Site Map" },
  { value: "PARCEL_MAP", label: "Parcel Map" },
  { value: "SURVEY_DIAGRAM", label: "Survey Diagram" },
];

const ParcelDocsStep = ({ nextStep, prevStep }: SimpleStepProps) => {
  const { currentSession, uploadDocument, deleteDocument, isLoading } = useWizard();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Load existing documents
  useEffect(() => {
    if (currentSession?.parcel_docs) {
      setDocuments(currentSession.parcel_docs);
    }
  }, [currentSession?.parcel_docs]);


  // In your component, add this temporary debug function
const handleViewDocument = (file_url: string) => {
  openDocument(file_url);
};


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
      const formData = new FormData();
      formData.append('step', 'parcel-docs');
      formData.append('document_type', docType);
      formData.append('file', file);

      const result = await uploadDocument('parcel-docs', docType, file);
      
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
      await deleteDocument('parcel-docs', documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Parcel Documents</h2>
      <p className="text-gray-600 mb-8">
        Upload supporting documents for the parcel (PDF, JPG, PNG up to 10MB)
      </p>

      {/* Documents List */}
      <div className="space-y-4 mb-8">
        {documents.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500">No documents uploaded yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                  doc.status === "success" || !doc.status ? "bg-green-100 text-green-700 border-green-300" :
                  doc.status === "uploading" ? "bg-blue-100 text-blue-700 border-blue-300 animate-pulse" :
                  "bg-red-100 text-red-700 border-red-300"
                }`}>
                  {doc.status === "uploading" ? "⏳" : doc.status === "success" || !doc.status ? "📄" : "❌"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{doc.file_name}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.uploaded_by || 'You'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDocument(doc.file_url)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors"
                  title="View document"
                >
                  👁️ View
                </button>
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
      <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 hover:border-blue-400 transition-all duration-200 hover:shadow-md bg-gradient-to-br from-blue-50/50 to-indigo-50/50 mb-10">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl">
            📄
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Parcel Documents</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Click below to upload parcel documents (PDF, JPG, PNG up to 10MB)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {documentTypes.map((type) => (
              <label key={type.value} className="group relative cursor-pointer">
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group-hover:shadow-md text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
                    <span className="text-xl font-bold text-blue-600">📄</span>
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
                  <div className="text-sm text-gray-500">Click to upload</div>
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
      <div className="flex justify-between pt-12 border-t border-gray-200">
        <button
          onClick={prevStep}
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        
        <button
          onClick={nextStep}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          disabled={isLoading || !!uploadingDoc}
        >
          Next Step →
          {(isLoading || uploadingDoc) && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        </button>
      </div>
    </>
  );
};

export default ParcelDocsStep;