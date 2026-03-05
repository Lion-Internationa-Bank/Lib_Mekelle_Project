export const leaseSection = {
  title: 'Lease Agreement',
  editButton: 'Edit Lease',
  
  // Empty state
  empty: {
    title: 'No lease agreement recorded for this parcel yet',
    description: 'Create a lease agreement and submit for approval.',
    approvalNote: 'Your request will be reviewed by a higher authority.',
    createButton: 'Create Lease Agreement',
  },
  
  // Messages
  messages: {
    submitted: 'Lease creation request submitted for approval',
    created: 'Lease agreement created successfully',
    updated: 'Lease agreement updated successfully',
  },
  
  // Upload
  upload: {
    title: 'Lease Created ✓',
    description: 'Upload supporting documents for',
    optional: 'Optional Step',
    docsTitle: 'Lease agreement documents',
    skip: 'Skip for now',
    done: 'Done – Close',
    docTypes: {
      contract: 'Signed Lease Contract',
      paymentProof: 'Payment Receipts',
      councilDecision: 'Council/Board Decision',
      other: 'Other Lease Document',
    },
  },
  
  // Approval
  approval: {
    title: 'Upload Lease Documents',
    description: 'Upload supporting documents for lease agreement on parcel {{upin}}',
  },
};