export const encumbranceModal = {
  title: {
    edit: 'Edit Encumbrance',
    create: 'Add New Encumbrance',
  },
  
  // Fields
  fields: {
    type: 'Type',
    issuingEntity: 'Issuing Entity',
    referenceNumber: 'Reference Number',
    status: 'Status',
    registrationDate: 'Registration Date',
  },
  
  // Status
  status: {
    active: 'Active',
    released: 'Released',
  },
  
  // Placeholders
  placeholders: {
    selectType: 'Select type',
  },
  
  // Buttons
  buttons: {
    update: 'Save Changes',
    create: 'Create',
  },
  
  // Messages
  messages: {
    updateSuccess: 'Encumbrance updated successfully',
    createSuccess: 'Encumbrance created successfully',
    submitted: 'Encumbrance creation request submitted for approval',
  },
  
  // Errors
  errors: {
    loadTypes: 'Failed to load encumbrance types',
    updateFailed: 'Failed to update encumbrance',
    createFailed: 'Failed to create encumbrance',
    validation: 'Validation failed',
    operationFailed: 'Operation failed',
    unexpected: 'An unexpected error occurred',
    noTypes: 'No types available',
  },
};