// src/components/modals/SubdivisionDocsUploadModal.tsx
import  { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { uploadApprovalDocument, getApprovalRequestDocuments, deleteApprovalDocument } from '../../../services/approvalRequestApi';
import { toast } from 'sonner';

interface SubdivisionDocsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvalRequestId: string;
  parentUpin: string;
  childParcels: Array<{
    upin: string;
    file_number: string;
    total_area_m2: number;
  }>;
  onComplete?: () => void;
}

interface ParcelDocument {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  parcel_upin: string; // Which parcel this document belongs to
  metadata?: any;
}

interface UploadingFile {
  tempId: string;
  parcel_upin: string;
  document_type: string;
  file_name: string;
  progress: number;
}

export default function SubdivisionDocsUploadModal({
  isOpen,
  onClose,
  approvalRequestId,
  parentUpin,
  childParcels,
  onComplete,
}: SubdivisionDocsUploadModalProps) {
  const [documents, setDocuments] = useState<ParcelDocument[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedParcel, setExpandedParcel] = useState<string | null>(parentUpin);
  const [activeDocType, setActiveDocType] = useState<{[key: string]: string}>({});

  // All parcels including parent
  const allParcels = [
    { upin: parentUpin, file_number: 'Parent Parcel', total_area_m2: 0, isParent: true },
    ...childParcels.map(p => ({ ...p, isParent: false }))
  ];

  // Load existing documents for this approval request
  useEffect(() => {
    if (isOpen && approvalRequestId) {
      loadDocuments();
    }
  }, [isOpen, approvalRequestId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getApprovalRequestDocuments(approvalRequestId);
      
      if (response.documents) {
        // Filter documents that have parcel_upin metadata
        const parcelDocs = response.documents
          .filter((doc: any) => doc.metadata?.parcel_upin)
          .map((doc: any) => ({
            ...doc,
            parcel_upin: doc.metadata.parcel_upin
          }));
        setDocuments(parcelDocs);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    parcelUpin: string,
    file: File,
    documentType: string
  ) => {
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to uploading list
    setUploadingFiles(prev => [...prev, {
      tempId,
      parcel_upin: parcelUpin,
      document_type: documentType,
      file_name: file.name,
      progress: 0
    }]);

    try {
      // Upload document with parcel_upin in metadata
      const uploadedDoc = await uploadApprovalDocument(
        approvalRequestId,
        file,
        documentType,
        {
          parcel_upin: parcelUpin,
          is_child: parcelUpin !== parentUpin,
          parent_upin: parentUpin,
          upload_timestamp: new Date().toISOString()
        }
      );

      // Remove from uploading list and add to documents
      setUploadingFiles(prev => prev.filter(f => f.tempId !== tempId));
      
      // Add to documents with parcel_upin
      setDocuments(prev => [...prev, {
        ...uploadedDoc,
        parcel_upin: parcelUpin
      }]);

      toast.success(`Document uploaded for ${parcelUpin}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => prev.filter(f => f.tempId !== tempId));
      toast.error(error.message || `Failed to upload document for ${parcelUpin}`);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteApprovalDocument(approvalRequestId, documentId);
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      toast.success('Document deleted');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleDownload = async (document: ParcelDocument) => {
    try {
      const filename = document.file_url.split('/').pop() || document.file_name;
      const { serveApprovalDocument } = await import('../../../services/approvalRequestApi');
      const blobUrl = await serveApprovalDocument(approvalRequestId, filename);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const getDocumentsForParcel = (parcelUpin: string) => {
    return documents.filter(d => d.parcel_upin === parcelUpin);
  };

  const getUploadingForParcel = (parcelUpin: string) => {
    return uploadingFiles.filter(f => f.parcel_upin === parcelUpin);
  };

  const toggleParcel = (upin: string) => {
    setExpandedParcel(expandedParcel === upin ? null : upin);
  };

  const documentTypeOptions = [
    { value: 'SURVEY_PLAN', label: 'Survey Plan' },
    { value: 'SUBDIVISION_PLAN', label: 'Subdivision Plan' },
    { value: 'SITE_MAP', label: 'Site Map' },
    { value: 'LOCATION_SKETCH', label: 'Location Sketch' },
    { value: 'BOUNDARY_DESCRIPTION', label: 'Boundary Description' },
    { value: 'APPROVAL_LETTER', label: 'Approval Letter' },
    { value: 'OTHER', label: 'Other Document' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] text-white px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText size={24} />
              Upload Subdivision Documents
            </h2>
            <p className="text-white/80 mt-1">
              Approval Request: <span className="font-mono bg-black/20 px-2 py-0.5 rounded">{approvalRequestId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#f0cd6e]/10 border-l-4 border-[#f0cd6e] p-4 mx-6 mt-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-[#2a2718] mt-0.5 shrink-0" />
            <div className="text-sm text-[#2a2718]">
              <p className="font-medium mb-1">Upload documents for each child parcel separately</p>
              <p>Each child parcel can have its own survey plan, site map, and supporting documents. 
                 These documents will be permanently linked to their respective parcels upon approval.</p>
            </div>
          </div>
        </div>

        {/* Document Stats */}
        <div className="px-6 py-4 border-b border-[#f0cd6e] flex justify-between items-center">
          <div className="text-sm text-[#2a2718]/70">
            <span className="font-semibold">{documents.length}</span> documents uploaded
          </div>
          <button
            onClick={loadDocuments}
            disabled={loading}
            className="text-sm text-[#f0cd6e] hover:text-[#2a2718] flex items-center gap-1"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#f0cd6e] border-r-transparent"></div>
              <p className="mt-4 text-[#2a2718]">Loading documents...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {allParcels.map((parcel) => {
                const parcelDocs = getDocumentsForParcel(parcel.upin);
                const parcelUploading = getUploadingForParcel(parcel.upin);
                const isExpanded = expandedParcel === parcel.upin;
                
                return (
                  <div key={parcel.upin} className="border border-[#f0cd6e] rounded-xl overflow-hidden">
                    {/* Parcel Header */}
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        parcel.isParent ? 'bg-[#f0cd6e]/10' : 'bg-[#f0cd6e]/5'
                      } hover:bg-[#f0cd6e]/20`}
                      onClick={() => toggleParcel(parcel.upin)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        <div>
                          <h3 className={`font-semibold ${parcel.isParent ? 'text-[#2a2718]' : 'text-[#2a2718]'}`}>
                            {parcel.upin}
                            {parcel.isParent && <span className="ml-2 text-xs bg-[#f0cd6e]/20 text-[#2a2718] px-2 py-0.5 rounded-full">Parent</span>}
                            {!parcel.isParent && <span className="ml-2 text-xs bg-[#f0cd6e]/20 text-[#2a2718] px-2 py-0.5 rounded-full">Child</span>}
                          </h3>
                          <p className="text-xs text-[#2a2718]/70">
                            File: {parcel.file_number} | Area: {parcel.total_area_m2.toFixed(2)} m²
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{parcelDocs.length}</span> document(s)
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-[#f0cd6e]">
                        {/* Existing Documents */}
                        {parcelDocs.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-[#2a2718] mb-2">Uploaded Documents</h4>
                            <div className="space-y-2">
                              {parcelDocs.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-[#f0cd6e] rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FileText size={16} className="text-[#f0cd6e]" />
                                    <div>
                                      <p className="text-sm font-medium text-[#2a2718]">{doc.file_name}</p>
                                      <p className="text-xs text-[#2a2718]/70">
                                        {doc.document_type.replace(/_/g, ' ')} • {(doc.file_size / 1024).toFixed(0)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleDownload(doc)}
                                      className="p-1.5 text-[#2a2718] hover:text-[#f0cd6e] rounded hover:bg-[#f0cd6e]/10"
                                      title="Download"
                                    >
                                      <Download size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDocument(doc.id)}
                                      className="p-1.5 text-[#2a2718] hover:text-red-600 rounded hover:bg-red-50"
                                      title="Delete"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Uploading Files */}
                        {parcelUploading.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-[#2a2718] mb-2">Uploading...</h4>
                            <div className="space-y-2">
                              {parcelUploading.map((file) => (
                                <div key={file.tempId} className="flex items-center gap-3 p-3 bg-[#f0cd6e]/10 border border-[#f0cd6e] rounded-lg">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f0cd6e] border-t-transparent" />
                                  <span className="text-sm text-[#2a2718]">{file.file_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Upload Form */}
                        <div className="bg-[#f0cd6e]/5 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-[#2a2718] mb-3">Upload New Document</h4>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <select
                              value={activeDocType[parcel.upin] || ''}
                              onChange={(e) => setActiveDocType(prev => ({ ...prev, [parcel.upin]: e.target.value }))}
                              className="flex-1 px-3 py-2 border border-[#f0cd6e] rounded-lg text-sm focus:ring-2 focus:ring-[#f0cd6e] text-[#2a2718]"
                            >
                              <option value="">Select document type</option>
                              {documentTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            
                            <label className="relative cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  const docType = activeDocType[parcel.upin];
                                  if (file && docType) {
                                    handleFileUpload(parcel.upin, file, docType);
                                  } else if (!docType) {
                                    toast.error('Please select a document type first');
                                  }
                                  e.target.value = '';
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={!activeDocType[parcel.upin]}
                              />
                              <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                                activeDocType[parcel.upin]
                                  ? 'bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] text-white hover:from-[#2a2718] hover:to-[#f0cd6e]'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}>
                                <Upload size={16} />
                                Choose File
                              </div>
                            </label>
                          </div>
                          <p className="text-xs text-[#2a2718]/70 mt-2">
                            Supported formats: PDF, JPG, PNG (max 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#f0cd6e] px-6 py-4 rounded-b-2xl flex justify-between items-center">
          <div className="text-sm text-[#2a2718]/70">
            {documents.length} total documents • {childParcels.length} child parcels
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-[#f0cd6e] text-[#2a2718] rounded-lg hover:bg-[#f0cd6e]/20 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onComplete?.();
                onClose();
              }}
              className="px-8 py-2 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] text-white rounded-lg hover:from-[#2a2718] hover:to-[#f0cd6e] transition-colors font-medium flex items-center gap-2"
            >
              Complete
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}