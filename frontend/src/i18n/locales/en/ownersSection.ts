export const ownersSection = {
  title: 'Current Owners',
  count: '{{count}} owner',
  count_plural: '{{count}} owners',
  
  // Empty state
  empty: {
    title: 'No owners registered for this parcel yet',
    description: 'Add the first owner and attach supporting documents.',
    addButton: 'Add Owner',
  },
  
  // New owner
  newOwner: {
    validation: 'Full name and National ID are required',
    createFailed: 'Failed to create owner: ',
  },
  
  // Transfer upload
  transfer: {
    upload: {
      title: 'Transfer Completed ✓',
      description: 'Upload supporting documents for parcel',
      step: 'Step 2 of 2',
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
  },
};