import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import type { SimpleStepProps } from "../../types/wizard";
import { uploadDocument } from "../../services/parcelApi";
import { toast } from 'sonner';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  status: "uploading" | "success" | "error";
}

const documentTypes = [
  { value: "SITE_MAP", label: "Site Map" },

];

const ParcelDocsStep = ({ nextStep, prevStep }: SimpleStepProps) => {
  const [searchParams] = useSearchParams();

  const upin = searchParams.get("upin") || "";
  console.log("here is upin",upin)
  const subCity = searchParams.get("sub_city") || "";

  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<any>(null);

  // Optional: Show error if missing data
  if (!upin) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-red-600 mb-4">Missing Parcel Information</p>
        <p className="text-gray-600">Please complete the Parcel Info step first.</p>
        <button
          onClick={prevStep}
          className="mt-6 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc: Document = {
      id: Date.now().toString(),
      document_type: docType,
      file_name: file.name,
      status: "uploading",
    };

    setDocuments(prev => [...prev, newDoc]);
    setUploadingDoc(newDoc);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("document_type", docType);
      formData.append("upin", upin);
      formData.append("sub_city", subCity);
      formData.append("owner_id", "");
      formData.append("lease_id", "");

      const response = await uploadDocument(formData);
      if (response.success) {
        toast.success( `upload ${docType}  document successfuly`)
        setDocuments(prev => prev.map(doc =>
          doc.id === newDoc.id ? { ...doc, status: "success" } : doc
        ));
      } else {
        toast.error('Upload failed')
        throw new Error("Upload failed");
      }
    } catch (error) {
      setDocuments(prev => prev.map(doc =>
        doc.id === newDoc.id ? { ...doc, status: "error" } : doc
      ));
    } finally {
      setUploadingDoc(null);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Parcel Documents</h2>
      <p className="text-gray-600 mb-8">
        Upload documents for <strong className="text-blue-600">{upin}</strong> ({subCity})
      </p>

      {/* Documents List */}
      <div className="space-y-4 mb-8">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                doc.status === "success" ? "bg-green-100 text-green-700 border-green-300" :
                doc.status === "uploading" ? "bg-blue-100 text-blue-700 border-blue-300 animate-pulse" :
                "bg-red-100 text-red-700 border-red-300"
              }`}>
                {doc.status === "uploading" ? "⏳" : doc.status === "success" ? "✅" : "❌"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 truncate">{doc.document_type.replace("_", " ")}</div>
                <div className="text-sm text-gray-500 truncate">{doc.file_name}</div>
              </div>
            </div>
            {/* <button
              onClick={() => removeDocument(doc.id)}
              className="p-2 ml-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
              title="Remove document"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button> */}
          </div>
        ))}
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 hover:border-blue-400 transition-all duration-200 hover:shadow-md bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl">
            📄
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Parcel Documents</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Click below to upload Site Map or Owner ID documents (PDF, JPG, PNG)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
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
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end
        pt-12 mt-12 border-t border-gray-200">
        <button
          onClick={nextStep}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          disabled={uploadingDoc}
        >
          Next Step →
          {uploadingDoc && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        </button>
      </div>
    </>
  );
};

export default ParcelDocsStep;
