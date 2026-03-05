export const parcelStep = {
  title: 'የመሬት ቦታ ይመዝገቡ',
  subtitle: 'አዲስ መሬት ቦታ ለመመዝገብ ሁሉንም አስፈላጊ መስኮች ይሙሉ',
  
  // Fields
  fields: {
    upin: 'ዩፒን',
    fileNumber: 'የፋይል ቁጥር',
    ketena: 'ቀጠና',
    tabia: 'ጣቢያ',
    block: 'ብሎክ',
    totalArea: 'ጠቅላላ ስፋት (ሜ²)',
    landUse: 'የመሬት አጠቃቀም',
    landGrade: 'የመሬት ደረጃ',
    tender: 'ጨረታ',
    tenureType: 'የይዞታ አይነት',
    geometryData: 'የጂኦሜትሪ ውሂብ (አማራጭ)',
    north: 'ሰሜን ድንበር (አማራጭ)',
    east: 'ምስራቅ ድንበር (አማራጭ)',
    south: 'ደቡብ ድንበር (አማራጭ)',
    west: 'ምዕራብ ድንበር (አማራጭ)',
  },
  
  // Placeholders
  placeholders: {
    upin: 'ለምሳሌ MANC-2347',
    fileNumber: 'ለምሳሌ FIL-2026-001',
    ketena: 'ለምሳሌ ቀጠና 01',
    tabia: 'ለምሳሌ ጣቢያ 05',
    block: 'ለምሳሌ ብሎክ ሀ',
    landGrade: 'ለምሳሌ 1.0',
    tender: 'ለምሳሌ ጨረታ 01',
    selectLandUse: 'የመሬት አጠቃቀም ይምረጡ',
    selectTenureType: 'የይዞታ አይነት ይምረጡ',
    geometryData: '{"type": "Polygon", "coordinates": [...]}',
    north: 'ለምሳሌ የሰሜን ድንበር መግለጫ',
    east: 'ለምሳሌ የምስራቅ ድንበር መግለጫ',
    south: 'ለምሳሌ የደቡብ ድንበር መግለጫ',
    west: 'ለምሳሌ የምዕራብ ድንበር መግለጫ',
  },
  
  // Actions
  actions: {
    fillExample: 'በምሳሌ ጂኦሜትሪ ሙላ',
    saveAndContinue: 'መሬት ቦታ አስቀምጥ እና ቀጥል →',
  },
  
  // Messages
  messages: {
    saveSuccess: 'የመሬት ቦታ መረጃ ተቀምጧል',
  },
  
  // Errors
  errors: {
    loadConfig: 'የውቅረት አማራጮችን ማምጣት አልተሳካም',
    saveFailed: 'የመሬት ቦታ መረጃ ማስቀመጥ አልተሳካም',
  },
};