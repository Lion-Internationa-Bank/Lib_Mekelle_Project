export const leaseStep = {
  title: 'የሊዝ ስምምነት ይመዝገቡ',
  subtitle: 'አማራጭ: ለመሬት ቦታ የሊዝ ስምምነት ይመዝገቡ',
  
  // Sections
  sections: {
    payment: 'የሊዝ ክፍያ መረጃ',
    additionalFees: 'ተጨማሪ ክፍያዎች',
    period: 'የሊዝ ጊዜ እና ቀኖች',
    legal: 'ህጋዊ መረጃ',
  },
  
  // Fields
  fields: {
    pricePerM2: 'ዋጋ በካሬ ሜትር (ብር)',
    totalLeaseAmount: 'ጠቅላላ የሊዝ መጠን (ብር)',
    downPayment: 'የቅድሚያ ክፍያ መጠን (ብር)',
    otherPayment: 'ሌላ የክፍያ መጠን (ብር)',
    demarcationFee: 'የድንበር ምልክት ክፍያ (ብር)',
    engineeringFee: 'የኢንጂነሪንግ አገልግሎት ክፍያ (ብር)',
    registrationFee: 'የውል ምዝገባ ክፍያ (ብር)',
    leasePeriod: 'የሊዝ ጊዜ (ዓመታት)',
    paymentTerm: 'የክፍያ ጊዜ (ዓመታት)',
    contractDate: 'የውል ቀን',
    startDate: 'የመጀመሪያ ቀን',
    expiryDate: 'የሚያበቃበት ቀን (የተሰላ)',
    legalFramework: 'ህጋዊ ማዕቀፍ',
  },
  
  // Placeholders
  placeholders: {
    expiryDate: 'የመጀመሪያ ቀን እና የሊዝ ጊዜ ያስገቡ',
    legalFramework: 'ለምሳሌ አዋጅ ቁጥር 721/2011፣ የከተማ መሬቶች ሊዝ አያያዝ አዋጅ',
  },
  
  // Hints
  hints: {
    registrationFee: 'የውል ምዝገባ ክፍያ መጠን',
    expiryDate: 'በመጀመሪያ ቀን + የሊዝ ጊዜ ላይ ተመስርቶ ይሰላል',
  },
  
  // Info
  info: {
    note: 'ማስታወሻ',
    feesNote: 'ተጨማሪ ክፍያዎች (የድንበር ምልክት፣ ኢንጂነሪንግ፣ ምዝገባ) በተናጠል ይከማቻሉ እና በሊዝ ክፍያ ስሌቶች ወይም በክፍያ ዕቅዶች ላይ ተጽእኖ አያሳድሩም።',
  },
  
  // Actions
  actions: {
    back: 'ተመለስ',
    skip: 'ሊዝ ዝለል',
    saveAndContinue: 'ሊዝ አስቀምጥ እና ቀጥል →',
  },
  
  // Messages
  messages: {
    saveSuccess: 'የሊዝ መረጃ ተቀምጧል',
  },
  
  // Errors
  errors: {
    saveFailed: 'የሊዝ መረጃ ማስቀመጥ አልተሳካም',
    missingOwner: 'የባለቤት መረጃ የለም',
    missingOwnerDesc: 'እባክዎ በመጀመሪያ የባለቤት ደረጃን ያጠናቅቁ።',
  },
};