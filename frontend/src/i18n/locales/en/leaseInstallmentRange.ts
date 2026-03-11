export const leaseInstallmentRange = {
  title: "Lease Annual Installment Range",
  description: "View land parcels within a specific annual installment range",

  columns: {
    parcel: "Parcel",
    location: "Location",
    annualInstallment: "Annual Installment",
    leaseStatus: "Lease Status",
    owners: "Owners",
  },

  filters: {
    annualInstallmentRange: {
      label: "Annual Installment Range (ETB)",
      min: "Min Amount",
      max: "Max Amount",
    },
  },

  validation: {
    minGreaterThanMax: "Minimum value cannot be greater than maximum value",
  },

  status: {
    active: "Active",
    expired: "Expired",
    pending: "Pending",
  },

  expanded: {
    parcelDetails: "Parcel Details",
    leaseDetails: "Lease Details",
    area: "Area",
    landUse: "Land Use",
    tenure: "Tenure",
    leaseId: "Lease ID",
    annualInstallment: "Annual Installment",
    status: "Status",
    startDate: "Start Date",
    expiryDate: "Expiry Date",
    owners: "Owners ({{count}})",
    phone: "Phone",
    acquired: "Acquired",
  },

  empty: "No parcels found in this installment range",

  errors: {
    fetchFailed: "Failed to load lease installment data",
    subCitiesFailed: "Failed to load sub-cities",
  },

  common: {
    notSet: "Not set",
    currency: {
      etb: "ETB",
    },
  },
};