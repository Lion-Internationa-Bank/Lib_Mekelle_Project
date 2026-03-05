export const parcelInfo = {
  title: 'የመሬት ቦታ መረጃ',
  loading: 'የመሬት ቦታ መረጃ በመጫን ላይ...',
  notAvailable: '—',
  
  // Sections
  sections: {
    basic: 'መሰረታዊ መረጃ',
    location: 'አካባቢ',
    tenure: 'ይዞታ እና ምደባ',
    boundary: 'የድንበር መረጃ',
  },
  
  // Fields
  fields: {
    upin: 'ዩፒን',
    fileNumber: 'የፋይል ቁጥር',
    totalArea: 'ጠቅላላ ስፋት',
    tender: 'ጨረታ',
    subCity: 'ንኡስ ከተማ',
    tabia: 'ጣቢያ',
    ketena: 'ቀጠና',
    block: 'ብሎክ',
    landUse: 'የመሬት አጠቃቀም',
    tenureType: 'የይዞታ አይነት',
    landGrade: 'የመሬት ደረጃ',
    north: 'ሰሜን',
    east: 'ምስራቅ',
    south: 'ደቡብ',
    west: 'ምዕራብ',
    boundaryCoords: 'የድንበር መጋጠሚያዎች',
    json: '(ጄሶን)',
    none: 'የለም',
    noCoordinates: 'ምንም መጋጠሚያዎች የሉም',
  },
  
  // Actions
  actions: {
    menu: 'የመሬት ቦታ ድርጊቶች',
    edit: 'የመሬት ቦታ ዝርዝሮችን አርትዕ',
        addCoOwner: 'ተባባሪ ባለቤት ጨምር',
    subdivide: 'መሬት ቦታን ከፍል',
  },
  
  // Co-owner section
  coowner: {
    modalTitle: 'ተባባሪ ባለቤት ጨምር',
    infoTitle: 'ተባባሪ ባለቤት በ{{upin}} ላይ በመጨመር ላይ',
    currentOwners: 'የአሁን ባለቤቶች፡ {{count}}',
    approvalNote: 'ጥያቄዎ በከፍተኛ ባለስልጣን ለማፅደቅ ይቀርባል።',
    directPermission: 'ባለቤቶችን በቀጥታ የመጨመር ፈቃድ አለዎት።',
    searchLabel: 'ያለውን ባለቤት ይፈልጉ',
    searchPlaceholder: 'በስም፣ በብሄራዊ መታወቂያ፣ በስልክ ወይም በቲን ይፈልጉ...',
    id: 'መታወቂያ',
    noPhone: 'ስልክ የለም',
    tin: 'ቲን',
    noResults: 'ተዛማጅ ባለቤቶች አልተገኙም',
    createNew: 'አዲስ ባለቤት ፍጠር',
    addingOwner: '{{name}}ን እንደ ተባባሪ ባለቤት በመጨመር ላይ ለ',
    acquisitionDate: 'የተገኘበት ቀን',
    datePlaceholder: 'የተገኘበት ቀን ይምረጡ',
    dateHint: 'ይህ ባለቤት የመሬት ቦታውን የተረከበበት ቀን',
    submitForApproval: 'ለማፅደቅ አስገባ',
    uploadTitle: 'ለ{{name}} ተባባሪ ባለቤት ሰነዶችን ይስቀሉ',
    uploadDescription: '{{name}}ን እንደ ተባባሪ ባለቤት ለመጨመር ደጋፊ ሰነዶችን ይስቀሉ',
    submitted: 'ተባባሪ ባለቤት መጨመር ጥያቄ ለማፅደቅ ቀርቧል',
    added: 'ተባባሪ ባለቤት በተሳካ ሁኔታ ተጨምሯል',
    addFailed: 'ተባባሪ ባለቤት መጨመር አልተሳካም',
  },
  
  // New owner
  newowner: {
    validation: 'ሙሉ ስም እና ብሄራዊ መታወቂያ ያስፈልጋሉ',
    uploadTitle: 'ለ{{name}} አዲስ ባለቤት ሰነዶችን ይስቀሉ',
    uploadDescription: 'ለአዲሱ ባለቤት {{name}} ደጋፊ ሰነዶችን ይስቀሉ',
    submitted: 'አዲስ ባለቤት መፍጠር ጥያቄ ለማፅደቅ ቀርቧል',
    created: 'ባለቤት በተሳካ ሁኔታ ተፈጥሯል',
    createFailed: 'ባለቤት መፍጠር አልተሳካም',
  },
};