export const wizard = {
  // Steps
  steps: {
    parcel: 'Parcel Info',
    parcelDocs: 'Parcel Docs',
    owner: 'Owner Info',
    ownerDocs: 'Owner Docs',
    lease: 'Lease Info',
    leaseDocs: 'Lease Docs',
    validation: 'Review & Submit',
  },
  
  // Session
  session: {
    label: 'Session',
    updated: 'Updated',
  },
  
  // Progress
  progress: {
    step: 'Step {{current}} of {{total}}',
    ownerDocsSkipped: '(Owner Docs Skipped)',
    leaseStepsSkipped: '(Lease Steps Skipped)',
  },
  
  // Status
  status: {
    pending: 'Pending Approval',
    rejected: 'Rejected',
    completed: 'Completed',
    approved: 'Approved',
  },
  
  // Badges
  badges: {
    existingOwner: 'Existing Owner',
    nonLease: 'Non-Lease Parcel',
  },
  
  // Actions
  actions: {
    backToDashboard: 'Back to Dashboard',
  },
  
  // Loading
  loading: {
    initializing: 'Initializing wizard session...',
    sessionData: 'Loading session data...',
  },
  
  // Errors
  errors: {
    createFailed: 'Failed to create/load session',
    initFailed: 'Failed to initialize wizard session',
    sessionError: 'Session Error',
    sessionErrorDesc: 'Failed to load wizard session. Please try again.',
    sessionId: 'Session ID from URL',
    none: 'none',
    hasSessionLoaded: 'Has session loaded',
    currentSession: 'Current session',
  },
  
  // Messages
  messages: {
    rejectedWarning: 'This session was previously rejected. Please update the information and resubmit.',
  },
  
  // Debug
  debug: {
    title: 'Debug Info',
    step: 'Step',
    existingOwner: 'Existing Owner',
    isLease: 'Is Lease',
    tenure: 'Tenure',
    parcel: 'Parcel',
    owner: 'Owner',
    ownerId: 'Owner ID',
    lease: 'Lease',
  },
};