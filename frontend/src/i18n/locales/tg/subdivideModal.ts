export const subdivideModal = {
  title: 'ቦታ መከፋፈል',
  parentUpin: 'ናይ ኣብዓል ዩፒን (Parent UPIN)',
  parentParcel: 'ኣብዓል ቦታ',
  totalArea: 'ጠቕላሊ ስፍሓት',
  areaBalance: 'ዝተረፈ ስፍሓት',
  difference: '{{diff}} ሜ² ፍልልይ',
  enterAreas: 'ስፍሓት ደቂ ቦታታት ኣተኣኻኽብ',
  ownersToCopy: 'ንምቕዳሕ ዝወሃቡ ኣብላይታት',

  // Child parcel
  childParcel: 'ደቂ ቦታ {{letter}}',
  addChild: 'ካልእ ደቂ ቦታ ወስኽ',
  hideBoundaries: 'ዝርዝር ዶርዶር ኣምባጽ',
  addBoundaries: 'ዝርዝር ዶርዶር ወስኽ / ኣርምም',

  // Fields
  fields: {
    upin: 'ዩፒን (UPIN)',
    fileNumber: 'ቁጽሪ ፋይል',
    totalArea: 'ጠቕላሊ ስፍሓት (ሜ²)',
    boundaryCoords: 'ኮኦርዲኔት ዶርዶር (JSON)',
    north: 'ሰሜን ዶርዶር',
    east: 'ምብራቕ ዶርዶር',
    south: 'ደቡብ ዶርዶር',
    west: 'ምዕራብ ዶርዶር',
  },

  // Placeholders
  placeholders: {
    boundaryCoords: '{"type":"Polygon","coordinates":[[[...]]]}',
  },

  // Messages
  messages: {
    submitted: 'ሕቶ መከፋፈል ንፍቓድ ቀሪቡ እዩ',
    success: 'ቦታ ብትክክል ተከፊሉ እዩ',
  },

  // Errors
  errors: {
    minChildren: 'ንመከፋፈል ብዙሕ ብዙሕ 2 ደቂ ቦታታት ይድልዩ',
    areaExceeds: 'ጠቕላሊ ስፍሓት ደቂ ቦታታት ({{total}} ሜ²) ካብ ስፍሓት ኣብዓል ({{parent}} ሜ²) ይበዝሕ ኣሎ',
    areaMismatch: 'ጠቕላሊ ስፍሓት ደቂ ቦታታት ({{total}} ሜ²) ምስ ስፍሓት ኣብዓል ({{parent}} ሜ²) ክስማማዕ ኣለዎ',
    areaPositive: 'ኩሎም ደቂ ቦታታት ኣዎንታዊ ስፍሓት ክህልዎም ኣለዎም',
    duplicateUpin: 'ደጋጋሚ ዩፒን ተረኺቡ። እያ ደቂ ቦታ ፍሉይ ዩፒን ክህልዎ ኣለዎ።',
    duplicateFileNumber: 'ደጋጋሚ ቁጽሪ ፋይል ተረኺቡ። እያ ደቂ ቦታ ፍሉይ ቁጽሪ ፋይል ክህልዎ ኣለዎ።',
    failed: 'ቦታ ምከፋፈል ኣይከኣለን',
  },

  submitForApproval: 'ንፍቓድ ኣቕርብ',
};