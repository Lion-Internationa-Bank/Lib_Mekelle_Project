export const sessions = {
  pageTitle: 'My Wizard Sessions',
  pageDescription: 'Manage your parcel registration sessions',
  
  // Loading
  loading: 'Loading your sessions...',
  
  // Filters
  filters: {
    all: 'All',
    draft: 'Draft',
    pending: 'Pending',
    rejected: 'Rejected',
    completed: 'Completed',
  },
  
  // Actions
  actions: {
    newRegistration: 'New Registration',
    startNew: 'Start New Registration',
    continue: 'Continue Session',
    resubmit: 'Resubmit for Approval',
    viewDetails: 'View Details',
  },
  
  // Status
  status: {
    draft: 'Draft',
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
  },
  
  // Steps
  steps: {
    parcel: 'Parcel Info',
    parcelDocs: 'Parcel Documents',
    owner: 'Owner Info',
    ownerDocs: 'Owner Documents',
    lease: 'Lease Info',
    leaseDocs: 'Lease Documents',
    validation: 'Ready to Submit',
  },
  
  // Badges
  badges: {
    expired: 'Expired',
  },
  
  // Sections
  sections: {
    parcel: 'Parcel Information',
    owner: 'Owner Information',
    lease: 'Lease Information',
  },
  
  // Fields
  fields: {
    upin: 'UPIN',
    fileNumber: 'File Number',
    landUse: 'Land Use',
    totalArea: 'Total Area',
    tenureType: 'Tenure Type',
    location: 'Location',
    nationalId: 'National ID',
    tin: 'TIN',
    totalAmount: 'Total Amount',
    leasePeriod: 'Lease Period',
    pricePerM2: 'Price per m²',
    startDate: 'Start Date',
  },
  
  // No data
  noData: {
    parcel: 'No parcel information added yet',
    owner: 'No owner information added yet',
    lease: 'No lease information added yet',
  },
  
  // Documents
  documents: 'Documents',
  files: '{{count}} file',
  files_plural: '{{count}} files',
  noDocuments: 'No documents uploaded',
  
  // Not set
  notSet: 'Not set',
  
  // More owners
  moreOwners: 'more owner(s)',
  
  // Session info
  sessionId: 'Session ID',
  created: 'Created',
  lastUpdated: 'Last updated',
  
  // Years
  years: 'years',
  
  // Rejection
  rejection: {
    title: 'This request was rejected',
    reason: 'Reason',
    instructions: 'Click "Resubmit for Approval" to update your information and try again.',
  },
  
  // Expired
  expired: {
    warning: 'This draft session has expired and cannot be continued.',
  },
  
  // Empty state
  empty: {
    title: 'No sessions found',
    all: "You haven't started any parcel registration sessions yet.",
    rejected: 'No rejected sessions found.',
    filtered: 'No {{filter}} sessions found.',
  },
  
  // Messages
  messages: {
    resubmitInfo: 'You can now update your information and resubmit for approval',
    deleteSuccess: 'Session deleted',
  },
  
  // Errors
  errors: {
    loadFailed: 'Failed to load sessions',
    deleteFailed: 'Failed to delete session',
  },
  
  // Confirmations
  confirm: {
    delete: 'Are you sure you want to delete this session? This action cannot be undone.',
  },
  
  // Stats
  stats: {
    total: 'Total Sessions',
    draft: 'Draft',
    pending: 'Pending',
    rejected: 'Rejected',
    completed: 'Completed',
  },
  
  // Items (for pagination)
  items: 'sessions',
};