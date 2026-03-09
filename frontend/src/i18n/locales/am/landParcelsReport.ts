// src/i18n/locales/am/landParcelsReport.ts
export const landParcelsReport = {
  title: 'የመሬት ቦታዎች ሪፖርት',
  description: 'በዝርዝር ማጣሪያዎች የመሬት ቦታዎች አጠቃላይ ሪፖርት',
  
  // Filter options loading
  loadingOptions: 'የማጣሪያ አማራጮችን በማምጣት ላይ...',
  
  // Columns
  columns: {
    upin: 'ዩፒን',
    location: 'አካባቢ',
    landDetails: 'የመሬት ዝርዝሮች',
    tenure: 'የይዞታ አይነት',
    tender: 'ጨረታ',
    status: 'ሁኔታ',
    owners: 'ባለቤቶች',
    notAvailable: 'የለም'
  },
  
  // Location
  location: {
    subCity: '{{name}}',
    details: '{{tabia}} / {{ketena}} / {{block}}'
  },
  
  // Land Details
  landDetails: {
    area: 'ስፋት: {{area}} ሜ²',
    grade: 'ደረጃ: {{grade}}'
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
  
  // Owners
  owners: {
    count: '{{count}}',
    section: 'ባለቤቶች ({{count}})',
    id: 'መታወቂያ: {{id}}',
    tin: 'ግብር ቁጥር: {{tin}}',
    phone: 'ስልክ: {{phone}}',
    acquired: 'ያገኙበት ቀን: {{date}}'
  },
  
  // Expanded row
  expandedRow: {
    parcelDetails: 'የመሬት ቦታ ዝርዝሮች',
    boundaries: 'ድንበሮች',
    upin: 'ዩፒን',
    fileNumber: 'የፋይል ቁጥር',
    subCity: 'ክፍለ ከተማ',
    tabia: 'ታቢያ',
    ketena: 'ቀጠና',
    block: 'ብሎክ',
    totalArea: 'ጠቅላላ ስፋት',
    landUse: 'የመሬት አጠቃቀም',
    landGrade: 'የመሬት ደረጃ',
    tender: 'ጨረታ',
    status: 'ሁኔታ',
    east: 'ምስራቅ',
    north: 'ሰሜን',
    south: 'ደቡብ',
    west: 'ምዕራብ'
  },
  
  // Filters
  filters: {
    tabia: {
      label: 'ታቢያ',
      placeholder: 'ታቢያ ያስገቡ'
    },
    ketena: {
      label: 'ቀጠና',
      placeholder: 'ቀጠና ያስገቡ'
    },
    block: {
      label: 'ብሎክ',
      placeholder: 'ብሎክ ያስገቡ'
    },
    parcelStatus: {
      label: 'የመሬት ቦታ ሁኔታ'
    },
    tenderNumber: {
      label: 'የጨረታ ቁጥር',
      placeholder: 'የጨረታ ቁጥር ያስገቡ'
    },
    landUse: {
      label: 'የመሬት አጠቃቀም',
      all: 'ሁሉም የመሬት አጠቃቀሞች'
    },
    tenureType: {
      label: 'የይዞታ አይነት',
      all: 'ሁሉም የይዞታ አይነቶች'
    },
    landGrade: {
      label: 'የመሬት ደረጃ',
      placeholder: 'የመሬት ደረጃ ያስገቡ'
    },
    areaRange: {
      label: 'የስፋት ክልል (ሜ²)'
    }
  },
  
  // Status options
  statusOptions: {
    active: 'ንቁ',
    retired: 'ጡረታ የወጣ',
    pending: 'በመጠባበቅ ላይ'
  },
  
  // Empty state
  empty: 'ምንም የመሬት ቦታዎች አልተገኙም',
  
  // Errors
  errors: {
    fetchFailed: 'የመሬት ቦታዎችን በማምጣት ላይ ስህተት:',
    fetchOptionsFailed: 'የማጣሪያ አማራጮችን በማምጣት ላይ ስህተት:',
    fetchLandUseFailed: 'የመሬት አጠቃቀም አማራጮችን በማምጣት ላይ ስህተት:',
    fetchTenureFailed: 'የይዞታ አይነት አማራጮችን በማምጣት ላይ ስህተት:'
  }
};