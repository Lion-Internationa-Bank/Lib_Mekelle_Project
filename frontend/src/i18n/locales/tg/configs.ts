export const configs = {
  pageTitle: 'ናይ ስርዓት ምድላዋት (Configurations)',
  pageDescription: {
    cityAdmin: 'ምድላዋት መሬትን ንብረትን ኣመሓድር',
    revenueAdmin: 'ምድላዋት ክፍሊት ኣመሓድር',
  },
  
  // Sidebar
  sidebar: {
    title: 'ዝተፈቐዱ ዓውድታት',
    noCategories: 'ንዓኻ ዝተፈቐደ ዓውዲ የለን',
  },
  
  // Categories
  categories: {
    LAND_TENURE: {
      label: 'ዓይነታት ዋንነት መሬት',
      description: 'ዓይነታት ዋንነትን ሒዛን (ንኣብነት፡ ብናጻ፣ ብሊዝ)',
    },
    LAND_USE: {
      label: 'ዓውድታት ኣጠቓቕማ መሬት',
      description: 'ንመሬት ዝተፈቐዱ ኣጠቓቕማታት (ንኣብነት፡ ንመበገሪ፣ ንንግዲ)',
    },
    ENCUMBRANCE_TYPE: {
      label: 'ዓይነታት እገዳ',
      description: 'ዓይነታት ቀይድታት ወይ ዕዳታት (ንኣብነት፡ ብመዐረፊ ዕዳ፣ ብቤት ፍርዲ ዝተኣገደ)',
    },
    TRANSFER_TYPE: {
      label: 'ዓይነታት ዝውውር',
      description: 'መገድታት ዝውውር ንብረት (ንኣብነት፡ ብሽያጥ፣ ብውህብቶ፣ ብውርሻ)',
    },
  },
  
  // Options
  options: {
    title: 'ናይ ምድላው ምርጫታት',
    addButton: 'ምርጫ ወስኽ',
    remove: 'ምርጫ ኣውጽእ',
    valuePlaceholder: 'ዋጋ ምርጫ (ግድን)',
    descriptionPlaceholder: 'መግለጺ (ኣማራጺ)',
    empty: {
      title: 'ክሳብ ሕዚ ዝተዳለወ ምርጫ የለን',
      description: 'ካብ ላዕሊ ናይ መጀመሪያ ምርጫኻ ወስኽ',
    },
  },
  
  // Save button
  saveButton: 'ምድላዋት ዕቅብ',
  
  // Loading
  loading: 'ምድላዋት ይጽዕን ኣሎ...',
  
  // No category selected
  noCategory: {
    title: 'ዝተመረጸ ዓውዲ የለን',
    description: 'ካብ ጸጋም ዘሎ ዝርዝር ሓደ ናይ ምድላው ዓውዲ ምረጽ',
    categoriesAvailable: 'ንዓኻ {{count}} ዓውዲ ይርከብ',
    categoriesAvailable_plural: 'ንዓኻ {{count}} ዓውድታት ይርከቡ',
  },
  
  // Messages
  messages: {
    saveSuccess: 'ምድላዋት ብትኽክል ተዓቂቦም ኣለዉ!',
  },
  
  // Errors
  errors: {
    fetchFailed: 'ምድላዋት ክመጽኡ ኣይከኣሉን',
    saveFailed: 'ምድላዋት ክዕቀቡ ኣይከኣሉን',
    networkError: 'ኣብ ግዜ ዕቀባ ናይ ኔትወርክ ጸገም ተፈጢሩ',
  },
  
  // Validation
  validation: {
    valueRequired: 'ኩሎም ዋጋታት ምርጫ ክምልኡ ኣለዎም',
    valueUnique: 'ዋጋታት ምርጫ ተመሳሳሊ ክኾኑ የብሎምን',
  },
  
  // Access denied
  accessDenied: {
    title: 'ፍቓድ የብልካን',
    message: 'ምምሕዳር ከተማን ምምሕዳር ኣታዊታትን ጥራይ እዮም ናይ ስርዓት ምድላዋት ከመሓድሩ ዝኽእሉ።',
  },
};
