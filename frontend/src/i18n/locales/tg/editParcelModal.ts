export const editParcelModal = {
  title: 'ሓበሬታ ቦታ (Parcel) ኣስተኻኽል',
  
  // Fields
  fields: {
    fileNumber: 'ቁጽሪ ፋይል',
    tabia: 'ጣብያ',
    ketena: 'ከተና',
    block: 'ብሎክ',
    totalArea: 'ጠቕላላ ስፍሓት (m²)',
    landUse: 'ኣጠቓቕማ መሬት',
    landGrade: 'ደረጃ መሬት',
    tenureType: 'ዓይነት ዋንነት',
    tender: 'ጨረታ',
    north: 'ሰሜናዊ ወሰን (ኣማራጺ)',
    east: 'ምብራቓዊ ወሰን (ኣማራጺ)',
    south: 'ደቡባዊ ወሰን (ኣማራጺ)',
    west: 'ምዕራባዊ ወሰን (ኣማራጺ)',
    boundaryCoords: 'መእለኺ ነጥብታት ወሰን (JSON, ኣማራጺ)',
  },
  
  // Placeholders
  placeholders: {
    selectLandUse: 'ኣጠቓቕማ መሬት ምረጽ',
    selectTenureType: 'ዓይነት ዋንነት ምረጽ',
    north: 'ንኣብነት፡ ሰሜናዊ መግለጺ ወሰን',
    east: 'ንኣብነት፡ ምብራቓዊ መግለጺ ወሰን',
    south: 'ንኣብነት፡ ደቡባዊ መግለጺ ወሰን',
    west: 'ንኣብነት፡ ምዕራባዊ መግለጺ ወሰን',
    boundaryCoords: '{"type": "Polygon", "coordinates": [[[lon1, lat1], [lon2, lat2], ...]]}',
  },
  
  // Messages
  messages: {
    success: 'ሓበሬታ ቦታ ብትኽክል ተስተኻኺሉ ኣለዎ',
  },
  
  // Errors
  errors: {
    loadOptions: 'ካብ ሰርቨር ምርጫታት ክመጽኡ ኣይከኣሉን',
    validation: 'ዝተመልአ ሓበሬታ ጌጋ ኣለዎ',
    update: 'ቦታ ንምስትኽኻል ኣይተኻእለን',
    unexpected: 'ዘይተጸበናዮ ጌጋ ተፈጢሩ',
  },
};
