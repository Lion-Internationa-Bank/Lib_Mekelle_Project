export const subcity = {
  pageTitle: 'ምሕደራ ክፍለ-ከተማታት',
  pageDescription: 'ኣብ ውሽጢ ምሕደራ ከተማ ዝርከቡ ኩሎም ክፍለ-ከተማታት ኣብዚ የመሓድሩ',
  
  // Stats
  stats: {
    total: '{{count}} ክፍለ-ከተማ',
    total_plural: '{{count}} ክፍለ-ከተማታት',
  },
  
  // Actions
  actions: {
    add: 'ክፍለ-ከተማ ወስኽ',
    edit: 'ክፍለ-ከተማ ኣስተኻኽል',
    delete: 'ክፍለ-ከተማ ሰርዝ',
  },
  
  // Form
  form: {
    createTitle: 'ሓድሽ ክፍለ-ከተማ ወስኽ',
    editTitle: 'ክፍለ-ከተማ ኣስተኻኽል',
    name: 'ስም ክፍለ-ከተማ',
    namePlaceholder: 'ንኣብነት፡ ቦሌ፡ ቂርቆስ፡ ልደታ',
    nameHint: 'ወግዓዊ ስም እቲ ክፍለ-ከተማ የእትዉ',
    description: 'መግለጺ',
    descriptionPlaceholder: 'ብዛዕባ እዚ ክፍለ-ከተማ ዝሓጸረ መግለጺ...',
    descriptionHint: 'ብዛዕባ እዚ ክፍለ-ከተማ ዝኾነ ኣገዳሲ ሓበሬታ ወስኽ',
    create: 'ክፍለ-ከተማ ፍጠር',
    update: 'ክፍለ-ከተማ ኣሐድስ',
  },
  
  // Search
  search: {
    placeholder: 'ብሽም ወይ ብመግለጺ ድለ...',
    showing: 'ካብ {{total}} እቲ {{filtered}} ይርአ ኣሎ',
    resultsFor: 'ናይ "{{term}}" ውጽኢት ይርአ ኣሎ',
  },
  
  // Table
  table: {
    title: 'ኩሎም ክፍለ-ከተማታት',
    name: 'ስም',
    description: 'መግለጺ',
    created: 'ዝተፈጥረሉ ዕለት',
    actions: 'ተግባራት',
    noDescription: 'መግለጺ የለን',
    total: '{{count}} ክፍለ-ከተማ',
    total_plural: '{{count}} ክፍለ-ከተማታት',
    footer: 'ጠቕላላ ክፍለ-ከተማታት: {{count}}',
  },
  
  // Empty states
  empty: {
    noData: 'ዛጊት ዝተመዝገበ ክፍለ-ከተማ የለን',
    noDataDescription: 'ኣብ ላዕሊ ዘሎ "ክፍለ-ከተማ ወስኽ" ዝብል መጠወቂ ብምጥቃም ይጀምሩ።',
    search: 'ዝተደለየ ክፍለ-ከተማ ኣይተረኽበን',
    searchDescription: 'ካልእ ቃላት ተጠቒምካ ድለ',
    addFirst: 'ቀዳማይ ክፍለ-ከተማ ወስኽ',
  },
  
  // Loading
  loading: 'ክፍለ-ከተማታት ይጽዓኑ ኣለዉ...',
  
  // Messages
  messages: {
    createSuccess: 'ክፍለ-ከተማ ብዓወት ተፈጢሩ ኣሎ!',
    updateSuccess: 'ክፍለ-ከተማ ብዓወት ተሓዲሱ ኣሎ!',
    deleteSuccess: 'ክፍለ-ከተማ ብዓወት ተሰሪዙ ኣሎ!',
  },
  
  // Errors
  errors: {
    fetchFailed: 'ክፍለ-ከተማታት ንምጽዓን ኣይተኻእለን',
    operationFailed: 'እቲ ተግባር ኣይተዓወተን',
    deleteFailed: 'ክፍለ-ከተማ ንምስራዝ ኣይተኻእለን',
    networkError: 'ናይ ኢንተርኔት ጸገም ኣጋጢሙ',
  },
  
  // Validation
  validation: {
    nameRequired: 'ስም ክፍለ-ከተማ ኣድላዪ እዩ',
  },
  
  // Confirmations
  confirm: {
    delete: 'ነዚ ክፍለ-ከተማ ክትሰርዞ ርግጸኛ ዲኻ? እዚ ተግባር ክምለስ ኣይክእልን እዩ።',
  },
  
  // Access denied
  accessDenied: {
    title: 'ፍቓድ የብልካን',
    message: 'እዚ ገጽ ንሓለፍቲ ምሕደራ ከተማ ጥራይ ዝፍቀድ እዩ።',
    currentRole: 'ናይ ሕጂ ግደኻ (Role):',
    notAuthenticated: 'መንነትካ ኣይተረጋገጸን',
  },
};
