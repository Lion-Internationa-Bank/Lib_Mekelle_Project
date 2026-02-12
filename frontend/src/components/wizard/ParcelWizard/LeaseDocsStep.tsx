// src/components/wizard/ParcelWizard/LeaseDocsStep.tsx
import { useState, useEffect } from "react";
import type { SimpleStepProps } from "../../../types/wizard";
import { useWizard } from "../../../contexts/WizardContext";
import { toast } from 'sonner';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
  status?: "uploading" | "success" | "error";
}

const leaseDocumentTypes = [
  { value: "LEASE_CONTRACT", label: "Lease Contract" },
  { value: "PAYMENT_RECEIPT", label: "Payment Receipt" },
  { value: "APPROVAL_LETTER", label: "Approval Letter" },
];

const LeaseDocsStep = ({ nextStep, prevStep }: SimpleStepProps) => {
  const { currentSession, uploadDocument, deleteDocument, isLoading } = useWizard();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [skipLease, setSkipLease] = useState(false);

  // Load existing documents
  useEffect(() => {
    if (currentSession?.lease_docs) {
      setDocuments(currentSession.lease_docs);
    }
    // Check if lease data exists, if not, suggest skipping
    if (!currentSession?.lease_data) {
      setSkipLease(true);
    }
  }, [currentSession?.lease_docs, currentSession?.lease_data]);

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
      const result = await uploadDocument('lease-docs', docType, file);
      
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
      await deleteDocument('lease-docs', documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleSkipLease = () => {
    setSkipLease(true);
    toast.info('Lease step skipped. Proceeding to validation.');
    nextStep();
  };

  // Show different content based on whether lease exists
  if (skipLease || !currentSession?.lease_data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">No Lease Agreement</h2>
        <p className="text-gray-600 mb-8">
          This parcel does not have a lease agreement. You can proceed to validation.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            ← Back to Lease Info
          </button>
          
          <button
            onClick={nextStep}
            className="ml-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Proceed to Validation →
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Lease Documents</h2>
      <p className="text-gray-600 mb-8">
        Upload supporting documents for the lease agreement (PDF, JPG, PNG up to 10MB)
      </p>

      {/* Documents List */}
      <div className="space-y-4 mb-8">
        {documents.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500">No documents uploaded yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-100">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                  doc.status === "success" || !doc.status ? "bg-green-100 text-green-700 border-green-300" :
                  doc.status === "uploading" ? "bg-purple-100 text-purple-700 border-purple-300 animate-pulse" :
                  "bg-red-100 text-red-700 border-red-300"
                }`}>
                  {doc.status === "uploading" ? "⏳" : doc.status === "success" || !doc.status ? "📄" : "❌"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {leaseDocumentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{doc.file_name}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.uploaded_by || 'You'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDocument(doc.file_url)}
                  className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-xl transition-colors"
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
      <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 hover:border-purple-400 transition-all duration-200 hover:shadow-md bg-gradient-to-br from-purple-50/50 to-indigo-50/50 mb-10">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl">
            📄
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Lease Documents</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Click below to upload lease agreement documents (PDF, JPG, PNG up to 10MB)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {leaseDocumentTypes.map((type) => (
              <label key={type.value} className="group relative cursor-pointer">
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group-hover:shadow-md text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
                    <span className="text-xl font-bold text-purple-600">📄</span>
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
        <div className="flex gap-4">
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          
          <button
            onClick={handleSkipLease}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Skip Lease Documents
          </button>
        </div>
        
        <button
          onClick={nextStep}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          disabled={isLoading || !!uploadingDoc}
        >
          Next: Review & Submit →
          {(isLoading || uploadingDoc) && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        </button>
      </div>
    </>
  );
};

export default LeaseDocsStep;