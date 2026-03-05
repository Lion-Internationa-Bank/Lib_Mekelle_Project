export const leaseDocsStep = {
  title: 'Lease Documents',
  subtitle: 'Upload supporting documents for the lease agreement (PDF, JPG, PNG up to 10MB)',
  empty: 'No documents uploaded yet',
  uploadedBy: 'You',
  
  // No Lease
  noLease: {
    title: 'No Lease Agreement',
    description: 'This parcel does not have a lease agreement. You can proceed to validation.',
  },
  
  // Upload
  upload: {
    title: 'Upload Lease Documents',
    description: 'Click below to upload lease agreement documents (PDF, JPG, PNG up to 10MB)',
    clickToUpload: 'Click to upload',
  },
  
  // Actions
  actions: {
    view: 'View',
    remove: 'Remove',
    back: 'Back',
    skip: 'Skip Lease Documents',
    backToLease: 'Back to Lease Info',
    proceed: 'Proceed to Validation',
    next: 'Next: Review & Submit',
  },
  
  // Messages
  messages: {
    uploadSuccess: '{{type}} uploaded successfully',
    deleteSuccess: 'Document deleted',
    skipInfo: 'Lease step skipped. Proceeding to validation.',
  },
  
  // Errors
  errors: {
    invalidFileType: 'Invalid file type. Please upload PDF, JPG, or PNG files.',
    fileTooLarge: 'File size exceeds 10MB limit.',
    uploadFailed: 'Upload failed',
    deleteFailed: 'Failed to delete document',
  },
  
  // Confirmations
  confirm: {
    delete: 'Are you sure you want to delete this document?',
  },
};