export const ownerStep = {
  title: 'ዋንኣ መዝግብ',
  subtitle: {
    newOwner: 'ሓድሽ ዋንኣ መዝግብ ወይ ዘሎ ዋንኣ ድለ',
    existingOwner: 'ኣብ ጥቕሚ ዝወዓለ ዋንኣ: {{name}}',
  },
  
  // Fields
  fields: {
    fullName: 'ምሉእ ስም',
    nationalId: 'መፍለዪ ቁጽሪ (National ID)',
    phone: 'ቁጽሪ ቴሌፎን',
    tin: 'ቁጽሪ መለለዪ ግብሪ (TIN)',
    acquiredAt: 'ዝተረኸበሉ ዕለት',
    id: 'መለለዪ (ID)',
  },
  
  // Placeholders
  placeholders: {
    fullName: 'ንኣብነት፡ ኣይተ ገብረመድህን ተኽለ',
    nationalId: '1234567890',
    phone: '+251911223344',
  },
  
  // Actions
  actions: {
    search: 'ዘሎ ዋንኣ ድለ',
    createNew: 'ሓድሽ ዋንኣ ፍጠር',
    change: 'ቀይር',
    back: 'ተመለስ',
    saveAndContinue: 'ዋንኣ ዕቅብን ቀጽልን →',
    linkAndContinue: 'ዋንኣ ኣተሓሕዝን ቀጽልን →',
    goBack: 'ንድሕሪት ተመለስ',
  },
  
  // Search
  search: {
    title: 'ካብ ዘለዉ ዋኖት ምረጽ',
    label: 'ብሽም፣ ብመፍለዪ ቁጽሪ፣ ብቴሌፎን ወይ ብግብሪ (TIN) ድለ',
    placeholder: 'ንመድለዪ እንተወሓደ 2 ፊደላት ጸሓፍ...',
    noResults: 'ዝተረኸበ ተመሳሳሊ ዋንኣ የለን',
  },
  
  // Selected owner
  selected: {
    title: 'ኣብ ጥቕሚ ዝወዓለ ዋንኣ',
    ownerId: 'መለለዪ ዋንኣ',
    note: 'ኣብ ታሕቲ ዘሎ ዝተረኸበሉ ዕለት ጥራይ ክተስተኻኽል ትኽእል ኢኻ። ዝርዝር ሓበሬታ ዋንኣ ክቕየር ኣይኽእልን።',
  },
  
  // Hints
  hints: {
    acquiredAt: 'እዚ ዋንኣ ነዚ ቦታ ዝረኸበሉ ዕለት',
  },
  
  // Notes
  note: {
    title: 'መተሓሳሰቢ',
    item1: 'ሓድሽ ዋንኣ ክትፈጥር ወይ ድማ ካብ ዘለዉ ዋኖት ክተተሓሕዝ ትኽእል ኢኻ',
    item2: 'ካብ ዘለዉ ዋኖት ምስ እተተሓሕዝ፡ ዝርዝር ሓበሬታኦም ይርአ እምበር ክስተኻኸል ኣይኽእልን',
    item3: 'ኣብ ሓደ ግዜ ሓደ ዋንኣ ጥራይ ክምዝገብ ይኽእል',
    item4: 'ንብዙሓት ዋኖት፡ ነዚ ሒዝካዮ ዘለኻ ፈጽም እሞ ድሕሪኡ ተወሳኺ ዋኖት ክትውስኽ ትኽእል ኢኻ',
  },
  
  // Messages
  messages: {
    ownerSelected: 'ዝተመረጸ ዋንኣ: {{name}}',
    existingOwnerSaved: 'ዘሎ ዋንኣ ብትኽክል ተተሓሒዙ ኣሎ',
    newOwnerSaved: 'ሓበሬታ ሓድሽ ዋንኣ ተዓቂቡ ኣሎ',
  },
  
  // Errors
  errors: {
    saveFailed: 'ሓበሬታ ዋንኣ ንምዕቃብ ኣይተኻእለን',
    missingParcel: 'ሓበሬታ ቦታ (Parcel) ኣይተረኽበን',
    missingParcelDesc: 'በጃኹም መጀመሪያ ስጉምቲ ሓበሬታ ቦታ (Parcel) ወድኡ።',
  },
};
