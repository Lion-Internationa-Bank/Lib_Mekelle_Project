export const parcelStep = {
  title: 'Register Land Parcel',
  subtitle: 'Fill in all required fields to register a new parcel',
  
  // Fields
  fields: {
    upin: 'UPIN',
    fileNumber: 'File Number',
    ketena: 'Ketena',
    tabia: 'Tabia',
    block: 'Block',
    totalArea: 'Total Area (m²)',
    landUse: 'Land Use',
    landGrade: 'Land Grade',
    tender: 'Tender',
    tenureType: 'Tenure Type',
    geometryData: 'Geometry Data (Optional)',
    north: 'North Boundary (optional)',
    east: 'East Boundary (optional)',
    south: 'South Boundary (optional)',
    west: 'West Boundary (optional)',
  },
  
  // Placeholders
  placeholders: {
    upin: 'e.g. MANC-2347',
    fileNumber: 'e.g. FIL-2026-001',
    ketena: 'e.g. Ketena 01',
    tabia: 'e.g. Tabia 05',
    block: 'e.g. Block A',
    landGrade: 'e.g. 1.0',
    tender: 'e.g. tender 01',
    selectLandUse: 'Select Land Use',
    selectTenureType: 'Select Tenure Type',
    geometryData: '{"type": "Polygon", "coordinates": [...]}',
    north: 'e.g. North boundary description',
    east: 'e.g. East boundary description',
    south: 'e.g. South boundary description',
    west: 'e.g. West boundary description',
  },
  
  // Actions
  actions: {
    fillExample: 'Fill with example geometry',
    saveAndContinue: 'Save Parcel & Continue →',
  },
  
  // Messages
  messages: {
    saveSuccess: 'Parcel information saved',
  },
  
  // Errors
  errors: {
    loadConfig: 'Failed to load configuration options',
    saveFailed: 'Failed to save parcel information',
  },
};