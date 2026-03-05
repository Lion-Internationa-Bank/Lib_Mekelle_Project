export const editParcelModal = {
  title: 'የመሬት ቦታ አርትዕ',
  
  // Fields
  fields: {
    fileNumber: 'የፋይል ቁጥር',
    tabia: 'ጣቢያ',
    ketena: 'ቀጠና',
    block: 'ብሎክ',
    totalArea: 'ጠቅላላ ስፋት (ሜ²)',
    landUse: 'የመሬት አጠቃቀም',
    landGrade: 'የመሬት ደረጃ',
    tenureType: 'የይዞታ አይነት',
    tender: 'ጨረታ',
    north: 'ሰሜን ድንበር (አማራጭ)',
    east: 'ምስራቅ ድንበር (አማራጭ)',
    south: 'ደቡብ ድንበር (አማራጭ)',
    west: 'ምዕራብ ድንበር (አማራጭ)',
    boundaryCoords: 'የድንበር መጋጠሚያዎች (ጄሶን፣ አማራጭ)',
  },
  
  // Placeholders
  placeholders: {
    selectLandUse: 'የመሬት አጠቃቀም ይምረጡ',
    selectTenureType: 'የይዞታ አይነት ይምረጡ',
    north: 'ለምሳሌ የሰሜን ድንበር መግለጫ',
    east: 'ለምሳሌ የምስራቅ ድንበር መግለጫ',
    south: 'ለምሳሌ የደቡብ ድንበር መግለጫ',
    west: 'ለምሳሌ የምዕራብ ድንበር መግለጫ',
    boundaryCoords: '{"type": "Polygon", "coordinates": [[[ረጅም1, ኬክሮስ1], [ረጅም2, ኬክሮስ2], ...]]}',
  },
  
  // Messages
  messages: {
    success: 'የመሬት ቦታ መረጃ በተሳካ ሁኔታ ተዘምኗል',
  },
  
  // Errors
  errors: {
    loadOptions: 'ከአገልጋይ አማራጮችን ማምጣት አልተሳካም',
    validation: 'ማረጋገጫ አልተሳካም',
    update: 'የመሬት ቦታ ማዘመን አልተሳካም',
    unexpected: 'ያልተጠበቀ ስህተት ተከስቷል',
  },
};