export const rates = {
  pageTitle: 'ምድላዋት ተመን (Rates)',
  pageDescription: 'ወለድ፣ መቕጻዕትን ካልኦት ምስ ኣታዊ ዝተተሓሓዙ ተመናት ኣመሓድር።',
  rateTypes: 'ዓይነታት ተመን',
  
  // Rate types
  types: {
    LEASE_INTEREST_RATE: {
      label: 'ናይ ሊዝ ወለድ ተመን',
      description: 'ኣብ ውዕላት ሊዝ ዝውዕል ዓመታዊ ናይ ወለድ ፐርሰንት (%)',
    },
    PENALTY_RATE: {
      label: 'ናይ መቕጻዕቲ ተመን',
      description: 'ንዝደንገዩ ክፍሊታት ወይ ጥሕሰታት ዝውዕል መቕጻዕቲ (%)',
    },
  },
  
  // Status
  status: {
    active: 'ንጡፍ',
    inactive: 'ዘይንጡፍ',
  },
  
  // Fields
  fields: {
    value: 'መጠን ተመን (%)',
    effectiveFrom: 'ካብ ዕለት',
    effectiveUntil: 'ክሳብ ዕለት',
    source: 'ምንጪ / መወከሲ',
  },
  
  // Placeholders
  placeholders: {
    value: 'ንኣብነት፡ 12.50',
    effectiveFrom: 'መበገሲ ዕለት ምረጽ',
    effectiveUntil: 'መወዳእታ ዕለት ምረጽ (ኣማራጺ)',
    source: 'ንኣብነት፡ ውሳነ ቤት ምኽሪ ቁጽሪ 123...',
  },
  
  // Hints
  hints: {
    value: 'ተመን ብፐርሰንት የእትዉ (ንኣብነት፡ ን 12.5% - 12.5 ጸሓፍ)',
  },
  
  // Current rate info
  current: {
    effectiveFrom: 'ሕዚ ኣብ ስራሕ ዝወዓለሉ ካብ',
    to: 'ክሳብ',
    noEndDate: '(መወዳእታ ዕለት የብሉን)',
  },
  
  // Actions
  actions: {
    hideTypes: 'ዓይነታት ተመን ሕባእ',
    showTypes: 'ዓይነታት ተመን ኣርኢ',
    addNew: 'ሓድሽ ተመን ወስኽ',
    updateCurrent: 'ናይ ሕዚ ተመን ኣስተኻኽል',
    create: 'ተመን ፍጠር',
    update: 'ተመን ኣስተኻኽል',
  },
  
  // Messages
  messages: {
    createSuccess: 'ተመን ብትኽክል ተፈጢሩ ኣሎ!',
    createDescription: 'ሓድሽ ናይ {{type}} ተመን ተፈጢሩ ኣሎ።',
    updateSuccess: 'ተመን ብትኽክል ተስተኻኺሉ ኣሎ!',
    updateDescription: 'እቲ {{type}} ተስተኻኺሉ ኣሎ።',
    deactivateSuccess: 'ተመን ካብ ስራሕ ወጻኢ ኮይኑ ኣሎ',
  },
  
  // Errors
  errors: {
    fetchFailed: 'ናይ ሕዚ ተመን ክመጽእ ኣይከኣለን',
    noCurrentRate: 'ነዚ ዓይነት እዚ ሕዚ ኣብ ስራሕ ዝወዓለ ተመን የለን',
    createFailed: 'ተመን ንምፍጣር ኣይተኻእለን',
    updateFailed: 'ተመን ንምስትኽኻል ኣይተኻእለን',
    deactivateFailed: 'ተመን ካብ ስራሕ ወጻኢ ንምግባር ኣይተኻእለን',
    createGeneric: 'ተመን ክመዝገብ ኣይከኣለን። በጃኹም ደጊምኩም ፈትኑ።',
    updateGeneric: 'ተመን ክስተኻኸል ኣይከኣለን። በጃኹም ደጊምኩም ፈትኑ።',
    networkError: 'ናይ ኔትወርክ ጸገም ተፈጢሩ። በጃኹም ደጊምኩም ፈትኑ።',
  },
  
  // Validation
  validation: {
    valueBetween: 'ተመን ካብ 0 ክሳብ 100 ዘሎ ቁጽሪ ክኸውን ኣለዎ',
    effectiveFromRequired: 'መበገሲ ዕለት ግድን የድሊ',
  },
  
  // Loading
  loading: 'ናይ ሕዚ ተመን ይጽዕን ኣሎ...',
  
  // History
  history: {
    title: 'ታሪኽ ተመን',
    empty: 'ነዚ ዓይነት ተመን ዝተመዝገበ ታሪኽ የለን።',
    yes: 'እወ',
    no: 'ኣይፋል',
    columns: {
      value: 'መጠን (Value)',
      effectiveFrom: 'ካብ ዕለት',
      effectiveUntil: 'ክሳብ ዕለት',
      active: 'ንጡፍ',
      source: 'ምንጪ',
      updatedAt: 'ዝተስተኻኸለሉ ዕለት',
    },
  },
  
  // Access denied
  accessDenied: {
    title: 'ፍቓድ የብልካን',
    message: 'ምምሕዳር ኣታዊታት ጥራይ እዮም ተመናት ከመሓድሩ ዝኽእሉ።',
  },
};
