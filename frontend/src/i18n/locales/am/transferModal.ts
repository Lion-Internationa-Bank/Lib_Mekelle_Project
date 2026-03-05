export const transferModal = {
  title: 'ባለቤትነት ያስተላልፉ',
  upin: 'ዩፒን',
  optional: 'አማራጭ',
  wholeParcel: 'ሙሉ መሬት ቦታ ዝውውር',
  searchPlaceholder: 'በስም፣ በብሄራዊ መታወቂያ፣ በስልክ ወይም በቲን ይፈልጉ...',
  noResults: 'ተዛማጅ ባለቤቶች አልተገኙም',
  createNew: 'አዲስ ፍጠር',
  createNewFeature: 'አዲስ ባለቤት መፍጠር ባህሪ - እስካሁን አልተዋቀረም',
  selectType: 'አይነት ይምረጡ',
  transferringTo: 'ሙሉ ባለቤትነት በመውሰድ ላይ →',
  from: 'ከ',
  confirmButton: 'ዝውውር አረጋግጥ',
  
  // Fields
  fields: {
    fromOwner: 'የአሁን ባለቤት (ሻጭ)',
    toOwner: 'አዲስ ባለቤት (ገዢ/ተቀባይ)',
    transferType: 'የዝውውር አይነት',
    price: 'የዝውውር ዋጋ (ብር)',
    reference: 'የማጣቀሻ ቁጥር',
  },
  
  // Info
  info: {
    title: 'ሙሉ ባለቤትነት ዝውውር',
    description: 'የተመረጠው የአሁን ባለቤት ሙሉ ድርሻ ወደ አዲሱ ባለቤት ይተላለፋል።',
    approvalNote: 'ጥያቄዎ በከፍተኛ ባለስልጣን ለማፅደቅ ይቀርባል።',
    directPermission: 'ዝውውሮችን በቀጥታ የማስፈጸም ፈቃድ አለዎት።',
  },
  
  // Upload step
  upload: {
    title: 'ዝውውር ተጠናቋል ✓',
    description: 'ለዚህ መሬት ቦታ ደጋፊ ሰነዶችን ይስቀሉ',
    optionalStep: 'አማራጭ ደረጃ',
    docsTitle: 'የዝውውር ደጋፊ ሰነዶች',
    skip: 'ለአሁን ዝለል',
    done: 'ተከናውኗል – ዝጋ',
    docTypes: {
      contract: 'የዝውውር ውል / ስምምነት',
      idCopy: 'የመታወቂያ ቅጂዎች (ገዢ እና ሻጭ)',
      paymentProof: 'የክፍያ ደረሰኝ',
      powerOfAttorney: 'የውክልና ስልጣን (ካለ)',
      other: 'ሌላ ደጋፊ ሰነድ',
    },
  },
  
  // Approval
  approval: {
    title: 'የባለቤትነት ዝውውር ሰነዶችን ይስቀሉ',
    description: 'ለባለቤትነት ዝውውር ማፅደቅ ጥያቄ ደጋፊ ሰነዶችን ይስቀሉ',
  },
  
  // Messages
  messages: {
    submitted: 'የዝውውር ጥያቄ ለማፅደቅ ቀርቧል',
    success: 'ዝውውር በተሳካ ሁኔታ ተጠናቋል',
  },
  
  // Errors
  errors: {
    loadTypes: 'የዝውውር አይነቶችን ማምጣት አልተሳካም',
    buyerRequired: 'እባክዎ አዲስ ባለቤት ይምረጡ',
    typeRequired: 'እባክዎ የዝውውር አይነት ይምረጡ',
    samePerson: 'ሻጭ እና ገዢ አንድ ሰው መሆን አይችሉም',
    failed: 'ባለቤትነት ማስተላለፍ አልተሳካም',
  },
};