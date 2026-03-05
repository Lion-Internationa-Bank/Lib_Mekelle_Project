export const editLeaseModal = {
  title: 'Edit Lease Agreement',
  leaseId: 'Lease ID',
  
  // Calendar
  calendar: {
    ethiopian: 'ዓ/ም',
    gregorian: 'GC',
    infoEthiopian: 'Dates in Ethiopian calendar (hover for Gregorian equivalent)',
    infoGregorian: 'Dates in Gregorian calendar (hover for Ethiopian equivalent)',
  },
  
  // Sections
  sections: {
    financial: 'Financial Information',
    additionalFees: 'Additional Fees',
    period: 'Period Information',
    dates: 'Date Information',
    legal: 'Legal Information',
  },
  
  // Fields
  fields: {
    totalLeaseAmount: 'Total Lease Amount (ETB)',
    downPayment: 'Down Payment Amount (ETB)',
    otherPayment: 'Other Payment Amount (ETB)',
    pricePerM2: 'Price per m² (ETB)',
    demarcationFee: 'Demarcation Fee (ETB)',
    engineeringFee: 'Engineering Service Fee (ETB)',
    registrationFee: 'Contract Registration Fee',
    leasePeriod: 'Lease Period (Years)',
    paymentTerm: 'Payment Term (Years)',
    contractDate: 'Contract Date',
    startDate: 'Start Date',
    legalFramework: 'Legal Framework',
  },
  
  // Hints
  hints: {
    demarcationFee: 'Land demarcation/survey fee',
    engineeringFee: 'Engineering/consultancy fees',
  },
  
  // Placeholders
  placeholders: {
    leasePeriod: 'e.g., 25',
    paymentTerm: 'e.g., 10',
    contractDate: 'Select contract date',
    startDate: 'Select start date',
    legalFramework: 'e.g., Proclamation No. 123/2021',
  },
  
  // Messages
  messages: {
    success: 'Lease data successfully updated',
  },
  
  // Errors
  errors: {
    validation: 'Validation failed',
    update: 'Failed to update lease',
    unexpected: 'An unexpected error occurred',
  },
};