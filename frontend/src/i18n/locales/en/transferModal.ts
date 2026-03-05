export const transferModal = {
  title: 'Transfer Ownership',
  upin: 'UPIN',
  optional: 'optional',
  wholeParcel: 'Whole parcel transfer',
  searchPlaceholder: 'Search by name, national ID, phone or TIN...',
  noResults: 'No matching owners found',
  createNew: 'Create New',
  createNewFeature: 'Create new owner feature - to be implemented',
  selectType: 'Select type',
  transferringTo: 'Transferring full ownership →',
  from: 'from',
  confirmButton: 'Confirm Transfer',
  
  // Fields
  fields: {
    fromOwner: 'Current Owner (Seller)',
    toOwner: 'New Owner (Buyer/Receiver)',
    transferType: 'Transfer Type',
    price: 'Transfer Price (ETB)',
    reference: 'Reference Number',
  },
  
  // Info
  info: {
    title: 'Full Ownership Transfer',
    description: 'The selected current owner\'s entire share will be transferred to the new owner.',
    approvalNote: 'Your request will be submitted for approval by a higher authority.',
    directPermission: 'You have permission to execute transfers directly.',
  },
  
  // Upload step
  upload: {
    title: 'Transfer Completed ✓',
    description: 'Upload supporting documents for parcel',
    optionalStep: 'Optional Step',
    docsTitle: 'Transfer supporting documents',
    skip: 'Skip for now',
    done: 'Done – Close',
    docTypes: {
      contract: 'Transfer Contract / Agreement',
      idCopy: 'ID Copies (Buyer & Seller)',
      paymentProof: 'Payment Receipt',
      powerOfAttorney: 'Power of Attorney (if applicable)',
      other: 'Other Supporting Document',
    },
  },
  
  // Approval
  approval: {
    title: 'Upload Ownership Transfer Documents',
    description: 'Upload supporting documents for the ownership transfer approval request',
  },
  
  // Messages
  messages: {
    submitted: 'Transfer request submitted for approval',
    success: 'Transfer completed successfully',
  },
  
  // Errors
  errors: {
    loadTypes: 'Failed to load transfer types',
    buyerRequired: 'Please select the new owner',
    typeRequired: 'Please select transfer type',
    samePerson: 'Seller and buyer cannot be the same person',
    failed: 'Failed to transfer ownership',
  },
};