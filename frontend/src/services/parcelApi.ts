import type { ParcelFormData } from "../validation/schemas";

const API_BASE = import.meta.env.VITE_API_URL;

export type CreateParcelData = ParcelFormData;

export const createParcel = async (data: CreateParcelData) => {
  const response = await fetch(`${API_BASE}/parcels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create parcel");
  return response.json();
};

export const createOwner = async (data: any) => {
  const response = await fetch(`${API_BASE}/owners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create owner");
  return response.json();
};

export const createLease = async (data: any) => {
  const response = await fetch(`${API_BASE}/leases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create lease");
  return response.json();
};


export const uploadDocument = async (formData: FormData) => {
  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData, // ✅ FormData - no Content-Type header
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload document");
  }
  return response.json();
};
