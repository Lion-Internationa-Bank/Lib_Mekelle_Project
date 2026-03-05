export const subcity = {
  pageTitle: 'የንኡስ ከተሞች አስተዳደር',
  pageDescription: 'በከተማ አስተዳደር ውስጥ ያሉ ሁሉንም ንኡስ ከተሞች ያስተዳድሩ',
  
  // Stats
  stats: {
    total: '{{count}} ንኡስ ከተማ',
    total_plural: '{{count}} ንኡስ ከተሞች',
  },
  
  // Actions
  actions: {
    add: 'ንኡስ ከተማ ጨምር',
    edit: 'ንኡስ ከተማ አርትዕ',
    delete: 'ንኡስ ከተማ ሰርዝ',
  },
  
  // Form
  form: {
    createTitle: 'አዲስ ንኡስ ከተማ ጨምር',
    editTitle: 'ንኡስ ከተማ አርትዕ',
    name: 'የንኡስ ከተማ ስም',
    namePlaceholder: 'ለምሳሌ፡ ቦሌ፣ ቂርቆስ፣ ልደታ',
    nameHint: 'የንኡስ ከተማውን ይፋዊ ስም ያስገቡ',
    description: 'መግለጫ',
    descriptionPlaceholder: 'ስለዚህ ንኡስ ከተማ አጭር መግለጫ...',
    descriptionHint: 'ስለዚህ ንኡስ ከተማ ማንኛውንም ጠቃሚ ዝርዝር መረጃ ያክሉ',
    create: 'ንኡስ ከተማ ፍጠር',
    update: 'ንኡስ ከተማ አዘምን',
  },
  
  // Search
  search: {
    placeholder: 'ንኡስ ከተሞችን በስም ወይም በመግለጫ ይፈልጉ...',
    showing: 'ከ{{total}} ውስጥ {{filtered}} እያሳየ ነው',
    resultsFor: 'ውጤቶች ለ: "{{term}}"',
  },
  
  // Table
  table: {
    title: 'ሁሉም ንኡስ ከተሞች',
    name: 'ስም',
    description: 'መግለጫ',
    created: 'የተፈጠረበት ቀን',
    actions: 'ድርጊቶች',
    noDescription: 'መግለጫ የለም',
    total: '{{count}} ንኡስ ከተማ',
    total_plural: '{{count}} ንኡስ ከተሞች',
    footer: 'ጠቅላላ ንኡስ ከተሞች: {{count}}',
  },
  
  // Empty states
  empty: {
    noData: 'እስካሁን ምንም ንኡስ ከተሞች የሉም',
    noDataDescription: 'ከላይ ያለውን "ንኡስ ከተማ ጨምር" ቁልፍ በመጠቀም የመጀመሪያ ንኡስ ከተማዎን በማከል ይጀምሩ።',
    search: 'ተዛማጅ ንኡስ ከተሞች አልተገኙም',
    searchDescription: 'የፍለጋ ቃላትዎን ወይም ማጣሪያዎችዎን ለማስተካከል ይሞክሩ',
    addFirst: 'የመጀመሪያ ንኡስ ከተማዎን ያክሉ',
  },
  
  // Loading
  loading: 'ንኡስ ከተሞችን በመጫን ላይ...',
  
  // Messages
  messages: {
    createSuccess: 'ንኡስ ከተማ በተሳካ ሁኔታ ተፈጠረ!',
    updateSuccess: 'ንኡስ ከተማ በተሳካ ሁኔታ ተዘምኗል!',
    deleteSuccess: 'ንኡስ ከተማ በተሳካ ሁኔታ ተሰርዟል!',
  },
  
  // Errors
  errors: {
    fetchFailed: 'ንኡስ ከተሞችን ማምጣት አልተሳካም',
    operationFailed: 'ክዋኔው አልተሳካም',
    deleteFailed: 'ንኡስ ከተማን መሰረዝ አልተሳካም',
    networkError: 'የኔትወርክ ስህተት ተከስቷል',
  },
  
  // Validation
  validation: {
    nameRequired: 'የንኡስ ከተማ ስም ያስፈልጋል',
  },
  
  // Confirmations
  confirm: {
    delete: 'ይህን ንኡስ ከተማ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ይህ ድርጊት ሊቀለበስ አይችልም።',
  },
  
  // Access denied
  accessDenied: {
    title: 'መዳረሻ አልተፈቀደም',
    message: 'ይህ ገጽ ለከተማ አስተዳዳሪዎች ብቻ ተደራሽ ነው።',
    currentRole: 'የአሁን ሚናዎ:',
    notAuthenticated: 'አልተረጋገጠም',
  },
};