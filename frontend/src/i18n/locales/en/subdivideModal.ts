export const subdivideModal = {
  title: 'Subdivide Parcel',
  parentUpin: 'Parent UPIN',
  parentParcel: 'Parent Parcel',
  totalArea: 'Total Area',
  areaBalance: 'Area Balance',
  difference: '{{diff}} m² difference',
  enterAreas: 'Enter child areas',
  ownersToCopy: 'Owners to copy',
  
  // Child parcel
  childParcel: 'Child Parcel {{letter}}',
  addChild: 'Add Another Child Parcel',
  hideBoundaries: 'Hide Boundary Details',
  addBoundaries: 'Add/Edit Boundary Details',
  
  // Fields
  fields: {
    upin: 'UPIN',
    fileNumber: 'File Number',
    totalArea: 'Total Area (m²)',
    boundaryCoords: 'Boundary Coordinates (JSON)',
    north: 'North Boundary',
    east: 'East Boundary',
    south: 'South Boundary',
    west: 'West Boundary',
  },
  
  // Placeholders
  placeholders: {
    boundaryCoords: '{"type":"Polygon","coordinates":[[[...]]]}',
  },
  
  // Messages
  messages: {
    submitted: 'Subdivision request submitted for approval',
    success: 'Parcel subdivided successfully',
  },
  
  // Errors
  errors: {
    minChildren: 'Minimum 2 child parcels required for subdivision',
    areaExceeds: 'Total child area ({{total}} m²) exceeds parent area ({{parent}} m²)',
    areaMismatch: 'Total child area ({{total}} m²) must equal parent area ({{parent}} m²)',
    areaPositive: 'All child parcels must have positive area',
    duplicateUpin: 'Duplicate UPINs detected. Each child must have a unique UPIN.',
    duplicateFileNumber: 'Duplicate file numbers detected. Each child must have a unique file number.',
    failed: 'Failed to subdivide parcel',
  },
  
  submitForApproval: 'Submit for Approval',
};