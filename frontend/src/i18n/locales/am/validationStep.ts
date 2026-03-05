export const validationStep = {
  title: 'ገምግም እና አስገባ',
  subtitle: {
    rejected: 'የውድቅ ግብረመልሱን ይገምግሙ፣ መረጃዎን ያዘምኑ እና እንደገና ያስገቡ',
    pending: 'ይህ ክፍለ ጊዜ ማፅደቅ በመጠባበቅ ላይ ነው። በሚገመገምበት ጊዜ ለውጦችን ማድረግ አይችሉም።',
    completed: 'ይህ ክፍለ ጊዜ ተጠናቋል። ዝርዝሮቹን ከታች ይመልከቱ።',
    draft: 'መረጃዎን ይገምግሙ እና ለማፅደቅ ያስገቡ',
  },
  
  // Banners
  banners: {
    rejected: {
      title: 'ክፍለ ጊዜ ውድቅ ተደርጓል',
      description: 'ይህ ክፍለ ጊዜ ውድቅ ተደርጓል። እባክዎ ከታች ያለውን ግብረመልስ ይገምግሙ እና አስፈላጊዎቹን ለውጦች ያድርጉ።',
    },
    pending: {
      title: 'ማፅደቅ በመጠባበቅ ላይ',
      description: 'ያስገቡት መረጃ በአፅዳቂ እየተገመገመ ነው። ውሳኔ ሲሰጥ ይነገርዎታል። ክፍለ ጊዜው በመጠባበቅ ላይ እያለ ምንም ለውጦች ማድረግ አይቻልም።',
    },
    completed: {
      title: 'ክፍለ ጊዜ ተጠናቋል',
      description: 'ይህ የመሬት ቦታ በተሳካ ሁኔታ ተመዝግቧል። ዝርዝሮቹን ከታች ይመልከቱ።',
    },
    draft: {
      title: 'ለማስገባት ዝግጁ',
      ready: 'ሁሉም አስፈላጊ መረጃዎች ተጠናቀዋል። አሁን ይህን የመሬት ቦታ ለማፅደቅ ማስገባት ይችላሉ።',
    },
  },
  
  // Summary
  summary: {
    title: 'ማጠቃለያ',
    parcel: 'የመሬት ቦታ መረጃ',
    owner: 'የባለቤት መረጃ',
    lease: 'የሊዝ መረጃ',
  },
  
  // Fields
  fields: {
    upin: 'ዩፒን',
    fileNumber: 'የፋይል ቁጥር',
    area: 'ስፋት',
    landUse: 'የመሬት አጠቃቀም',
    tenureType: 'የይዞታ አይነት',
    location: 'አካባቢ',
    documents: 'ሰነዶች',
    name: 'ስም',
    nationalId: 'ብሄራዊ መታወቂያ',
    phone: 'ስልክ',
    acquiredAt: 'የተገኘበት ቀን',
    totalAmount: 'ጠቅላላ መጠን',
    leasePeriod: 'የሊዝ ጊዜ',
    startDate: 'የመጀመሪያ ቀን',
    pricePerM2: 'ዋጋ/ሜ²',
    paymentTerm: 'የክፍያ ጊዜ',
    downPayment: 'የቅድሚያ ክፍያ',
    legalFramework: 'ህጋዊ ማዕቀፍ',
    contractDate: 'የውል ቀን',
  },
  
  // Stats
  stats: {
    totalDocuments: 'ጠቅላላ ሰነዶች',
    parcelArea: 'የመሬት ቦታ ስፋት',
    owners: 'ባለቤቶች',
    lastUpdated: 'መጨረሻ የተዘመነበት',
  },
  
  // Session
  session: {
    status: 'የክፍለ ጊዜ ሁኔታ',
    created: 'የተፈጠረበት ቀን',
    id: 'የክፍለ ጊዜ መታወቂያ',
  },
  
  // Status
  status: {
    pending: 'ማፅደቅ በመጠባበቅ ላይ',
    rejected: 'ውድቅ ተደርጓል',
    completed: 'ተጠናቋል',
    approved: 'ጸድቋል',
    draft: 'ረቂቅ',
  },
  
  // Rejection
  rejection: {
    reason: 'ውድቅ የተደረገበት ምክንያት',
    rejectedOn: 'ውድቅ የተደረገበት ቀን',
    by: 'ያደረገው',
    noReason: 'ምንም ምክንያት አልተሰጠም',
  },
  
  // Validation
  validation: {
    inProgress: 'በማረጋገጥ ላይ...',
    ready: 'ለማስገባት ዝግጁ',
    missing: 'የጎደለ መረጃ',
    validating: 'ክፍለ ጊዜን በማረጋገጥ ላይ...',
    pleaseComplete: 'እባክዎ ከማስገባትዎ በፊት እነዚህን ደረጃዎች ያጠናቅቁ',
    complete: 'ሁሉም አስፈላጊ መረጃዎች ተጠናቀዋል።',
    submitPrompt: 'አሁን ይህን የመሬት ቦታ ምዝገባ ለማፅደቅ ማስገባት ይችላሉ።',
    resubmitPrompt: 'አሁን ይህን የመሬት ቦታ ምዝገባ እንደገና ለማፅደቅ ማስገባት ይችላሉ።',
  },
  
  // Missing
  missing: {
    parcel: 'የመሬት ቦታ ውሂብ የለም',
    owner: 'የባለቤት ውሂብ የለም',
  },
  
  // Not set
  notSet: 'አልተዋቀረም',
  notProvided: 'አልተሰጠም',
  
  // Documents
  documents: {
    count: '{{count}} ተሰቅሏል',
    count_plural: '{{count}} ተሰቅለዋል',
  },
  
  // Years
  years: '{{count}} ዓመት',
  years_plural: '{{count}} ዓመታት',
  
  // Actions
  actions: {
    hide: 'ደብቅ',
    show: 'አሳይ',
    goBack: 'ተመለስ',
    validating: 'በማረጋገጥ ላይ...',
    validateAgain: 'እንደገና አረጋግጥ',
    backToSummary: 'ወደ ማጠቃለያ ተመለስ',
    saveAsDraft: 'እንደ ረቂቅ አስቀምጥ',
    submitting: 'በማስገባት ላይ...',
    submit: 'ለማፅደቅ አስገባ',
    resubmitting: 'እንደገና በማስገባት ላይ...',
    resubmit: 'እንደገና ለማፅደቅ አስገባ',
    returnToDashboard: 'ወደ ዳሽቦርድ ተመለስ',
    revalidate: 'ማረጋገጫ እንደገና ፈትሽ',
  },
  
  // Confirmations
  confirm: {
    resubmit: 'ይህን ውድቅ የተደረገ ክፍለ ጊዜ እንደገና ለማፅደቅ ማስገባት እንደሚፈልጉ እርግጠኛ ነዎት?',
    submit: 'ይህን የመሬት ቦታ ምዝገባ ለማፅደቅ ለማስገባት ዝግጁ ነዎት?',
  },
  
  // Messages
  messages: {
    missingInfo: 'አስፈላጊ መረጃ ጎድሏል',
    complete: 'ሁሉም አስፈላጊ መረጃዎች ተጠናቀዋል',
    resubmitted: 'ክፍለ ጊዜ እንደገና ለማፅደቅ ቀርቧል። ሲገመገም ይነገርዎታል።',
    submittedForApproval: 'ለማፅደቅ ቀርቧል። ሲገመገም ይነገርዎታል።',
    registered: 'የመሬት ቦታ በተሳካ ሁኔታ ተመዝግቧል!',
    draftSaved: 'ክፍለ ጊዜ እንደ ረቂቅ ተቀምጧል። በኋላ መቀጠል ይችላሉ።',
    draftSavedRejected: 'ለውጦች ተቀምጠዋል። በኋላ ማርትዕ መቀጠል ይችላሉ።',
  },
  
  // Info Box
  infoBox: {
    rejected: {
      title: 'እንደገና ከማስገባት በኋላ ምን ይሆናል?',
      item1: 'ያዘመኑት መረጃ እንደገና በአፅዳቂ ይገመገማል',
      item2: 'ስለ ማፅደቅ ሁኔታ ማሳወቂያዎችን ይደርስዎታል',
      item3: 'ከተፀደቀ፣ የመሬት ቦታው በስርዓቱ ውስጥ ይመዘገባል',
      item4: 'ሁኔታውን ከዳሽቦርድዎ መከታተል ይችላሉ',
    },
    pending: {
      title: 'በመጠባበቅ ላይ እያለ ምን ይሆናል?',
      item1: 'አንድ አፅዳቂ ያስገቡትን መረጃ እየገመገመ ነው',
      item2: 'ውሳኔ ሲሰጥ ይነገርዎታል',
      item3: 'በመጠባበቅ ላይ እያለ ምንም ለውጦች ማድረግ አይቻልም',
      item4: 'ሁኔታውን ከዳሽቦርድዎ መፈተሽ ይችላሉ',
    },
    completed: {
      title: 'ቀጥሎ ምን አለ?',
      item1: 'ይህ የመሬት ቦታ በተሳካ ሁኔታ ተመዝግቧል',
      item2: 'በመሬት ቦታ ዝርዝር ውስጥ ማየት ይችላሉ',
      item3: 'ከዳሽቦርድዎ አዲስ ምዝገባ መጀመር ይችላሉ',
    },
    draft: {
      title: 'ከማስገባት በኋላ ምን ይሆናል?',
      item1: 'ያስገቡት መረጃ በሚናዎ መሰረት በአፅዳቂ ይገመገማል',
      item2: 'ስለ ማፅደቅ ሁኔታ ማሳወቂያዎችን ይደርስዎታል',
      item3: 'ከተፀደቀ፣ የመሬት ቦታው በስርዓቱ ውስጥ ይመዘገባል',
      item4: 'ውድቅ ከተደረገ፣ ማስተካከል እና እንደገና ማስገባት ይችላሉ',
      item5: 'ሁኔታውን ከዳሽቦርድዎ መከታተል ይችላሉ',
    },
  },
  
  // Errors
  errors: {
    noSession: 'ንቁ ክፍለ ጊዜ የለም',
    invalidPayload: 'ልክ ያልሆነ የማረጋገጫ ውሂብ ቅርጸት',
    validateFailed: 'ክፍለ ጊዜን ማረጋገጥ አልተሳካም',
    fixErrors: 'እባክዎ ከማስገባትዎ በፊት የማረጋገጫ ስህተቶችን ያስተካክሉ',
    submissionFailed: 'ለማፅደቅ ማስገባት አልተሳካም',
    draftFailed: 'ረቂቅ ማስቀመጥ አልተሳካም',
  },
  
  // Loading
  loading: 'የክፍለ ጊዜ ውሂብን በመጫን ላይ...',
};