export const parcelInfo = {
  title: 'ሓበሬታ ቦታ (Parcel)',
  loading: 'ሓበሬታ ቦታ ይጽዕን ኣሎ...',
  notAvailable: '—',
  
  // Sections
  sections: {
    basic: 'መባእታዊ ሓበሬታ',
    location: 'ቦታ/ኣድራሻ',
    tenure: 'ዋንነትን ምደባን',
    boundary: 'ሓበሬታ ወሰን/ዶብ',
  },
  
  // Fields
  fields: {
    upin: 'UPIN (መለለዪ ቦታ)',
    fileNumber: 'ቁጽሪ ፋይል',
    totalArea: 'ጠቕላላ ስፍሓት',
    tender: 'ጨረታ',
    subCity: 'ክፍለ ከተማ',
    tabia: 'ጣብያ',
    ketena: 'ከተና',
    block: 'ብሎክ',
    landUse: 'ኣጠቓቕማ መሬት',
    tenureType: 'ዓይነት ዋንነት',
    landGrade: 'ደረጃ መሬት',
    north: 'ሰሜን',
    east: 'ምብራቕ',
    south: 'ደቡብ',
    west: 'ምዕራብ',
    boundaryCoords: 'መእለኺ ነጥብታት ወሰን',
    json: '(JSON)',
    none: 'የለን',
    noCoordinates: 'ዝተመዝገበ መእለኺ ነጥቢ የለን',
  },
  
  // Actions
  actions: {
    menu: 'ተግባራት ቦታ',
    edit: 'ዝርዝር ሓበሬታ ቦታ ኣስተኻኽል',
    addCoOwner: 'ተወሳኺ ዋንኣ (Co-Owner) ወስኽ',
    subdivide: 'ቦታ ምክፍፋል (Subdivide)',
  },
  
  // Co-owner section
  coowner: {
    modalTitle: 'ተወሳኺ ዋንኣ ወስኽ',
    infoTitle: 'ንቦታ {{upin}} ተወሳኺ ዋንኣ ምውሳኽ',
    currentOwners: 'ናይ ሕዚ ዋኖት: {{count}}',
    approvalNote: 'ዘቕረብካዮ ጠለብ ብዝምልከቶ ኣካል ተገምጊሙ ክጸድቕ እዩ።',
    directPermission: 'ዋኖት ብቐጥታ ክትውስኽ ፍቓድ ኣለካ።',
    searchLabel: 'ዘሎ ዋንኣ ድለ',
    searchPlaceholder: 'ብሽም፣ መፍለዪ ቁጽሪ (ID)፣ ቴሌፎን ወይ ግብሪ (TIN) ድለ...',
    id: 'መለለዪ (ID)',
    noPhone: 'ቴሌፎን የለን',
    tin: 'ግብሪ (TIN)',
    noResults: 'ዝተረኽበ ተመሳሳሊ ዋንኣ የለን',
    createNew: 'ሓድሽ ዋንኣ ፍጠር',
    addingOwner: 'ን <span class="font-medium">{{name}}</span> ከም ተወሳኺ ዋንኣ ይውሰኽ ኣሎ ናብ',
    acquisitionDate: 'ዝተረኸበሉ ዕለት',
    datePlaceholder: 'ዝተረኸበሉ ዕለት ምረጽ',
    dateHint: 'እዚ ዋንኣ ነዚ ቦታ ዝረኸበሉ ዕለት',
    submitForApproval: 'ንምጽዳቕ ስደድ',
    uploadTitle: 'ን {{name}} ዝኾኑ ደገፍቲ ሰነዳት ኣእትው',
    uploadDescription: 'ን {{name}} ከም ተወሳኺ ዋንኣ ንምውሳኽ ዘድልዩ ሰነዳት ኣእትው',
    submitted: 'ናይ ተወሳኺ ዋንኣ ምውሳኽ ጠለብ ንምጽዳቕ ተላኢኹ ኣሎ',
    added: 'ተወሳኺ ዋንኣ ብትኽክል ተወሲኹ ኣሎ',
    addFailed: 'ተወሳኺ ዋንኣ ንምውሳኽ ኣይተኻእለን',
  },
  
  // New owner
  newowner: {
    validation: 'ምሉእ ስምን መፍለዪ ቁጽሪ (ID) ን ግድን የድልዩ',
    uploadTitle: 'ንሓድሽ ዋንኣ {{name}} ዝኾኑ ሰነዳት ኣእትው',
    uploadDescription: 'ንሓድሽ ዋንኣ {{name}} ዝኾኑ ደገፍቲ ሰነዳት ኣእትው',
    submitted: 'ናይ ሓድሽ ዋንኣ ምፍጣር ጠለብ ንምጽዳቕ ተላኢኹ ኣሎ',
    created: 'ዋንኣ ብትኽክል ተፈጢሩ ኣሎ',
    createFailed: 'ዋንኣ ንምፍጣር ኣይተኻእለን',
  },
};
