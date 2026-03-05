export const rates = {
  pageTitle: 'የተመን ቅንብሮች',
  pageDescription: 'የወለድ፣ የቅጣት እና ሌሎች ከገቢ ጋር የተያያዙ ተመኖችን ያስተዳድሩ።',
  rateTypes: 'የተመን አይነቶች',
  
  // Rate types
  types: {
    LEASE_INTEREST_RATE: {
      label: 'የሊዝ ወለድ ተመን',
      description: 'በሊዝ ስምምነቶች ላይ የሚተገበር ዓመታዊ የወለድ ተመን (%)',
    },
    PENALTY_RATE: {
      label: 'የቅጣት ተመን',
      description: 'ለዘገየ ክፍያ ወይም ጥሰት የሚተገበር ተመን (%)',
    },
  },
  
  // Status
  status: {
    active: 'ንቁ',
    inactive: 'ንቁ ያልሆነ',
  },
  
  // Fields
  fields: {
    value: 'የተመን ዋጋ (%)',
    effectiveFrom: 'የሚጀምርበት ቀን',
    effectiveUntil: 'የሚያበቃበት ቀን',
    source: 'ምንጭ / ማጣቀሻ',
  },
  
  // Placeholders
  placeholders: {
    value: 'ለምሳሌ 12.50',
    effectiveFrom: 'የሚጀምርበት ቀን ይምረጡ',
    effectiveUntil: 'የሚያበቃበት ቀን ይምረጡ (አማራጭ)',
    source: 'ለምሳሌ የምክር ቤት ውሳኔ ቁጥር 123...',
  },
  
  // Hints
  hints: {
    value: 'ተመንን እንደ መቶኛ ያስገቡ (ለምሳሌ 12.5 ለ12.5%)',
  },
  
  // Current rate info
  current: {
    effectiveFrom: 'አሁን ያለው ውጤታማ የሚሆንበት ቀን',
    to: 'እስከ',
    noEndDate: '(የሚያበቃበት ቀን የለም)',
  },
  
  // Actions
  actions: {
    hideTypes: 'የተመን አይነቶችን ደብቅ',
    showTypes: 'የተመን አይነቶችን አሳይ',
    addNew: 'አዲስ ተመን ጨምር',
    updateCurrent: 'የአሁኑን ተመን አዘምን',
    create: 'ተመን ፍጠር',
    update: 'ተመን አዘምን',
  },
  
  // Messages
  messages: {
    createSuccess: 'ተመን በተሳካ ሁኔታ ተፈጠረ!',
    createDescription: 'አዲስ {{type}} ተመን ተፈጥሯል።',
    updateSuccess: 'ተመን በተሳካ ሁኔታ ተዘምኗል!',
    updateDescription: '{{type}} ተዘምኗል።',
    deactivateSuccess: 'ተመን በተሳካ ሁኔታ አገልግሎት አቁሟል',
  },
  
  // Errors
  errors: {
    fetchFailed: 'የአሁኑን ተመን ማምጣት አልተሳካም',
    noCurrentRate: 'ለዚህ አይነት አሁን ያለ ውጤታማ ተመን የለም',
    createFailed: 'ተመን መፍጠር አልተሳካም',
    updateFailed: 'ተመን ማዘመን አልተሳካም',
    deactivateFailed: 'ተመን አገልግሎት ማቆም አልተሳካም',
    createGeneric: 'ተመን መፍጠር አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
    updateGeneric: 'ተመን ማዘመን አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
    networkError: 'የኔትወርክ ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።',
  },
  
  // Validation
  validation: {
    valueBetween: 'ተመን ከ0 እስከ 100 መካከል ያለ ቁጥር መሆን አለበት',
    effectiveFromRequired: 'የሚጀምርበት ቀን ያስፈልጋል',
  },
  
  // Loading
  loading: 'የአሁኑን ተመን በመጫን ላይ...',
  
  // History
  history: {
    title: 'የተመን ታሪክ',
    empty: 'ለዚህ የተመን አይነት ምንም ታሪክ አልተገኘም።',
    yes: 'አዎ',
    no: 'አይ',
    columns: {
      value: 'ዋጋ',
      effectiveFrom: 'የሚጀምርበት ቀን',
      effectiveUntil: 'የሚያበቃበት ቀን',
      active: 'ንቁ',
      source: 'ምንጭ',
      updatedAt: 'የተዘመነበት ቀን',
    },
  },
  
  // Access denied
  accessDenied: {
    title: 'መዳረሻ አልተፈቀደም',
    message: 'የገቢ አስተዳዳሪዎች ብቻ የተመን ቅንብሮችን ማስተዳደር ይችላሉ።',
  },
};