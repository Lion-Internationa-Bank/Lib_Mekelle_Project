// src/i18n/locales/tg/encumbrancesReport.ts
export const encumbrancesReport = {
  title: 'ጸብጻብ እገዳታት',
  description: 'እገዳታት ብግዜ ገደብን ካልኦት መምዘንታትን መሚኻ ርአ',
  
  // Columns
  columns: {
    parcel: 'ቦታ (Parcel)',
    location: 'ቦታ/ኣድራሻ',
    owners: 'ዋኖት',
    issuingEntity: 'ዝኣገደ ኣካል',
    status: 'ኩነታት',
    registrationDate: 'ዝተመዝገበሉ ዕለት'
  },
  
  // Status
  status: {
    active: 'ንጡፍ',
    released: 'ዝተላዕለ'
  },
  
  // Expanded row
  expandedRow: {
    referenceInfo: 'መወከሲ ሓበሬታ',
    referenceNo: 'ቁጽሪ መወከሲ',
    issuingEntity: 'ዝኣገደ ኣካል'
  },
  
  // Filters
  filters: {
    subCity: {
      placeholder: 'ክፍለ ከተማ ምረጽ'
    },
    encumbranceStatus: {
      label: 'ኩነታት እገዳ'
    },
    encumbranceType: {
      label: 'ዓይነት እገዳ',
      placeholder: 'ንኣብነት፡ ዕዳ መዐረፊ፣ ናይ ቤት ፍርዲ'
    },
    dateRange: {
      from: 'ካብ ዕለት',
      to: 'ክሳብ ዕለት'
    }
  },
  
  // Empty state
  empty: 'ዝተረኽበ እገዳ የለን',
  
  // Errors
  errors: {
    fetchFailed: 'እገዳታት ኣብ ምምጻእ ጌጋ ተፈጢሩ:',
    subCitiesFailed: 'ክፍለ ከተማታት ኣብ ምምጻእ ጌጋ ተፈጢሩ:'
  }
};
