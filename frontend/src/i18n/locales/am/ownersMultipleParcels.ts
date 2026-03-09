// src/i18n/locales/am/ownersMultipleParcels.ts
export const ownersMultipleParcels = {
  title: 'በርካታ መሬቶች ያላቸው ባለቤቶች',
  description: 'ከአንድ በላይ የመሬት ቦታ ያላቸውን ባለቤቶች ይመልከቱ',
  
  // Columns
  columns: {
    owner: 'ባለቤት',
    contact: 'መገኛ',
    subCity: 'ክፍለ ከተማ',
    parcelCount: 'የመሬት ብዛት',
    noNationalId: 'ብሔራዊ መታወቂያ የለም',
    tin: 'ግብር ቁጥር: {{tin}}',
    parcels: 'መሬቶች'
  },
  
  // Owner
  owner: {
    name: '{{name}}',
    nationalId: '{{id}}'
  },
  
  // Contact
  contact: {
    phone: '{{phone}}',
    tin: 'ግብር ቁጥር: {{tin}}'
  },
  
  // Parcel Count
  parcelCount: {
    badge: '{{count}} መሬቶች',
    upin: 'ዩፒን:',
    details: '{{fileNumber}} • {{area}} ሜ²'
  },
  
  // Expanded row
  expandedRow: {
    ownedParcels: 'የተያዙ መሬቶች',
    upin: '{{upin}}',
    fileNumber: '{{number}}',
    location: '{{tabia}} / {{ketena}}',
    area: '{{area}} ሜ²',
    status: '{{status}}'
  },
  
  // Status
  status: {
    active: 'ንቁ',
    retired: 'ጡረታ የወጣ',
    pending: 'በመጠባበቅ ላይ',
    colors: {
      active: 'bg-green-100 text-green-800',
      retired: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
  },
  
  // Filters
  filters: {
    minimumParcels: {
      label: 'ዝቅተኛ የመሬት ብዛት'
    }
  },
  
  // Empty state
  empty: 'በርካታ መሬቶች ያላቸው ባለቤቶች አልተገኙም',
  
  // Errors
  errors: {
    fetchFailed: 'ባለቤቶችን በማምጣት ላይ ስህተት:',
    subCitiesFailed: 'ክፍለ ከተማዎችን በማምጣት ላይ ስህተት:'
  }
};