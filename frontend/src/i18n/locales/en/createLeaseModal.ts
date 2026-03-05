export const createLeaseModal = {
  title: 'Create Lease Agreement',
  parcel: 'Parcel',
  
  // Info
  info: {
    title: 'Lease Creation Request',
    description: 'Your lease creation will be submitted for approval. You can upload supporting documents after submission.',
    feesNote: 'Additional fees (demarcation, engineering, registration)',
  },
  
  // Fields
  fields: {
    pricePerM2: 'Price per m²',
    totalLeaseAmount: 'Total lease amount',
    downPayment: 'Down payment amount',
    otherPayment: 'Other payment amount',
    demarcationFee: 'Demarcation Fee',
    engineeringFee: 'Engineering Service Fee',
    registrationFee: 'Contract Registration Fee',
    leasePeriod: 'Lease period (years)',
    paymentTerm: 'Payment term (years)',
    legalFramework: 'Legal framework',
    contractDate: 'Contract date',
    startDate: 'Start date',
  },
  
  // Messages
  messages: {
    submitted: 'Lease creation request submitted for approval',
    created: 'Lease agreement created successfully',
  },
  
  // Errors
  errors: {
    createFailed: 'Failed to create lease',
  },
  
  // Buttons
  buttons: {
    submitForApproval: 'Submit for Approval',
    save: 'Save Lease',
  },
};