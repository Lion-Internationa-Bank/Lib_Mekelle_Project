export const billingSection = {
  title: 'የክፍያ ታሪክ',
  subtitle: 'የክፍያ መዝገቦች እና የፋይናንስ አጠቃላይ እይታ',
  downloadPDF: 'ፒዲኤፍ አውርድ',
  owner: 'ባለቤት',
  id: 'መታወቂያ',
  notAvailable: 'የለም',
  moreOwners: '+{{count}} ተጨማሪ',
  
  // Lease Overview
  leaseOverview: {
    title: 'የሊዝ አጠቃላይ እይታ',
    financialTerms: 'የፋይናንስ ውሎች',
    paymentTerms: 'የክፍያ ውሎች',
    timeline: 'የሊዝ የጊዜ ሰሌዳ',
    totalLeaseAmount: 'ጠቅላላ የሊዝ መጠን',
    downPayment: 'የቅድሚያ ክፍያ',
    otherPayment: 'ሌላ ክፍያ',
    annualInstallment: 'ዓመታዊ ክፍያ',
    paymentTerm: 'የክፍያ ጊዜ',
    leasePeriod: 'የሊዝ ጊዜ',
    pricePerM2: 'ዋጋ በካሬ ሜትር',
    startDate: 'የመጀመሪያ ቀን',
    startDateHint: 'የሊዝ መጀመሪያ ቀን',
    contractDate: 'የውል ቀን',
    contractDateHint: 'ስምምነት የተፈረመበት ቀን',
    expiryDate: 'የሚያበቃበት ቀን',
    expiryDateHint: 'የሊዝ ማብቂያ ቀን',
  },
  
  // Years
  years: '{{count}} ዓመት',
  years_plural: '{{count}} ዓመታት',
  
  // No Lease
  noLease: {
    title: 'ምንም የሊዝ ስምምነት አልተገኘም',
    description: 'ይህ የመሬት ቦታ የተያያዘ የሊዝ ስምምነት የለውም።',
  },
  
  // Billing
  billing: {
    records: 'የክፍያ መዝገቦች ({{count}})',
    totalDue: 'ጠቅላላ የሚከፈል መጠን',
    overdue: 'ጊዜው ያለፈበት',
    empty: {
      title: 'ምንም የክፍያ መዝገቦች የሉም',
      description: 'ምንም የሚገኙ የክፍያ መዝገቦች የሉም።',
    },
    columns: {
      sno: 'ተራ ቁጥር',
      year: 'ዓመት',
      dueDate: 'የሚከፈልበት ቀን',
      base: 'መሰረታዊ (ብር)',
      interest: 'ወለድ (ብር)',
      penalty: 'ቅጣት (ብር)',
      amountDue: 'የሚከፈል መጠን (ብር)',
      status: 'ሁኔታ',
      remaining: 'የቀረ መጠን (ብር)',
    },
    status: {
      unpaid: 'አልተከፈለም',
      partial: 'በከፊል ተከፍሏል',
      paid: 'ተከፍሏል',
      overdue: 'ጊዜው ያለፈበት',
    },
  },
};