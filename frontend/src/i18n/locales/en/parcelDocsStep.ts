export const parcelDocsStep = {
  title: 'Parcel Documents',
  subtitle: 'Upload supporting documents for the parcel (PDF, JPG, PNG up to 10MB)',
  empty: 'No documents uploaded yet',
  uploadedBy: 'You',
  
  // Upload
  upload: {
    title: 'Upload Parcel Documents',
    description: 'Click below to upload parcel documents (PDF, JPG, PNG up to 10MB)',
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
  },
  
  // Confirmations
  confirm: {
    delete: 'Are you sure you want to delete this document?',
  },
};