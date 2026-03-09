// src/i18n/locales/en/landParcelsReport.ts
export const landParcelsReport = {
  title: 'Land Parcels Report',
  description: 'Comprehensive report on land parcels with detailed filters',
  
  // Filter options loading
  loadingOptions: 'Loading filter options...',
  
  // Columns
  columns: {
    upin: 'UPIN',
    location: 'Location',
    landDetails: 'Land Details',
    tenure: 'Tenure',
    tender: 'Tender',
    status: 'Status',
    owners: 'Owners',
    notAvailable: 'N/A'
  },
  
  // Location
  location: {
    subCity: '{{name}}',
    details: '{{tabia}} / {{ketena}} / {{block}}'
  },
  
  // Land Details
  landDetails: {
    area: 'Area: {{area}} m²',
    grade: 'Grade: {{grade}}'
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
  
  // Owners
  owners: {
    count: '{{count}}',
    section: 'Owners ({{count}})',
    id: 'ID: {{id}}',
    tin: 'TIN: {{tin}}',
    phone: 'Phone: {{phone}}',
    acquired: 'Acquired: {{date}}'
  },
  
  // Expanded row
  expandedRow: {
    parcelDetails: 'Parcel Details',
    boundaries: 'Boundaries',
    upin: 'UPIN',
    fileNumber: 'File Number',
    subCity: 'Sub City',
    tabia: 'Tabia',
    ketena: 'Ketena',
    block: 'Block',
    totalArea: 'Total Area',
    landUse: 'Land Use',
    landGrade: 'Land Grade',
    tender: 'Tender',
    status: 'Status',
    east: 'East',
    north: 'North',
    south: 'South',
    west: 'West'
  },
  
  // Filters
  filters: {
    tabia: {
      label: 'Tabia',
      placeholder: 'Enter tabia'
    },
    ketena: {
      label: 'Ketena',
      placeholder: 'Enter ketena'
    },
    block: {
      label: 'Block',
      placeholder: 'Enter block'
    },
    parcelStatus: {
      label: 'Parcel Status'
    },
    tenderNumber: {
      label: 'Tender Number',
      placeholder: 'Enter tender number'
    },
    landUse: {
      label: 'Land Use',
      all: 'All Land Uses'
    },
    tenureType: {
      label: 'Tenure Type',
      all: 'All Tenure Types'
    },
    landGrade: {
      label: 'Land Grade',
      placeholder: 'Enter land grade'
    },
    areaRange: {
      label: 'Area Range (m²)'
    }
  },
  
  // Status options
  statusOptions: {
    active: 'Active',
    retired: 'Retired',
    pending: 'Pending'
  },
  
  // Empty state
  empty: 'No land parcels found',
  
  // Errors
  errors: {
    fetchFailed: 'Error fetching land parcels:',
    fetchOptionsFailed: 'Error fetching filter options:',
    fetchLandUseFailed: 'Error fetching land use options:',
    fetchTenureFailed: 'Error fetching tenure type options:'
  },

};