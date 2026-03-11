export const configs = {
  pageTitle: 'የስርዓት ውቅረቶች',
  pageDescription: {
    cityAdmin: 'ከመሬት እና ከንብረት ጋር የተያያዙ የውቅረት አማራጮችን ያስተዳድሩ',
    revenueAdmin: 'የክፍያ ውቅረት አማራጮችን ያስተዳድሩ',
  },
  
  // Sidebar
  sidebar: {
    title: 'የተፈቀዱ ምድቦች',
    noCategories: 'ለእርስዎ ሚና ምንም ምድቦች የሉም',
  },
  
  // Categories
  categories: {
    LAND_TENURE: {
      label: 'የመሬት ይዞታ አይነቶች',
      description: 'የባለቤትነት እና የይዞታ አይነቶች (ለምሳሌ፡ ነፃ ይዞታ፣ ሊዝ)',
    },
    LAND_USE: {
      label: 'የመሬት አጠቃቀም ምድቦች',
      description: 'የተፈቀዱ የመሬት አጠቃቀሞች (ለምሳሌ፡ መኖሪያ፣ ንግድ)',
    },
    ENCUMBRANCE_TYPE: {
      label: 'እግድ አይነቶች',
      description: 'የእገዳ/የማስያዣ አይነቶች (ለምሳሌ፡ ብድር ማስያዣ፣ የፍርድ ቤት እገዳ)',
    },
    TRANSFER_TYPE: {
      label: 'የዝውውር አይነቶች',
      description: 'የንብረት ዝውውር ዘዴዎች (ለምሳሌ፡ ሽያጭ፣ ስጦታ፣ ውርስ)',
    },
  },
  
  // Options
  options: {
    title: 'የውቅረት አማራጮች',
    addButton: 'አማራጭ ጨምር',
    remove: 'አማራጭ አስወግድ',
    valuePlaceholder: 'የአማራጭ እሴት (ያስፈልጋል)',
    descriptionPlaceholder: 'መግለጫ (አማራጭ)',
    empty: {
      title: 'እስካሁን ምንም አማራጮች አልተዋቀሩም',
      description: 'ከላይ የመጀመሪያ የውቅረት አማራጭዎን ያክሉ',
    },
  },
  
  // Save button
  saveButton: 'ውቅረት አስቀምጥ',
  
  // Loading
  loading: 'ውቅረትን በመጫን ላይ...',
  
  // No category selected
  noCategory: {
    title: 'ምንም ምድብ አልተመረጠም',
    description: 'በግራ በኩል ካለው ዝርዝር ውስጥ የውቅረት ምድብ ይምረጡ',
    categoriesAvailable: '{{count}} ምድብ ለእርስዎ ሚና ይገኛል',
    categoriesAvailable_plural: '{{count}} ምድቦች ለእርስዎ ሚና ይገኛሉ',
  },
  
  // Messages
  messages: {
    saveSuccess: 'ውቅረት በተሳካ ሁኔታ ተቀምጧል!',
  },
  
  // Errors
  errors: {
    fetchFailed: 'ውቅረትን ማምጣት አልተሳካም',
    saveFailed: 'ውቅረትን ማስቀመጥ አልተሳካም',
    networkError: 'በማስቀመጥ ላይ የኔትወርክ ስህተት ተከስቷል',
  },
  
  // Validation
  validation: {
    valueRequired: 'ሁሉም የአማራጭ እሴቶች ያስፈልጋሉ',
    valueUnique: 'የአማራጭ እሴቶች የተለዩ መሆን አለባቸው',
  },
  
  // Access denied
  accessDenied: {
    title: 'መዳረሻ አልተፈቀደም',
    message: 'የከተማ አስተዳዳሪዎች እና የገቢ አስተዳዳሪዎች ብቻ የስርዓት ውቅረቶችን ማስተዳደር ይችላሉ።',
  },
};