export const leaseStep = {
  title: 'Register Lease Agreement',
  subtitle: 'Optional: Register lease agreement for the parcel',
  
  // Sections
  sections: {
    payment: 'Lease Payment Information',
    additionalFees: 'Additional Fees',
    period: 'Lease Period & Dates',
    legal: 'Legal Information',
  },
  
  // Fields
  fields: {
    pricePerM2: 'Price per m² (ETB)',
    totalLeaseAmount: 'Total Lease Amount (ETB)',
    downPayment: 'Down Payment Amount (ETB)',
    otherPayment: 'Other Payment Amount (ETB)',
    demarcationFee: 'Demarcation Fee (ETB)',
    engineeringFee: 'Engineering Service Fee (ETB)',
    registrationFee: 'Contract Registration Fee (ETB)',
    leasePeriod: 'Lease Period (Years)',
    paymentTerm: 'Payment Term (Years)',
    contractDate: 'Contract Date',
    startDate: 'Start Date',
    expiryDate: 'Expiry Date (calculated)',
    legalFramework: 'Legal Framework',
  },
  
  // Placeholders
  placeholders: {
    expiryDate: 'Enter start date and lease period',
    legalFramework: 'e.g. Proclamation No. 721/2011, Urban Lands Lease Holding Proclamation',
  },
  
  // Hints
  hints: {
    registrationFee: 'Contract registration fee amount',
    expiryDate: 'Calculated based on start date + lease period',
  },
  
  // Info
  info: {
    note: 'Note',
    feesNote: 'Additional fees (demarcation, engineering, registration) are stored separately and do not affect the lease payment calculations or installment plans.',
  },
  
  // Actions
  actions: {
    back: 'Back',
    skip: 'Skip Lease',
    saveAndContinue: 'Save Lease & Continue →',
  },
  
  // Messages
  messages: {
    saveSuccess: 'Lease information saved',
  },
  
  // Errors
  errors: {
    saveFailed: 'Failed to save lease information',
    missingOwner: 'Missing Owner Information',
    missingOwnerDesc: 'Please complete the Owner step first.',
  },
};