// src/i18n/locales/en/encumbrancesReport.ts
export const encumbrancesReport = {
  title: 'Encumbrances Report',
  description: 'View and filter encumbrances with optional date range',
  
  // Columns
  columns: {
    parcel: 'Parcel',
    location: 'Location',
    owners: 'Owners',
    issuingEntity: 'Issuing Entity',
    status: 'Status',
    registrationDate: 'Registration Date'
  },
  
  // Status
  status: {
    active: 'ACTIVE',
    released: 'RELEASED'
  },
  
  // Expanded row
  expandedRow: {
    referenceInfo: 'Reference Information',
    referenceNo: 'Reference No',
    issuingEntity: 'Issuing Entity'
  },
  
  // Filters
  filters: {
    subCity: {
      placeholder: 'Select sub city'
    },
    encumbranceStatus: {
      label: 'Encumbrance Status'
    },
    encumbranceType: {
      label: 'Encumbrance Type',
      placeholder: 'e.g., Mortgage, Lien'
    },
    dateRange: {
      from: 'From Date',
      to: 'To Date'
    }
  },
  
  // Empty state
  empty: 'No encumbrances found',
  
  // Errors
  errors: {
    fetchFailed: 'Error fetching encumbrances:',
    subCitiesFailed: 'Error fetching sub-cities:'
  }
};