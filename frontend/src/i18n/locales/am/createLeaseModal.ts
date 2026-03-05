export const createLeaseModal = {
  title: 'የሊዝ ስምምነት ፍጠር',
  parcel: 'መሬት ቦታ',
  
  // Info
  info: {
    title: 'የሊዝ መፍጠር ጥያቄ',
    description: 'የሊዝ መፍጠርዎ ለማፅደቅ ይቀርባል። ከተላከ በኋላ ደጋፊ ሰነዶችን መስቀል ይችላሉ።',
    feesNote: 'ተጨማሪ ክፍያዎች (የድንበር ምልክት፣ የኢንጂነሪንግ፣ የምዝገባ)',
  },
  
  // Fields
  fields: {
    pricePerM2: 'ዋጋ በካሬ ሜትር',
    totalLeaseAmount: 'ጠቅላላ የሊዝ መጠን',
    downPayment: 'የቅድሚያ ክፍያ መጠን',
    otherPayment: 'ሌላ የክፍያ መጠን',
    demarcationFee: 'የድንበር ምልክት ክፍያ',
    engineeringFee: 'የኢንጂነሪንግ አገልግሎት ክፍያ',
    registrationFee: 'የውል ምዝገባ ክፍያ',
    leasePeriod: 'የሊዝ ጊዜ (ዓመታት)',
    paymentTerm: 'የክፍያ ጊዜ (ዓመታት)',
    legalFramework: 'ህጋዊ ማዕቀፍ',
    contractDate: 'የውል ቀን',
    startDate: 'የመጀመሪያ ቀን',
  },
  
  // Messages
  messages: {
    submitted: 'የሊዝ መፍጠር ጥያቄ ለማፅደቅ ቀርቧል',
    created: 'የሊዝ ስምምነት በተሳካ ሁኔታ ተፈጠረ',
  },
  
  // Errors
  errors: {
    createFailed: 'ሊዝ መፍጠር አልተሳካም',
  },
  
  // Buttons
  buttons: {
    submitForApproval: 'ለማፅደቅ አስገባ',
    save: 'ሊዝ አስቀምጥ',
  },
};