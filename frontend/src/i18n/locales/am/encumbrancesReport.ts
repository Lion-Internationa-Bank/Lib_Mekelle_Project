// src/i18n/locales/am/encumbrancesReport.ts
export const encumbrancesReport = {
  title: 'የእግድ ሪፖርት',
  description: 'እግዶችን በቀን ክልል ይመልከቱ እና ያጣሩ',
  
  // Columns
  columns: {
    parcel: 'መሬት ቦታ',
    location: 'አካባቢ',
    owners: 'ባለቤቶች',
    issuingEntity: 'አውጪ አካል',
    status: 'ሁኔታ',
    registrationDate: 'የምዝገብ ቀን'
  },
  
  // Status
  status: {
    active: 'ንቁ',
    released: 'የተለቀቀ'
  },
  
  // Expanded row
  expandedRow: {
    referenceInfo: 'የማጣቀሻ መረጃ',
    referenceNo: 'የማጣቀሻ ቁጥር',
    issuingEntity: 'አውጪ አካል'
  },
  
  // Filters
  filters: {
    subCity: {
      placeholder: 'ክፍለ ከተማ ይምረጡ'
    },
    encumbranceStatus: {
      label: 'የእግድ ሁኔታ'
    },
    encumbranceType: {
      label: 'የእግድ አይነት',
      placeholder: 'ለምሳሌ፡ ሞርጌጅ፣ እዳ'
    },
    dateRange: {
      from: 'ከ ቀን',
      to: 'እስከ ቀን'
    }
  },
  
  // Empty state
  empty: 'ምንም እግዶች አልተገኙም',
  
  // Errors
  errors: {
    fetchFailed: 'እግዶችን በማምጣት ላይ ስህተት:',
    subCitiesFailed: 'ክፍለ ከተማዎችን በማምጣት ላይ ስህተት:'
  }
};