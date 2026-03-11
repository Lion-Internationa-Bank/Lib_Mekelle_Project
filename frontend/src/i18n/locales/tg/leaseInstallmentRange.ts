export const leaseInstallmentRange = {
  title: 'ዓመታዊ ክፍሊት ኪራይ ክልሊ',
  description: 'ኣብ ዝተወሰነ ዓመታዊ ክፍሊት ክልሊ ዘለዉ ቦታታት መሬት ርኣይ',

  columns: {
    parcel: 'ቦታ',
    location: 'ቦታ',
    annualInstallment: 'ዓመታዊ ክፍሊት',
    leaseStatus: 'ደረጃ ኪራይ',
    owners: 'ባለቤታት',
  },

  filters: {
    annualInstallmentRange: {
      label: 'ዓመታዊ ክፍሊት ክልሊ (ብር)',
      min: 'ዝተሓተተ መጠን',
      max: 'ዝበዝሐ መጠን',
    },
  },

  validation: {
    minGreaterThanMax: 'ዝተሓተተ እሴት ካብ ዝበዝሐ እሴት ክበዝሕ ኣይከኣልን',
  },

  status: {
    active: 'ዝነቅል',
    expired: 'ዝወደቐ',
    pending: 'ዝጽበየሉ',
  },

  expanded: {
    parcelDetails: 'ዝርዝር ቦታ',
    leaseDetails: 'ዝርዝር ኪራይ',
    area: 'ስፍሓት',
    landUse: 'ጥቕሚ መሬት',
    tenure: 'ዓይነት ተወሳኺ',
    leaseId: 'ቁጽሪ ኪራይ',
    annualInstallment: 'ዓመታዊ ክፍሊት',
    status: 'ደረጃ',
    startDate: 'ዕለት መጀመርያ',
    expiryDate: 'ዕለት ምውዳቕ',
    owners: 'ባለቤታት ({{count}})',
    phone: 'ተሌፎን',
    acquired: 'ዝተረኸበ',
  },

  empty: 'ኣብዚ ክልሊ ክፍሊት ዘለወ ቦታ ኣይተረኸበን',

  errors: {
    fetchFailed: 'ውሂብ ክፍሊት ኪራይ ምግላጽ ኣይከኣለን',
    subCitiesFailed: 'ንኡስ-ከተማታት ምግላጽ ኣይከኣለን',
  },

  common: {
    notSet: 'ኣይተወሰነን',
    currency: {
      etb: 'ብር',
    },
  },
};