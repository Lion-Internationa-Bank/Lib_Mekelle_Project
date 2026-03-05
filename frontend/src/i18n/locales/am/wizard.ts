export const wizard = {
  // Steps
  steps: {
    parcel: 'የመሬት ቦታ መረጃ',
    parcelDocs: 'የመሬት ቦታ ሰነዶች',
    owner: 'የባለቤት መረጃ',
    ownerDocs: 'የባለቤት ሰነዶች',
    lease: 'የሊዝ መረጃ',
    leaseDocs: 'የሊዝ ሰነዶች',
    validation: 'ገምግም እና አስገባ',
  },
  
  // Session
  session: {
    label: 'ክፍለ ጊዜ',
    updated: 'የተዘመነ',
  },
  
  // Progress
  progress: {
    step: 'ደረጃ {{current}} ከ {{total}}',
    ownerDocsSkipped: '(የባለቤት ሰነዶች ተዝለዋል)',
    leaseStepsSkipped: '(የሊዝ ደረጃዎች ተዝለዋል)',
  },
  
  // Status
  status: {
    pending: 'ማፅደቅ በመጠባበቅ ላይ',
    rejected: 'ውድቅ ተደርጓል',
    completed: 'ተጠናቋል',
    approved: 'ጸድቋል',
  },
  
  // Badges
  badges: {
    existingOwner: 'ያለ ባለቤት',
    nonLease: 'ሊዝ ያልሆነ መሬት',
  },
  
  // Actions
  actions: {
    backToDashboard: 'ወደ ዳሽቦርድ ተመለስ',
  },
  
  // Loading
  loading: {
    initializing: 'የዊዛርድ ክፍለ ጊዜን በማስጀመር ላይ...',
    sessionData: 'የክፍለ ጊዜ ውሂብን በመጫን ላይ...',
  },
  
  // Errors
  errors: {
    createFailed: 'ክፍለ ጊዜ መፍጠር/ማምጣት አልተሳካም',
    initFailed: 'የዊዛርድ ክፍለ ጊዜን ማስጀመር አልተሳካም',
    sessionError: 'የክፍለ ጊዜ ስህተት',
    sessionErrorDesc: 'የዊዛርድ ክፍለ ጊዜን ማምጣት አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    sessionId: 'ከዩአርኤል የክፍለ ጊዜ መታወቂያ',
    none: 'የለም',
    hasSessionLoaded: 'ክፍለ ጊዜ ተጭኗል',
    currentSession: 'የአሁኑ ክፍለ ጊዜ',
  },
  
  // Messages
  messages: {
    rejectedWarning: 'ይህ ክፍለ ጊዜ ከዚህ በፊት ውድቅ ተደርጓል። እባክዎ መረጃውን ያዘምኑ እና እንደገና ያስገቡ።',
  },
  
  // Debug
  debug: {
    title: 'የማረሚያ መረጃ',
    step: 'ደረጃ',
    existingOwner: 'ያለ ባለቤት',
    isLease: 'ሊዝ ነው',
    tenure: 'ይዞታ',
    parcel: 'መሬት ቦታ',
    owner: 'ባለቤት',
    ownerId: 'የባለቤት መታወቂያ',
    lease: 'ሊዝ',
  },
};