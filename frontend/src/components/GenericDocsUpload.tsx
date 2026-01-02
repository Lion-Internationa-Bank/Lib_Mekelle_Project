import { useState } from "react";
import { uploadDocumentGeneric, type GenericDocType } from "../services/documentUploadApi";

export interface GenericDocsUploadProps {
  upin: string;
  subCity: string;
  title: string;
  // context
  ownerId?: string;
  leaseId?: string;
  encumbranceId?: string;
  historyId?: string;
  // doc types allowed in this context
  allowedDocTypes: { value: GenericDocType; label: string }[];
  onUploaded?: () => void;
}

const GenericDocsUpload = ({
  upin,
  subCity,
  title,
  ownerId,
  leaseId,
  encumbranceId,
  historyId,
  allowedDocTypes,
  onUploaded,
}: GenericDocsUploadProps) => {
  const [docType, setDocType] = useState<GenericDocType>(allowedDocTypes[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Choose a file first");
      return;
    }
    try {
      setLoading(true);
      await uploadDocumentGeneric({
        upin,
        sub_city: subCity,
        document_type: docType,
        file,
        owner_id: ownerId,
        lease_id: leaseId,
        encumbrance_id: encumbranceId,
        history_id: historyId,
      });
      setFile(null);
      if (onUploaded) onUploaded();
      alert("Document uploaded");
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 bg-white/80 border border-gray-200 rounded-2xl p-4 text-sm space-y-3"
    >
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-600">
          UPIN <span className="font-mono">{upin}</span> • {subCity}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr] gap-3 items-center">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Document type
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={docType}
            onChange={(e) => setDocType(e.target.value as GenericDocType)}
          >
            {allowedDocTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            File
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="w-full text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !file}
          className="px-4 py-2 text-xs md:text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </form>
  );
};

export default GenericDocsUpload;
