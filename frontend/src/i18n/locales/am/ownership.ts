export const ownership = {
  pageTitle: 'የባለቤትነት አስተዳደር',
  pageDescription: 'የንብረት ባለቤቶችን እና ዝርዝሮቻቸውን ያስተዳድሩ',
  
  // Search
  search: {
    placeholder: 'ባለቤትን በስም፣ በብሄራዊ መታወቂያ ወይም በስልክ ቁጥር ይፈልጉ...',
    button: 'ፈልግ',
  },
  
  // Actions
  actions: {
    addOwner: 'አዲስ ባለቤት ጨምር',
  },
  
  // Pending requests
  pending: {
    count: 'እርስዎ {{count}} በመጠባበቅ ላይ ያለ የማፅደቅ ጥያቄ አለዎት',
    count_plural: 'እርስዎ {{count}} በመጠባበቅ ላይ ያሉ የማፅደቅ ጥያቄዎች አለዎት',
    documentsNeeded: 'አንዳንድ ጥያቄዎች ደጋፊ ሰነዶች ሊፈልጉ ይችላሉ',
    viewButton: 'በመጠባበቅ ላይ ያሉትን ይመልከቱ ({{count}})',
    comingSoon: 'በመጠባበቅ ላይ ያሉ ጥያቄዎች አገልግሎት በቅርቡ ይመጣል',
  },
  
  // Messages
  messages: {
    createSuccess: 'ባለቤት በተሳካ ሁኔታ ተፈጠረ',
    updateSuccess: 'ባለቤት በተሳካ ሁኔታ ተዘምኗል',
    deleteSuccess: 'ባለቤት በተሳካ ሁኔታ ተሰርዟል',
    creationSubmitted: 'የባለቤት መፍጠር ጥያቄ ለማፅደቅ ቀርቧል',
  },
  
  // Errors
  errors: {
    fetchFailed: 'ባለቤቶችን ማምጣት አልተሳካም',
    createFailed: 'ባለቤት መፍጠር አልተሳካም',
    updateFailed: 'ባለቤት ማዘመን አልተሳካም',
    deleteFailed: 'ባለቤት መሰረዝ አልተሳካም',
  },
  
  // Fields
  fields: {
    fullName: 'ሙሉ ስም',
    nationalId: 'ብሄራዊ መታወቂያ',
    phone: 'ስልክ ቁጥር',
    tin: 'ግብር ከፋይ መለያ ቁጥር (ቲን)',
  },
  
  // Modals
  modals: {
    create: {
      title: 'ባለቤት ጨምር',
      note: 'ማስታወሻ:',
      noteDescription: 'ባለቤት መፍጠር ማፅደቅ ሊፈልግ ይችላል። ከተላከ በኋላ ደጋፊ ሰነዶችን መስቀል ይችላሉ።',
    },
    edit: {
      title: 'ባለቤት አርትዕ',
    },
    delete: {
      title: 'ባለቤት ሰርዝ',
      confirmMessage: '{{name}}ን መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ንቁ የሆኑ ቦታዎች ያሏቸው ባለቤቶች ሊሰረዙ አይችሉም።',
    },
  },
  
  // Documents
  docs: {
    requestSubmitted: 'የባለቤት መፍጠር ጥያቄ ቀርቧል ✓',
    ownerCreated: 'ባለቤት ተፈጥሯል ✓',
    requestDescription: 'ለባለቤት መፍጠር ጥያቄ ደጋፊ ሰነዶችን ይስቀሉ',
    ownerDescription: 'ለአዲሱ ባለቤት ደጋፊ ሰነዶችን ይስቀሉ',
    reviewNote: 'ሰነዶች ከጥያቄዎ ጋር በአፅዳቂው ይገመገማሉ።',
    optionalStep: 'አማራጭ ደረጃ',
    uploadTitle: 'የባለቤት ደጋፊ ሰነዶች',
    skipForNow: 'ለአሁን ዝለል',
    doneClose: 'ተከናውኗል – ዝጋ',
    docTypes: {
      idCopy: 'የብሄራዊ መታወቂያ ቅጂ',
      passportPhoto: 'የፓስፖርት መጠን ፎቶ',
      tinCert: 'የቲን ሰርተፍኬት',
      powerOfAttorney: 'የውክልና ስልጣን',
      other: 'ሌላ ሰነድ',
    },
  },
  
  // Table
  table: {
    loading: 'ባለቤቶችን በመጫን ላይ...',
    connecting: 'ከኋላ አገልጋይ ጋር በመገናኘት ላይ',
    headers: {
      owner: 'ባለቤት',
      nationalId: 'ብሄራዊ መታወቂያ',
      tin: 'ቲን',
      phone: 'ስልክ',
      parcels: 'ቦታዎች (ብዛት)',
      actions: 'ድርጊቶች',
    },
    parcels: {
      none: 'ምንም ቦታዎች የሉም',
      count: '{{count}} ቦታ',
      count_plural: '{{count}} ቦታዎች',
    },
    empty: {
      title: 'ምንም ባለቤቶች አልተገኙም',
      description: 'ፍለጋዎን ያስተካክሉ ወይም የመጀመሪያ ባለቤት ያክሉ።',
      addButton: 'ባለቤት ጨምር',
    },
    pagination: {
      owners: 'ባለቤቶች',
    },
    expanded: {
      noParcels: 'ለዚህ ባለቤት ምንም ቦታዎች አልተመዘገቡም።',
      upin: 'ዩፒን',
      subCity: 'ንኡስ ከተማ',
      ketena: 'ቀጠና',
      area: 'ስፋት (ሜ²)',
      landUse: 'የመሬት አጠቃቀም',
    },
    actions: {
      toggleDetails: 'የባለቤት ዝርዝሮችን ቀይር',
      menu: 'የባለቤት ድርጊቶች ምናሌ',
      edit: 'ባለቤት አርትዕ',
      delete: 'ባለቤት ሰርዝ',
    },
  },
};