export const editLeaseModal = {
  title: 'የሊዝ ስምምነት አርትዕ',
  leaseId: 'የሊዝ መታወቂያ',
  
  // Calendar
  calendar: {
    ethiopian: 'ዓ/ም',
    gregorian: 'እ.ኤ.አ',
    infoEthiopian: 'ቀኖች በኢትዮጵያ ቀን መቁጠሪያ (ለግሪጎሪያን አቻ አንዣብብ)',
    infoGregorian: 'ቀኖች በግሪጎሪያን ቀን መቁጠሪያ (ለኢትዮጵያ አቻ አንዣብብ)',
  },
  
  // Sections
  sections: {
    financial: 'የፋይናንስ መረጃ',
    additionalFees: 'ተጨማሪ ክፍያዎች',
    period: 'የጊዜ መረጃ',
    dates: 'የቀን መረጃ',
    legal: 'ህጋዊ መረጃ',
  },
  
  // Fields
  fields: {
    totalLeaseAmount: 'ጠቅላላ የሊዝ መጠን (ብር)',
    downPayment: 'የቅድሚያ ክፍያ መጠን (ብር)',
    otherPayment: 'ሌላ የክፍያ መጠን (ብር)',
    pricePerM2: 'ዋጋ በካሬ ሜትር (ብር)',
    demarcationFee: 'የድንበር ምልክት ክፍያ (ብር)',
    engineeringFee: 'የኢንጂነሪንግ አገልግሎት ክፍያ (ብር)',
    registrationFee: 'የውል ምዝገባ ክፍያ',
    leasePeriod: 'የሊዝ ጊዜ (ዓመታት)',
    paymentTerm: 'የክፍያ ጊዜ (ዓመታት)',
    contractDate: 'የውል ቀን',
    startDate: 'የመጀመሪያ ቀን',
    legalFramework: 'ህጋዊ ማዕቀፍ',
  },
  
  // Hints
  hints: {
    demarcationFee: 'የመሬት ድንበር ምልክት/ቅየሳ ክፍያ',
    engineeringFee: 'የኢንጂነሪንግ/ማማከር ክፍያዎች',
  },
  
  // Placeholders
  placeholders: {
    leasePeriod: 'ለምሳሌ 25',
    paymentTerm: 'ለምሳሌ 10',
    contractDate: 'የውል ቀን ይምረጡ',
    startDate: 'የመጀመሪያ ቀን ይምረጡ',
    legalFramework: 'ለምሳሌ አዋጅ ቁጥር 123/2021',
  },
  
  // Messages
  messages: {
    success: 'የሊዝ ውሂብ በተሳካ ሁኔታ ተዘምኗል',
  },
  
  // Errors
  errors: {
    validation: 'ማረጋገጫ አልተሳካም',
    update: 'ሊዝ ማዘመን አልተሳካም',
    unexpected: 'ያልተጠበቀ ስህተት ተከስቷል',
  },
};