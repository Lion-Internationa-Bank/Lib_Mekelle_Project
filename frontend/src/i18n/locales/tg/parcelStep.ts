export const parcelStep = {
  title: 'ቦታ መሬት (Parcel) መዝግብ',
  subtitle: 'ሓድሽ ቦታ ንምምዝጋብ ኩሎም ዘድልዩ ባዶ ቦታታት ምልእ',
  
  // Fields
  fields: {
    upin: 'UPIN (መለለዪ ቦታ)',
    fileNumber: 'ቁጽሪ ፋይል',
    ketena: 'ከተና',
    tabia: 'ጣብያ',
    block: 'ብሎክ',
    totalArea: 'ጠቕላላ ስፍሓት (m²)',
    landUse: 'ኣጠቓቕማ መሬት',
    landGrade: 'ደረጃ መሬት',
    tender: 'ጨረታ',
    tenureType: 'ዓይነት ዋንነት',
    geometryData: 'ዳታ ጆሜትሪ (ኣማራጺ)',
    north: 'ሰሜናዊ ወሰን (ኣማራጺ)',
    east: 'ምብራቓዊ ወሰን (ኣማራጺ)',
    south: 'ደቡባዊ ወሰን (ኣማራጺ)',
    west: 'ምዕራባዊ ወሰን (ኣማራጺ)',
  },
  
  // Placeholders
  placeholders: {
    upin: 'ንኣብነት፡ MANC-2347',
    fileNumber: 'ንኣብነት፡ FIL-2026-001',
    ketena: 'ንኣብነት፡ ከተና 01',
    tabia: 'ንኣብነት፡ ጣብያ 05',
    block: 'ንኣብነት፡ ብሎክ A',
    landGrade: 'ንኣብነት፡ 1.0',
    tender: 'ንኣብነት፡ ጨረታ 01',
    selectLandUse: 'ኣጠቓቕማ መሬት ምረጽ',
    selectTenureType: 'ዓይነት ዋንነት ምረጽ',
    geometryData: '{"type": "Polygon", "coordinates": [...]}',
    north: 'ንኣብነት፡ ሰሜናዊ መግለጺ ወሰን',
    east: 'ንኣብነት፡ ምብራቓዊ መግለጺ ወሰን',
    south: 'ንኣብነት፡ ደቡባዊ መግለጺ ወሰን',
    west: 'ንኣብነት፡ ምዕራባዊ መግለጺ ወሰን',
  },
  
  // Actions
  actions: {
    fillExample: 'ብኣብነት ጆሜትሪ ምልእ',
    saveAndContinue: 'ቦታ ዕቅብን ቀጽልን →',
  },
  
  // Messages
  messages: {
    saveSuccess: 'ሓበሬታ ቦታ ተዓቂቡ ኣሎ',
  },
  
  // Errors
  errors: {
    loadConfig: 'ምርጫታት ምድላው (Configurations) ክመጽኡ ኣይከኣሉን',
    saveFailed: 'ሓበሬታ ቦታ ንምዕቃብ ኣይተኻእለን',
  },
};
