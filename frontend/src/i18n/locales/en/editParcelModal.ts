export const editParcelModal = {
  title: 'Edit Parcel',
  
  // Fields
  fields: {
    fileNumber: 'File Number',
    tabia: 'Tabia',
    ketena: 'Ketena',
    block: 'Block',
    totalArea: 'Total Area (m²)',
    landUse: 'Land Use',
    landGrade: 'Land Grade',
    tenureType: 'Tenure Type',
    tender: 'Tender',
    north: 'North Boundary (optional)',
    east: 'East Boundary (optional)',
    south: 'South Boundary (optional)',
    west: 'West Boundary (optional)',
    boundaryCoords: 'Boundary Coordinates (JSON, optional)',
  },
  
  // Placeholders
  placeholders: {
    selectLandUse: 'Select Land Use',
    selectTenureType: 'Select Tenure Type',
    north: 'e.g. North boundary description',
    east: 'e.g. East boundary description',
    south: 'e.g. South boundary description',
    west: 'e.g. West boundary description',
    boundaryCoords: '{"type": "Polygon", "coordinates": [[[lon1, lat1], [lon2, lat2], ...]]}',
  },
  
  // Messages
  messages: {
    success: 'Successfully updated parcel info',
  },
  
  // Errors
  errors: {
    loadOptions: 'Failed to load options from server',
    validation: 'Validation failed',
    update: 'Failed to update parcel',
    unexpected: 'An unexpected error occurred',
  },
};