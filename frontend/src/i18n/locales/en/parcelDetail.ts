export const parcelDetail = {
  // Header
  header: {
    upin: 'UPIN',
    fileNumber: 'File Number',
    notAvailable: '—',
  },
  
  // Actions
  actions: {
    backToDashboard: 'Back to Dashboard',
  },
  
  // Tabs
  tabs: {
    parcel: 'Parcel & Owners',
    lease: 'Lease',
    encumbrances: 'Encumbrances',
    history: 'Transfer History',
    buildings: 'Buildings',
    billing: 'Billing',
  },
  
  // Sections
  sections: {
    documents: 'Parcel Documents',
  },
  
  // Documents
  documents: {
    title: 'Documents',
    empty: 'No {{title}} uploaded.',
    view: 'View',
  },
  
  // Danger Zone
  dangerZone: {
    title: 'Danger Zone',
    description: 'Once you delete a parcel, there is no going back. All data will be permanently removed.',
    button: 'Delete this parcel',
  },
    // Delete Modal
  deleteModal: {
    title: 'Confirm Parcel Deletion',
    warning: 'This action',
    cannotUndo: 'cannot be undone.',
    description: 'All associated data will be permanently deleted.',
    confirmPrompt: 'Type the UPIN to confirm:',
    inputPlaceholder: 'Enter UPIN',
    cancel: 'Cancel',
    confirmDelete: 'Permanently Delete',
    deleting: 'Deleting...',
    success: 'Successfully deleted Land parcel',
    error: 'Failed to delete',
  },
  
  
  // Errors
  errors: {
    loadFailed: 'Failed to load parcel detail',
    networkError: 'Network error',
    notFound: 'Parcel not found',
  },
};