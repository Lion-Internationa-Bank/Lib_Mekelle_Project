export const ownerDocsStep = {
  title: 'Owner Documents',
  subtitle: 'Upload supporting documents for the owner (PDF, JPG, PNG up to 10MB)',
  empty: 'No documents uploaded yet',
  uploadedBy: 'You',
  
  // Upload
  upload: {
    title: 'Upload Owner Documents',
    description: 'Click below to upload owner identification documents (PDF, JPG, PNG up to 10MB)',
    clickToUpload: 'Click to upload',
  },
  
  // Actions
  actions: {
    view: 'View',
    remove: 'Remove',
    back: 'Back',
    next: 'Next Step',
  },
  
  // Messages
  messages: {
    uploadSuccess: '{{type}} uploaded successfully',
    deleteSuccess: 'Document deleted',
  },
  
  // Errors
  errors: {
    invalidFileType: 'Invalid file type. Please upload PDF, JPG, or PNG files.',
    fileTooLarge: 'File size exceeds 10MB limit.',
    uploadFailed: 'Upload failed',
    deleteFailed: 'Failed to delete document',
    missingOwner: 'Missing Owner Information',
    missingOwnerDesc: 'Please complete the Owner step first.',
  },
  
  // Confirmations
  confirm: {
    delete: 'Are you sure you want to delete this document?',
  },
  
  // Lease Info
  leaseInfo: {
    title: 'Optional: Lease Registration',
    description: 'If this parcel has a lease agreement, continue to the next step to register lease details. If not, you can skip the lease steps after this.',
  },
};