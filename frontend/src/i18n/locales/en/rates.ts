export const rates = {
  pageTitle: 'Rate Configurations',
  pageDescription: 'Manage interest, penalty and other revenue-related rates.',
  rateTypes: 'Rate Types',
  
  // Rate types
  types: {
    LEASE_INTEREST_RATE: {
      label: 'Lease Interest Rate',
      description: 'Annual interest rate applied to lease agreements (%)',
    },
    PENALTY_RATE: {
      label: 'Penalty Rate',
      description: 'Penalty rate for late payments or violations (%)',
    },
  },
  
  // Status
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
  
  // Fields
  fields: {
    value: 'Rate Value (%)',
    effectiveFrom: 'Effective From',
    effectiveUntil: 'Effective Until',
    source: 'Source / Reference',
  },
  
  // Placeholders
  placeholders: {
    value: 'e.g. 12.50',
    effectiveFrom: 'Select start date',
    effectiveUntil: 'Select end date (optional)',
    source: 'e.g., Council Resolution No. 123...',
  },
  
  // Hints
  hints: {
    value: 'Enter rate as percentage (e.g., 12.5 for 12.5%)',
  },
  
  // Current rate info
  current: {
    effectiveFrom: 'Currently effective from',
    to: 'to',
    noEndDate: '(no end date)',
  },
  
  // Actions
  actions: {
    hideTypes: 'Hide Rate Types',
    showTypes: 'Show Rate Types',
    addNew: 'Add new rate',
    updateCurrent: 'Update current rate',
    create: 'Create Rate',
    update: 'Update Rate',
  },
  
  // Messages
  messages: {
    createSuccess: 'Rate created successfully!',
    createDescription: 'New {{type}} rate has been created.',
    updateSuccess: 'Rate updated successfully!',
    updateDescription: 'The {{type}} has been updated.',
    deactivateSuccess: 'Rate deactivated successfully',
  },
  
  // Errors
  errors: {
    fetchFailed: 'Failed to load current rate',
    noCurrentRate: 'No currently effective rate for this type',
    createFailed: 'Failed to create rate',
    updateFailed: 'Failed to update rate',
    deactivateFailed: 'Failed to deactivate rate',
    createGeneric: 'Could not create the rate. Please try again.',
    updateGeneric: 'Could not update the rate. Please try again.',
    networkError: 'A network error occurred. Please try again.',
  },
  
  // Validation
  validation: {
    valueBetween: 'Rate must be a number between 0 and 100',
    effectiveFromRequired: 'Effective from date is required',
  },
  
  // Loading
  loading: 'Loading current rate...',
  
  // History
  history: {
    title: 'Rate History',
    empty: 'No history found for this rate type.',
    yes: 'Yes',
    no: 'No',
    columns: {
      value: 'Value',
      effectiveFrom: 'Effective From',
      effectiveUntil: 'Effective Until',
      active: 'Active',
      source: 'Source',
      updatedAt: 'Updated At',
    },
  },
  
  // Access denied
  accessDenied: {
    title: 'Access Denied',
    message: 'Only Revenue Administrators can manage rate configurations.',
  },
};