export const parcelInfo = {
  title: 'Parcel Information',
  loading: 'Loading parcel information...',
  notAvailable: '—',
  
  // Sections
  sections: {
    basic: 'Basic Information',
    location: 'Location',
    tenure: 'Tenure & Classification',
    boundary: 'Boundary Information',
  },
  
  // Fields
  fields: {
    upin: 'UPIN',
    fileNumber: 'File Number',
    totalArea: 'Total Area',
    tender: 'Tender',
    subCity: 'Sub City',
    tabia: 'Tabia',
    ketena: 'Ketena',
    block: 'Block',
    landUse: 'Land Use',
    tenureType: 'Tenure Type',
    landGrade: 'Land Grade',
    north: 'North',
    east: 'East',
    south: 'South',
    west: 'West',
    boundaryCoords: 'Boundary Coordinates',
    json: '(JSON)',
    none: 'none',
    noCoordinates: 'No coordinates available',
  },
  
  // Actions
  actions: {
    menu: 'Parcel actions',
    edit: 'Edit Parcel Details',
    addCoOwner: 'Add Co-Owner',
    subdivide: 'Subdivide Parcel',
  },
  
  // Co-owner section
  coowner: {
    modalTitle: 'Add Co-Owner',
    infoTitle: 'Adding Co-Owner to {{upin}}',
    currentOwners: 'Current owners: {{count}}',
    approvalNote: 'Your request will be submitted for approval by a higher authority.',
    directPermission: 'You have permission to add owners directly.',
    searchLabel: 'Search Existing Owner',
    searchPlaceholder: 'Search by name, national ID, phone or TIN...',
    id: 'ID',
    noPhone: 'No phone',
    tin: 'TIN',
    noResults: 'No matching owners found',
    createNew: 'Create New Owner',
    addingOwner: 'Adding <span class="font-medium">{{name}}</span> as co-owner to',
    acquisitionDate: 'Acquisition Date',
    datePlaceholder: 'Select acquisition date',
    dateHint: 'Date when this owner acquired ownership of the parcel',
    submitForApproval: 'Submit for Approval',
    uploadTitle: 'Upload Co-Owner Documents for {{name}}',
    uploadDescription: 'Upload supporting documents for adding {{name}} as co-owner',
    submitted: 'Co-owner addition request submitted for approval',
    added: 'Co-owner added successfully',
    addFailed: 'Failed to add co-owner',
  },
  
  // New owner
  newowner: {
    validation: 'Full name and National ID are required',
    uploadTitle: 'Upload New Owner Documents for {{name}}',
    uploadDescription: 'Upload supporting documents for new owner {{name}}',
    submitted: 'New owner creation request submitted for approval',
    created: 'Owner created successfully',
    createFailed: 'Failed to create owner',
  },
};