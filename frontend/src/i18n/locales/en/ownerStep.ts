export const ownerStep = {
  title: 'Register Owner',
  subtitle: {
    newOwner: 'Register a new owner or search for an existing one',
    existingOwner: 'Using existing owner: {{name}}',
  },
  
  // Fields
  fields: {
    fullName: 'Full Name',
    nationalId: 'National ID',
    phone: 'Phone Number',
    tin: 'TIN Number',
    acquiredAt: 'Acquisition Date',
    id: 'ID',
  },
  
  // Placeholders
  placeholders: {
    fullName: 'e.g. John Doe',
    nationalId: '1234567890',
    phone: '+251911223344',
  },
  
  // Actions
  actions: {
    search: 'Search Existing Owner',
    createNew: 'Create New Owner Instead',
    change: 'Change',
    back: 'Back',
    saveAndContinue: 'Save Owner & Continue →',
    linkAndContinue: 'Link Owner & Continue →',
    goBack: 'Go Back',
  },
  
  // Search
  search: {
    title: 'Select Existing Owner',
    label: 'Search by name, national ID, phone or TIN',
    placeholder: 'Type at least 2 characters...',
    noResults: 'No matching owners found',
  },
  
  // Selected owner
  selected: {
    title: 'Using Existing Owner',
    ownerId: 'Owner ID',
    note: 'You can modify the acquisition date below. Owner details cannot be changed.',
  },
  
  // Hints
  hints: {
    acquiredAt: 'Date when this owner acquired the parcel',
  },
  
  // Notes
  note: {
    title: 'Note',
    item1: 'You can either create a new owner or link an existing one',
    item2: 'When linking an existing owner, their details are shown but cannot be edited',
    item3: 'Only one owner can be registered per wizard session',
    item4: 'For multiple owners, submit this session first then add additional owners later',
  },
  
  // Messages
  messages: {
    ownerSelected: 'Selected existing owner: {{name}}',
    existingOwnerSaved: 'Existing owner linked successfully',
    newOwnerSaved: 'New owner information saved',
  },
  
  // Errors
  errors: {
    saveFailed: 'Failed to save owner information',
    missingParcel: 'Missing Parcel Information',
    missingParcelDesc: 'Please complete the Parcel step first.',
  },
};