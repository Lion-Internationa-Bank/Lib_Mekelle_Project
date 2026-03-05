export const ownerStep = {
  title: 'ባለቤት ይመዝገቡ',
  subtitle: {
    newOwner: 'አዲስ ባለቤት ይመዝገቡ ወይም ያለውን ይፈልጉ',
    existingOwner: 'ያለውን ባለቤት በመጠቀም ላይ: {{name}}',
  },
  
  // Fields
  fields: {
    fullName: 'ሙሉ ስም',
    nationalId: 'ብሄራዊ መታወቂያ',
    phone: 'ስልክ ቁጥር',
    tin: 'ቲን ቁጥር',
    acquiredAt: 'የተገኘበት ቀን',
    id: 'መታወቂያ',
  },
  
  // Placeholders
  placeholders: {
    fullName: 'ለምሳሌ አበበ በላቸው',
    nationalId: '1234567890',
    phone: '+251911223344',
  },
  
  // Actions
  actions: {
    search: 'ያለውን ባለቤት ፈልግ',
    createNew: 'ይልቅ አዲስ ባለቤት ፍጠር',
    change: 'ለውጥ',
    back: 'ተመለስ',
    saveAndContinue: 'ባለቤት አስቀምጥ እና ቀጥል →',
    linkAndContinue: 'ባለቤት አገናኝ እና ቀጥል →',
    goBack: 'ተመለስ',
  },
  
  // Search
  search: {
    title: 'ያለውን ባለቤት ይምረጡ',
    label: 'በስም፣ በብሄራዊ መታወቂያ፣ በስልክ ወይም በቲን ይፈልጉ',
    placeholder: 'ቢያንስ 2 ፊደላት ይጻፉ...',
    noResults: 'ተዛማጅ ባለቤቶች አልተገኙም',
  },
  
  // Selected owner
  selected: {
    title: 'ያለውን ባለቤት በመጠቀም ላይ',
    ownerId: 'የባለቤት መታወቂያ',
    note: 'ከታች የተገኘበትን ቀን መቀየር ይችላሉ። የባለቤት ዝርዝሮች ሊቀየሩ አይችሉም።',
  },
  
  // Hints
  hints: {
    acquiredAt: 'ይህ ባለቤት መሬት ቦታውን የተረከበበት ቀን',
  },
  
  // Notes
  note: {
    title: 'ማስታወሻ',
    item1: 'አዲስ ባለቤት መፍጠር ወይም ያለውን ማገናኘት ይችላሉ',
    item2: 'ያለውን ባለቤት ሲያገናኙ፣ ዝርዝሮቻቸው ይታያሉ ነገር ግን ሊቀየሩ አይችሉም',
    item3: 'በአንድ ዊዛርድ ክፍለ ጊዜ አንድ ባለቤት ብቻ መመዝገብ ይቻላል',
    item4: 'ለበርካታ ባለቤቶች፣ በመጀመሪያ ይህን ክፍለ ጊዜ ያስገቡ ከዚያ በኋላ ተጨማሪ ባለቤቶችን ያክሉ',
  },
  
  // Messages
  messages: {
    ownerSelected: 'ያለውን ባለቤት መርጠዋል: {{name}}',
    existingOwnerSaved: 'ያለው ባለቤት በተሳካ ሁኔታ ተገናኝቷል',
    newOwnerSaved: 'የአዲስ ባለቤት መረጃ ተቀምጧል',
  },
  
  // Errors
  errors: {
    saveFailed: 'የባለቤት መረጃ ማስቀመጥ አልተሳካም',
    missingParcel: 'የመሬት ቦታ መረጃ የለም',
    missingParcelDesc: 'እባክዎ በመጀመሪያ የመሬት ቦታ ደረጃን ያጠናቅቁ።',
  },
};