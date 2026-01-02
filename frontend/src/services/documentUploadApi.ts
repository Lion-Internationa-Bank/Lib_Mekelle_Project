const API_BASE = "http://localhost:5000/api/v1";

export type GenericDocType =
  | "MAP"
  | "ID_COPY"
  | "LEASE_CONTRACT"
  | "TRANSFER_CONTRACT"
  | "POWER_OF_ATTORNEY"
  | "COURT_DECISION"
  | "PAYMENT_PROOF"
  | "OTHER";

export interface GenericUploadPayload {
  upin: string;
  sub_city: string;
  document_type: GenericDocType;
  file: File;
  // optional relations
  owner_id?: string;
  lease_id?: string;
  encumbrance_id?: string;
  history_id?: string;
}

export const uploadDocumentGeneric = async (payload: GenericUploadPayload) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("document_type", payload.document_type);
  formData.append("upin", payload.upin);
  formData.append("sub_city", payload.sub_city);

  if (payload.owner_id) formData.append("owner_id", payload.owner_id);
  if (payload.lease_id) formData.append("lease_id", payload.lease_id);
  if (payload.encumbrance_id) formData.append("encumbrance_id", payload.encumbrance_id);
  if (payload.history_id) formData.append("history_id", payload.history_id);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to upload document");
  }
  return json.data;
};
