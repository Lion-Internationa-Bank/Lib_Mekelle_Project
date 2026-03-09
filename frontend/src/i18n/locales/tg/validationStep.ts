export const validationStep = {
  title: 'ምግምጋምን ምቕራብን',
  subtitle: {
    rejected: 'እቲ ምኽንያት ምንጻግ ተመልከት፣ ሓበሬታኻ ኣስተካክል፣ ዳግማይ ኣቕርብ',
    pending: 'እዚ ክፍለ-ግዜ ዝጽበየሉ ፍቓድ እዩ። ኣብ ዝገምገም ከሎ ለውጢ ክትገብር ኣይትኽእልን።',
    completed: 'እዚ ክፍለ-ግዜ ተፈጺመ እዩ። ኣብ ታሕቲ ዘሎ ዝርዝር ተመልከት።',
    draft: 'ሓበሬታኻ ግምገም፣ ንፍቓድ ኣቕርብ',
  },

  // Banners
  banners: {
    rejected: {
      title: 'ክፍለ-ግዜ ተነጺጉ እዩ',
      description: 'እዚ ክፍለ-ግዜ ተነጺጉ እዩ። ኣብ ታሕቲ ዘሎ ምርመራ ተመልከትን ዝድለ ለውጢ ግበርን።',
    },
    pending: {
      title: 'ዝጽበየሉ ፍቓድ',
      description: 'ዝቐረበካ ሕቶ ኣብ ምርመራ ኣሎ። ውሳኔ ምስ ተወሰነ ክትፈልጥ ኢኻ። ኣብ ዝጽበየሉ ከሎ ለውጢ ክትገብር ኣይትኽእልን።',
    },
    completed: {
      title: 'ክፍለ-ግዜ ተፈጺመ',
      description: 'እዚ ቦታ ብትክክል ተመዝጊቡ እዩ። ኣብ ታሕቲ ዘሎ ዝርዝር ተመልከት።',
    },
    draft: {
      title: 'ንምቕራብ ደልዩ',
      ready: 'ኩሉ ዝድለ ሓበሬታ ተሞልኢ እዩ። ሕጂ እዚ ቦታ ንፍቓድ ክትቕርቦ ትኽእል ኢኻ።',
    },
  },

  // Summary
  summary: {
    title: 'ጽሕፈት ሓበሬታ',
    parcel: 'ሓበሬታ ቦታ',
    owner: 'ሓበሬታ ባለቤት',
    lease: 'ሓበሬታ ኪራይ',
  },

  // Fields
  fields: {
    upin: 'ዩፒን (UPIN)',
    fileNumber: 'ቁጽሪ ፋይል',
    area: 'ስፍሓት',
    landUse: 'ጥቕሚ መሬት',
    tenureType: 'ዓይነት ተወሳኺ',
    location: 'ቦታ',
    documents: 'ወረቓቕቲ',
    name: 'ስም',
    nationalId: 'ምልክት መንነት ሃገር',
    phone: 'ተሌፎን',
    acquiredAt: 'ዝተረኸበ ግዜ',
    totalAmount: 'ጠቕላሊ መጠን',
    leasePeriod: 'ግዜ ኪራይ',
    startDate: 'ዕለት መጀመርያ',
    pricePerM2: 'ዋጋ ንሜ²',
    paymentTerm: 'ዓይነት ክፍሊት',
    downPayment: 'ቅድሚ ክፍሊት',
    legalFramework: 'ሕጋዊ መሰረት',
    contractDate: 'ዕለት ውዕሊ',
  },

  // Stats
  stats: {
    totalDocuments: 'ጠቕላሊ ወረቓቕቲ',
    parcelArea: 'ስፍሓት ቦታ',
    owners: 'ባለቤታት',
    lastUpdated: 'ንመወዳእታ ዝተሓደሰ',
  },

  // Session
  session: {
    status: 'ደረጃ ክፍለ-ግዜ',
    created: 'ዝተፈጠረ',
    id: 'ቁጽሪ ክፍለ-ግዜ',
  },

  // Status
  status: {
    pending: 'ዝጽበየሉ ፍቓድ',
    rejected: 'ዝተነጸገ',
    completed: 'ዝተፈጸመ',
    approved: 'ፍቓድ ዝሃበ',
    draft: 'ረቂቕ',
  },

  // Rejection
  rejection: {
    reason: 'ምኽንያት ምንጻግ',
    rejectedOn: 'ዝተነጸገ ብዕለት',
    by: 'ብ',
    noReason: 'ምኽንያት ኣይተሃበን',
  },

  // Validation
  validation: {
    inProgress: 'ይምርመር ኣሎ...',
    ready: 'ንምቕራብ ደልዩ',
    missing: 'ዘይተሞልአ ሓበሬታ',
    validating: 'ክፍለ-ግዜ ይምርመር...',
    pleaseComplete: 'ቅድሚ ምቕራብ እዚኣቶም ስጉምትታት ምሉእ ግበር',
    complete: 'ኩሉ ዝድለ ሓበሬታ ተሞልኢ እዩ።',
    submitPrompt: 'ሕጂ እዚ ምዝገባ ቦታ ንፍቓድ ክትቕርቦ ትኽእል ኢኻ።',
    resubmitPrompt: 'ሕጂ እዚ ምዝገባ ቦታ ዳግማይ ንፍቓድ ክትቕርቦ ትኽእል ኢኻ።',
  },

  // Missing
  missing: {
    parcel: 'ሓበሬታ ቦታ ይጎድል',
    owner: 'ሓበሬታ ባለቤት ይጎድል',
  },

  // Not set
  notSet: 'ኣይተወሰነን',
  notProvided: 'ኣይተሃበን',

  // Documents
  documents: {
    count: '{{count}} ተወሊፉ',
    count_plural: '{{count}} ተወሊፎም',
  },

  // Years
  years: '{{count}} ዓመት',
  years_plural: '{{count}} ዓመታት',

  // Actions
  actions: {
    hide: 'ኣምባጽ',
    show: 'ኣርእይ',
    goBack: 'ተመለስ',
    validating: 'ይምርመር...',
    validateAgain: 'ዳግማይ ኣርመር',
    backToSummary: 'ናብ ጽሕፈት ሓበሬታ ተመለስ',
    saveAsDraft: 'ከም ረቂቕ ኣቐምጦ',
    submitting: 'ይቕረብ ኣሎ...',
    submit: 'ንፍቓድ ኣቕርብ',
    resubmitting: 'ዳግማይ ይቕረብ ኣሎ...',
    resubmit: 'ዳግማይ ንፍቓድ ኣቕርብ',
    returnToDashboard: 'ናብ ዳሽቦርድ ተመለስ',
    revalidate: 'ዳግማይ ምርመራ ግበር',
  },

  // Confirmations
  confirm: {
    resubmit: 'እዚ ዝተነጸገ ክፍለ-ግዜ ዳግማይ ንፍቓድ ክትቕርቦ ትሕቲ እወ ድዩ?',
    submit: 'እዚ ምዝገባ ቦታ ንፍቓድ ክትቕርቦ ደልዩ ድዩ?',
  },

  // Messages
  messages: {
    missingInfo: 'ዝድለ ሓበሬታ ይጎድል',
    complete: 'ኩሉ ዝድለ ሓበሬታ ተሞልኢ እዩ',
    resubmitted: 'ክፍለ-ግዜ ዳግማይ ንፍቓድ ቀሪቡ እዩ። ምስ ተረመረ ክትፈልጥ ኢኻ።',
    submittedForApproval: 'ንፍቓድ ቀሪቡ እዩ። ምስ ተረመረ ክትፈልጥ ኢኻ።',
    registered: 'ቦታ ብትክክል ተመዝጊቡ እዩ!',
    draftSaved: 'ክፍለ-ግዜ ከም ረቂቕ ተቐመጠ። ድሕሪኡ ክትቕጽሎ ትኽእል።',
    draftSavedRejected: 'ለውጢ ተቐመጠ። ድሕሪኡ ክትቕጽል ምምራመር ትኽእል።',
  },

  // Info Box
  infoBox: {
    rejected: {
      title: 'ድሕሪ ዳግማይ ምቕራብ እንታይ ይከተል?',
      item1: 'ዝሓደሰ ሕቶኻ ዳግማይ ከብ ምርመራይ ይምርመር',
      item2: 'ብዛዕባ ደረጃ ፍቓድ ምልክታት ክትቕበል ኢኻ',
      item3: 'ምስ ተፈቀደ፣ ቦታ ኣብ ስርዓት ይመዝገብ',
      item4: 'ደረጃኻ ካብ ዳሽቦርድካ ክትከታተሎ ትኽእል',
    },
    pending: {
      title: 'ኣብ ዝጽበየሉ ከሎ እንታይ ይከተል?',
      item1: 'ምርመራይ ሕቶኻ ይምርመር ኣሎ',
      item2: 'ውሳኔ ምስ ተወሰነ ክትፈልጥ ኢኻ',
      item3: 'ኣብ ዝጽበየሉ ከሎ ለውጢ ክትገብር ኣይትኽእልን',
      item4: 'ደረጃኻ ካብ ዳሽቦርድካ ክትርእዮ ትኽእል',
    },
    completed: {
      title: 'ቀጺሉ እንታይ?',
      item1: 'እዚ ቦታ ብትክክል ተመዝጊቡ እዩ',
      item2: 'ኣብ ዝርዝር ቦታታት ክትርእዮ ትኽእል',
      item3: 'ካብ ዳሽቦርድካ ሓድሽ ምዝገባ ጀምር',
    },
    draft: {
      title: 'ድሕሪ ምቕራብ እንታይ ይከተል?',
      item1: 'ሕቶኻ ብምርመራይ ብመሰረት ሚናኻ ይምርመር',
      item2: 'ብዛዕባ ደረጃ ፍቓድ ምልክታት ክትቕበል ኢኻ',
      item3: 'ምስ ተፈቀደ፣ ቦታ ኣብ ስርዓት ይመዝገብ',
      item4: 'ምስ ተነጸገ፣ ኣስተካክልካ ዳግማይ ክትቕርቦ ትኽእል',
      item5: 'ደረጃኻ ካብ ዳሽቦርድካ ክትከታተሎ ትኽእል',
    },
  },

  // Errors
  errors: {
    noSession: 'ዝነቅል ክፍለ-ግዜ የለን',
    invalidPayload: 'ቅርጺ ምርመራ ዘይሕጋዊ እዩ',
    validateFailed: 'ክፍለ-ግዜ ምርመራ ኣይከኣለን',
    fixErrors: 'ቅድሚ ምቕራብ ጌጋታት ምርመራ ኣስተካክል',
    submissionFailed: 'ንፍቓድ ምቕራብ ኣይከኣለን',
    draftFailed: 'ረቂቕ ምቕመጥ ኣይከኣለን',
  },

  // Loading
  loading: 'ሓበሬታ ክፍለ-ግዜ ይጽንበር...',
};