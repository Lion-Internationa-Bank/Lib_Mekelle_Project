export const validationStep = {
  title: 'Review & Submit',
  subtitle: {
    rejected: 'Review the rejection feedback, update your information, and resubmit',
    pending: 'This session is pending approval. You cannot make changes while it\'s being reviewed.',
    completed: 'This session has been completed. View the details below.',
    draft: 'Review your information and submit for approval',
  },
  
  // Banners
  banners: {
    rejected: {
      title: 'Session Rejected',
      description: 'This session was rejected. Please review the feedback below and make the necessary changes.',
    },
    pending: {
      title: 'Pending Approval',
      description: 'Your submission is being reviewed by an approver. You will be notified once a decision is made. No changes can be made while the session is pending.',
    },
    completed: {
      title: 'Session Completed',
      description: 'This parcel has been successfully registered. You can view the details below.',
    },
    draft: {
      title: 'Ready for Submission',
      ready: 'All required information is complete. You can now submit this parcel for approval.',
    },
  },
  
  // Summary
  summary: {
    title: 'Summary',
    parcel: 'Parcel Information',
    owner: 'Owner Information',
    lease: 'Lease Information',
  },
  
  // Fields
  fields: {
    upin: 'UPIN',
    fileNumber: 'File Number',
    area: 'Area',
    landUse: 'Land Use',
    tenureType: 'Tenure Type',
    location: 'Location',
    documents: 'Documents',
    name: 'Name',
    nationalId: 'National ID',
    phone: 'Phone',
    acquiredAt: 'Acquired At',
    totalAmount: 'Total Amount',
    leasePeriod: 'Lease Period',
    startDate: 'Start Date',
    pricePerM2: 'Price/m²',
    paymentTerm: 'Payment Term',
    downPayment: 'Down Payment',
    legalFramework: 'Legal Framework',
    contractDate: 'Contract Date',
  },
  
  // Stats
  stats: {
    totalDocuments: 'Total Documents',
    parcelArea: 'Parcel Area',
    owners: 'Owners',
    lastUpdated: 'Last Updated',
  },
  
  // Session
  session: {
    status: 'Session Status',
    created: 'Created',
    id: 'Session ID',
  },
  
  // Status
  status: {
    pending: 'Pending Approval',
    rejected: 'Rejected',
    completed: 'Completed',
    approved: 'Approved',
    draft: 'Draft',
  },
  
  // Rejection
  rejection: {
    reason: 'Rejection Reason',
    rejectedOn: 'Rejected on',
    by: 'By',
    noReason: 'No reason provided',
  },
  
  // Validation
  validation: {
    inProgress: 'Validating...',
    ready: 'Ready to Submit',
    missing: 'Missing Information',
    validating: 'Validating session...',
    pleaseComplete: 'Please complete these steps before submitting',
    complete: 'All required information is complete.',
    submitPrompt: 'You can now submit this parcel registration for approval.',
    resubmitPrompt: 'You can now resubmit this parcel registration for approval.',
  },
  
  // Missing
  missing: {
    parcel: 'Missing parcel data',
    owner: 'Missing owner data',
  },
  
  // Not set
  notSet: 'Not set',
  notProvided: 'Not provided',
  
  // Documents
  documents: {
    count: '{{count}} uploaded',
    count_plural: '{{count}} uploaded',
  },
  
  // Years
  years: '{{count}} year',
  years_plural: '{{count}} years',
  
  // Actions
  actions: {
    hide: 'Hide',
    show: 'Show',
    goBack: 'Go Back',
    validating: 'Validating...',
    validateAgain: 'Validate Again',
    backToSummary: 'Back to Summary',
    saveAsDraft: 'Save as Draft',
    submitting: 'Submitting...',
    submit: 'Submit for Approval',
    resubmitting: 'Resubmitting...',
    resubmit: 'Resubmit for Approval',
    returnToDashboard: 'Return to Dashboard',
    revalidate: 'Re-check validation',
  },
  
  // Confirmations
  confirm: {
    resubmit: 'Are you sure you want to resubmit this rejected session for approval?',
    submit: 'Are you ready to submit this parcel registration for approval?',
  },
  
  // Messages
  messages: {
    missingInfo: 'Missing required information',
    complete: 'All required information is complete',
    resubmitted: 'Session resubmitted for approval. You will be notified when reviewed.',
    submittedForApproval: 'Submitted for approval. You will be notified when reviewed.',
    registered: 'Parcel registered successfully!',
    draftSaved: 'Session saved as draft. You can continue later.',
    draftSavedRejected: 'Changes saved. You can continue editing later.',
  },
  
  // Info Box
  infoBox: {
    rejected: {
      title: 'What happens after resubmission?',
      item1: 'Your updated submission will be reviewed again by an approver',
      item2: 'You will receive notifications about the approval status',
      item3: 'If approved, the parcel will be registered in the system',
      item4: 'You can track the status from your dashboard',
    },
    pending: {
      title: 'What happens while pending?',
      item1: 'An approver is reviewing your submission',
      item2: 'You will be notified when a decision is made',
      item3: 'No changes can be made while pending',
      item4: 'You can check the status from your dashboard',
    },
    completed: {
      title: 'What\'s next?',
      item1: 'This parcel has been successfully registered',
      item2: 'You can view it in the parcel list',
      item3: 'You can start a new registration from your dashboard',
    },
    draft: {
      title: 'What happens after submission?',
      item1: 'Your submission will be reviewed by an approver based on your role',
      item2: 'You will receive notifications about the approval status',
      item3: 'If approved, the parcel will be registered in the system',
      item4: 'If rejected, you can modify and resubmit',
      item5: 'You can track the status from your dashboard',
    },
  },
  
  // Errors
  errors: {
    noSession: 'No active session',
    invalidPayload: 'Invalid validation payload shape',
    validateFailed: 'Failed to validate session',
    fixErrors: 'Please fix validation errors before submitting',
    submissionFailed: 'Failed to submit for approval',
    draftFailed: 'Failed to save draft',
  },
  
  // Loading
  loading: 'Loading session data...',
};