export const ownership = {
  pageTitle: 'Ownership Management',
  pageDescription: 'Manage property owners and their details',
  
  // Search
  search: {
    placeholder: 'Search owner by name, national ID, or phone...',
    button: 'Search',
  },
  
  // Actions
  actions: {
    addOwner: 'Add New Owner',
  },
  
  // Pending requests
  pending: {
    count: 'You have {{count}} pending approval request',
    count_plural: 'You have {{count}} pending approval requests',
    documentsNeeded: 'Some requests may need supporting documents',
    viewButton: 'View Pending ({{count}})',
    comingSoon: 'Pending requests feature coming soon',
  },
  
  // Messages
  messages: {
    createSuccess: 'Owner created successfully',
    updateSuccess: 'Owner updated successfully',
    deleteSuccess: 'Owner deleted successfully',
    creationSubmitted: 'Owner creation request submitted for approval',
  },
  
  // Errors
  errors: {
    fetchFailed: 'Failed to load owners',
    createFailed: 'Failed to create owner',
    updateFailed: 'Failed to update owner',
    deleteFailed: 'Failed to delete owner',
  },
  
  // Fields
  fields: {
    fullName: 'Full Name',
    nationalId: 'National ID',
    phone: 'Phone',
    tin: 'TIN',
  },
  
  // Modals
  modals: {
    create: {
      title: 'Add Owner',
      note: 'Note:',
      noteDescription: 'Owner creation may require approval. You can upload supporting documents after submission.',
    },
    edit: {
      title: 'Edit Owner',
    },
    delete: {
      title: 'Delete Owner',
      confirmMessage: 'Are you sure you want to delete owner {{name}}? Owners with active parcels cannot be deleted.',
    },
  },
  
  // Documents
  docs: {
    requestSubmitted: 'Owner Creation Request Submitted ✓',
    ownerCreated: 'Owner Created ✓',
    requestDescription: 'Upload supporting documents for the owner creation request',
    ownerDescription: 'Upload supporting documents for the new owner',
    reviewNote: 'Documents will be reviewed by the approver along with your request.',
    optionalStep: 'Optional Step',
    uploadTitle: 'Owner supporting documents',
    skipForNow: 'Skip for now',
    doneClose: 'Done – Close',
    docTypes: {
      idCopy: 'National ID Copy',
      passportPhoto: 'Passport-size Photo',
      tinCert: 'TIN Certificate',
      powerOfAttorney: 'Power of Attorney',
      other: 'Other Document',
    },
  },
  
  // Table
  table: {
    loading: 'Loading owners...',
    connecting: 'Connecting to backend API',
    headers: {
      owner: 'Owner',
      nationalId: 'National ID',
      tin: 'TIN',
      phone: 'Phone',
      parcels: 'Parcels (count)',
      actions: 'Actions',
    },
    parcels: {
      none: 'No parcels',
      count: '{{count}} parcel',
      count_plural: '{{count}} parcels',
    },
    empty: {
      title: 'No owners found',
      description: 'Try adjusting your search or add the first owner.',
      addButton: 'Add Owner',
    },
    pagination: {
      owners: 'owners',
    },
    expanded: {
      noParcels: 'No parcels registered for this owner.',
      upin: 'UPIN',
      subCity: 'Sub City',
      ketena: 'Ketena',
      area: 'Area (m²)',
      landUse: 'Land Use',
    },
    actions: {
      toggleDetails: 'Toggle owner details',
      menu: 'Owner actions menu',
      edit: 'Edit owner',
      delete: 'Delete owner',
    },
  },
};