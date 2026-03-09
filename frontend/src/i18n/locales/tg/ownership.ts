export const ownership = {
  pageTitle: 'ምሕደራ ዋንነት',
  pageDescription: 'ዋኖት ንብረትን ዝርዝር ሓበሬታታቶምን ኣመሓድር',
  
  // Search
  search: {
    placeholder: 'ብሽም፣ ብመፍለዪ ቁጽሪ (ID) ወይ ብቴሌፎን ድለ...',
    button: 'ድለ',
  },
  
  // Actions
  actions: {
    addOwner: 'ሓድሽ ዋንኣ ወስኽ',
  },
  
  // Pending requests
  pending: {
    count: '{{count}} ንምጽዳቕ ዝጽበ ዘሎ ጠለብ ኣሎካ',
    count_plural: '{{count}} ንምጽዳቕ ዝጽበዩ ዘለዉ ጠለባት ኣለዉኻ',
    documentsNeeded: 'ገሊኦም ጠለባት ደገፍቲ ሰነዳት የድልዮም ይኾኑ',
    viewButton: 'ዝጽበዩ ዘለዉ ርአ ({{count}})',
    comingSoon: 'ዝጽበዩ ዘለዉ ጠለባት ምርኣይ ኣብ ቀረባ ግዜ ክፉት ክኸውን እዩ',
  },
  
  // Messages
  messages: {
    createSuccess: 'ዋንኣ ብትኽክል ተፈጢሩ ኣሎ',
    updateSuccess: 'ሓበሬታ ዋንኣ ብትኽክል ተስተኻኺሉ ኣሎ',
    deleteSuccess: 'ዋንኣ ብትኽክል ተሰሪዙ ኣሎ',
    creationSubmitted: 'ናይ ዋንኣ ምፍጣር ጠለብ ንምጽዳቕ ተላኢኹ ኣሎ',
  },
  
  // Errors
  errors: {
    fetchFailed: 'ሓበሬታ ዋኖት ክመጽእ ኣይከኣለን',
    createFailed: 'ዋንኣ ንምፍጣር ኣይተኻእለን',
    updateFailed: 'ሓበሬታ ዋንኣ ንምስትኽኻል ኣይተኻእለን',
    deleteFailed: 'ዋንኣ ንምስራዝ ኣይተኻእለን',
  },
  
  // Fields
  fields: {
    fullName: 'ምሉእ ስም',
    nationalId: 'መፍለዪ ቁጽሪ (National ID)',
    phone: 'ቁጽሪ ቴሌፎን',
    tin: 'ቁጽሪ መለለዪ ግብሪ (TIN)',
  },
  
  // Modals
  modals: {
    create: {
      title: 'ዋንኣ ወስኽ',
      note: 'መተሓሳሰቢ:',
      noteDescription: 'ምፍጣር ዋንኣ ምጽዳቕ የድልዮ ይኸውን። ምስ ኣረከብካ ደገፍቲ ሰነዳት ክተተሓሕዝ ትኽእል ኢኻ።',
    },
    edit: {
      title: 'ሓበሬታ ዋንኣ ኣስተኻኽል',
    },
    delete: {
      title: 'ዋንኣ ሰርዝ',
      confirmMessage: 'ንዋንኣ {{name}} ክትሰርዞ ርግጸኛ ዲኻ? ንጡፍ ቦታ (Parcel) ዘለዎም ዋኖት ክስረዙ ኣይኽእሉን።',
    },
  },
  
  // Documents
  docs: {
    requestSubmitted: 'ናይ ዋንኣ ምፍጣር ጠለብ ተላኢኹ ✓',
    ownerCreated: 'ዋንኣ ተፈጢሩ ✓',
    requestDescription: 'ንጠለብ ምፍጣር ዋንኣ ዝኾኑ ደገፍቲ ሰነዳት ኣእትው',
    ownerDescription: 'ነዚ ሓድሽ ዋንኣ ዝኾኑ ደገፍቲ ሰነዳት ኣእትው',
    reviewNote: 'እዞም ሰነዳት ምስቲ ዘቕረብካዮ ጠለብ ብሓባር ብመጽደቂ ኣካል ክርኣዩ እዮም።',
    optionalStep: 'ኣማራጺ ስጉምቲ',
    uploadTitle: 'ደገፍቲ ሰነዳት ዋንኣ',
    skipForNow: 'ንሕዚ ሕለፎ',
    doneClose: 'ተወዲኡ – ዕጾ',
    docTypes: {
      idCopy: 'ኮፒ መፍለዪ ወረቐት (ID)',
      passportPhoto: 'ናይ ፓስፖርት ዓቐን ዘለዎ ስእሊ',
      tinCert: 'ምስክር ወረቐት ግብሪ (TIN)',
      powerOfAttorney: 'ውክልና (Power of Attorney)',
      other: 'ካልእ ሰነድ',
    },
  },
  
  // Table
  table: {
    loading: 'ዋኖት ይጽዕን ኣሎ...',
    connecting: 'ምስ ዳታቤዝ ይራኸብ ኣሎ',
    headers: {
      owner: 'ዋንኣ',
      nationalId: 'መፍለዪ ቁጽሪ (ID)',
      tin: 'ግብሪ (TIN)',
      phone: 'ቴሌፎን',
      parcels: 'ብዝሒ ቦታታት',
      actions: 'ተግባራት',
    },
    parcels: {
      none: 'ቦታ የብሉን',
      count: '{{count}} ቦታ',
      count_plural: '{{count}} ቦታታት',
    },
    empty: {
      title: 'ዝተረኽበ ዋንኣ የለን',
      description: 'ድለይትኻ ኣስተኻኽል ወይ ሓድሽ ዋንኣ ወስኽ።',
      addButton: 'ዋንኣ ወስኽ',
    },
    pagination: {
      owners: 'ዋኖት',
    },
    expanded: {
      noParcels: 'ነዚ ዋንኣ እዚ ዝተመዝገበ ቦታ የለን።',
      upin: 'UPIN',
      subCity: 'ክፍለ ከተማ',
      ketena: 'ከተና',
      area: 'ስፍሓት (m²)',
      landUse: 'ኣጠቓቕማ መሬት',
    },
    actions: {
      toggleDetails: 'ዝርዝር ዋንኣ ርአ/ሕባእ',
      menu: 'ዝርዝር ተግባራት ዋንኣ',
      edit: 'ሓበሬታ ኣስተኻኽል',
      delete: 'ዋንኣ ሰርዝ',
    },
  },
};
