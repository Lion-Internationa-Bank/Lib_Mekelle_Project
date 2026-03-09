// src/i18n/locales/tg/ownersMultipleParcels.ts
export const ownersMultipleParcels = {
  title: 'ልዕሊ ሓደ ቦታ ዘለዎም ዋኖት',
  description: 'ካብ ሓደ ንላዕሊ ናይ መሬት ቦታ ዘለዎም ዋኖት ንብረት ርአ',
  
  // Columns
  columns: {
    owner: 'ዋንኣ',
    contact: 'ርክብ',
    subCity: 'ክፍለ ከተማ',
    parcelCount: 'ብዝሒ ቦታታት',
    noNationalId: 'መፍለዪ ቁጽሪ (ID) የለን',
    tin: 'ግብሪ (TIN): {{tin}}',
    parcels: 'ቦታታት'
  },
  
  // Owner
  owner: {
    name: '{{name}}',
    nationalId: '{{id}}'
  },
  
  // Contact
  contact: {
    phone: '{{phone}}',
    tin: 'ግብሪ (TIN): {{tin}}'
  },
  
  // Parcel Count
  parcelCount: {
    badge: '{{count}} ቦታታት',
    upin: 'UPIN:',
    details: '{{fileNumber}} • {{area}} m²'
  },
  
  // Expanded row
  expandedRow: {
    ownedParcels: 'ናይቲ ዋንኣ ቦታታት',
    upin: '{{upin}}',
    fileNumber: '{{number}}',
    location: '{{tabia}} / {{ketena}}',
    area: '{{area}} m²',
    status: '{{status}}'
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
  
  // Filters
  filters: {
    minimumParcels: {
      label: 'ዝተሓተ ብዝሒ ቦታታት'
    }
  },
  
  // Empty state
  empty: 'ልዕሊ ሓደ ቦታ ዘለዎ ዋንኣ ኣይተረኽበን',
  
  // Errors
  errors: {
    fetchFailed: 'ሓበሬታ ዋኖት ኣብ ምምጻእ ጌጋ ተፈጢሩ:',
    subCitiesFailed: 'ክፍለ ከተማታት ኣብ ምምጻእ ጌጋ ተፈጢሩ:'
  }
};
