// src/i18n/locales/en/ownersMultipleParcels.ts
export const ownersMultipleParcels = {
  title: 'Owners with Multiple Parcels',
  description: 'View property owners who own more than one land parcel',
  
  // Columns
  columns: {
    owner: 'Owner',
    contact: 'Contact',
    subCity: 'Sub City',
    parcelCount: 'Parcel Count',
    noNationalId: 'No National ID',
    tin: 'TIN: {{tin}}',
    parcels: 'parcels'
  },
  
  // Owner
  owner: {
    name: '{{name}}',
    nationalId: '{{id}}'
  },
  
  // Contact
  contact: {
    phone: '{{phone}}',
    tin: 'TIN: {{tin}}'
  },
  
  // Parcel Count
  parcelCount: {
    badge: '{{count}} parcels',
    upin: 'UPIN:',
    details: '{{fileNumber}} • {{area}} m²'
  },
  
  // Expanded row
  expandedRow: {
    ownedParcels: 'Owned Parcels',
    upin: '{{upin}}',
    fileNumber: '{{number}}',
    location: '{{tabia}} / {{ketena}}',
    area: '{{area}} m²',
    status: '{{status}}'
  },
  
  // Status
  status: {
    active: 'ACTIVE',
    retired: 'RETIRED',
    pending: 'PENDING',
    colors: {
      active: 'bg-green-100 text-green-800',
      retired: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
  },
  
  // Filters
  filters: {
    minimumParcels: {
      label: 'Minimum Parcels'
    }
  },
  
  // Empty state
  empty: 'No owners with multiple parcels found',
  
  // Errors
  errors: {
    fetchFailed: 'Error fetching owners:',
    subCitiesFailed: 'Error fetching sub-cities:'
  }
};