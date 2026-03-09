// src/i18n/locales/tg/landParcelsReport.ts
export const landParcelsReport = {
  title: 'ጸብጻብ መሬት/ቦታታት',
  description: 'ብዝርዝር መጻረዪታት ዝተዳለወ ሓፈሻዊ ጸብጻብ መሬት',
  
  // Filter options loading
  loadingOptions: 'ናይ መጻረዪ ምርጫታት ይጽዕን ኣሎ...',
  
  // Columns
  columns: {
    upin: 'UPIN (መለለዪ ቦታ)',
    location: 'ቦታ/ኣድራሻ',
    landDetails: 'ዝርዝር መሬት',
    tenure: 'ዓይነት ዋንነት',
    tender: 'ጨረታ',
    status: 'ኩነታት',
    owners: 'ዋኖት',
    notAvailable: 'የለን'
  },
  
  // Location
  location: {
    subCity: '{{name}}',
    details: '{{tabia}} / {{ketena}} / {{block}}'
  },
  
  // Land Details
  landDetails: {
    area: 'ስፍሓት: {{area}} m²',
    grade: 'ደረጃ: {{grade}}'
  },
  
  // Status
  status: {
    active: 'ንጡፍ',
    retired: 'ዝተሰረዘ',
    pending: 'ኣብ መስርሕ',
    colors: {
      active: 'bg-green-100 text-green-800',
      retired: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
  },
  
  // Owners
  owners: {
    count: '{{count}}',
    section: 'ዋኖት ({{count}})',
    id: 'መለለዪ (ID): {{id}}',
    tin: 'ግብሪ (TIN): {{tin}}',
    phone: 'ቴሌፎን: {{phone}}',
    acquired: 'ዝተረኸበሉ: {{date}}'
  },
  
  // Expanded row
  expandedRow: {
    parcelDetails: 'ዝርዝር ሓበሬታ ቦታ',
    boundaries: 'ወሰናት/ዶባት',
    upin: 'UPIN',
    fileNumber: 'ቁጽሪ ፋይል',
    subCity: 'ክፍለ ከተማ',
    tabia: 'ጣብያ',
    ketena: 'ከተና',
    block: 'ብሎክ',
    totalArea: 'ጠቕላላ ስፍሓት',
    landUse: 'ኣጠቓቕማ መሬት',
    landGrade: 'ደረጃ መሬት',
    tender: 'ጨረታ',
    status: 'ኩነታት',
    east: 'ምብራቕ',
    north: 'ሰሜን',
    south: 'ደቡብ',
    west: 'ምዕራብ'
  },
  
  // Filters
  filters: {
    tabia: {
      label: 'ጣብያ',
      placeholder: 'ጣብያ የእትዉ'
    },
    ketena: {
      label: 'ከተና',
      placeholder: 'ከተና የእትዉ'
    },
    block: {
      label: 'ብሎክ',
      placeholder: 'ብሎክ የእትዉ'
    },
    parcelStatus: {
      label: 'ኩነታት ቦታ'
    },
    tenderNumber: {
      label: 'ቁጽሪ ጨረታ',
      placeholder: 'ቁጽሪ ጨረታ የእትዉ'
    },
    landUse: {
      label: 'ኣጠቓቕማ መሬት',
      all: 'ኩሎም ኣጠቓቕማታት'
    },
    tenureType: {
      label: 'ዓይነት ዋንነት',
      all: 'ኩሎም ዓይነታት ዋንነት'
    },
    landGrade: {
      label: 'ደረጃ መሬት',
      placeholder: 'ደረጃ መሬት የእትዉ'
    },
    areaRange: {
      label: 'መጠንን ስፍሓትን (m²)'
    }
  },
  
  // Status options
  statusOptions: {
    active: 'ንጡፍ',
    retired: 'ዝተሰረዘ',
    pending: 'ኣብ መስርሕ'
  },
  
  // Empty state
  empty: 'ዝተረኽበ ቦታ የለን',
  
  // Errors
  errors: {
    fetchFailed: 'ሓበሬታ ቦታታት ኣብ ምምጻእ ጌጋ ተፈጢሩ:',
    fetchOptionsFailed: 'ምርጫታት መጻረዪ ኣብ ምምጻእ ጌጋ ተፈጢሩ:',
    fetchLandUseFailed: 'ኣጠቓቕማ መሬት ኣብ ምምጻእ ጌጋ ተፈጢሩ:',
    fetchTenureFailed: 'ዓይነታት ዋንነት ኣብ ምምጻእ ጌጋ ተፈጢሩ:'
  },
};
