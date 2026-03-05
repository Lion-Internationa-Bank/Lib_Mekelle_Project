export const users = {
  // Page Titles by role
  pageTitle: {
    CITY_ADMIN: 'የንኡስ ከተማ አድሚኖችን ያስተዳድሩ',
    CITY_APPROVER: 'የተጠቃሚ ጥያቄዎችን ያፅድቁ',
    SUBCITY_ADMIN: 'የንኡስ ከተማ ተጠቃሚዎችን ያስተዳድሩ',
    SUBCITY_APPROVER: 'የንኡስ ከተማ ተጠቃሚ ጥያቄዎችን ያፅድቁ',
    REVENUE_ADMIN: 'የገቢ ተጠቃሚዎችን ያስተዳድሩ',
    REVENUE_APPROVER: 'የገቢ ተጠቃሚ ጥያቄዎችን ያፅድቁ',
    default: 'የተጠቃሚዎች አስተዳደር',
  },
  
  // Page description
  description: 'በእርስዎ ክልል ውስጥ የተጠቃሚ መለያዎችን እና ፈቃዶችን ያስተዳድሩ',
  
  // Actions
  actions: {
    refresh: 'አድስ',
    addUser: 'ተጠቃሚ ጨምር',
    edit: 'አርትዕ',
    suspend: 'አግድ',
    activate: 'አንቃ',
    delete: 'ሰርዝ',
    view: 'ተመልከት',
  },
  
  // Stats
  stats: {
    totalUsers: 'ጠቅላላ ተጠቃሚዎች',
    activeUsers: 'ንቁ ተጠቃሚዎች',
    suspendedUsers: 'የታገዱ ተጠቃሚዎች',
  },
  
  // Filters
  filters: {
    search: 'ፈልግ',
    searchPlaceholder: 'በስም ወይም በተጠቃሚ ስም ይፈልጉ...',
    role: 'ሚና',
    status: 'ሁኔታ',
    allRoles: 'ሁሉም ሚናዎች',
    allStatuses: 'ሁሉም ሁኔታዎች',
    active: 'ንቁ',
    suspended: 'የታገደ',
  },
  
  // Status
  status: {
    active: 'ንቁ',
    inactive: 'ንቁ ያልሆነ',
    pending: 'በመጠባበቅ ላይ',
  },
  
  // Table headers
  table: {
    user: 'ተጠቃሚ',
    role: 'ሚና',
    subcity: 'ንኡስ ከተማ',
    status: 'ሁኔታ',
    actions: 'ድርጊቶች',
    createdAt: 'የተፈጠረበት ቀን',
    lastLogin: 'የመጨረሻ ግቤት',
  },
  
  // User fields
  fields: {
    username: 'የተጠቃሚ ስም',
    fullName: 'ሙሉ ስም',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    confirmPassword: 'የይለፍ ቃል አረጋግጥ',
    role: 'ሚና',
    subcity: 'ንኡስ ከተማ',
    status: 'ሁኔታ',
    createdAt: 'የተፈጠረበት ቀን',
    lastLogin: 'የመጨረሻ ግቤት',
  },
  
  // Placeholders
  placeholders: {
    username: 'የተጠቃሚ ስም ያስገቡ',
    fullName: 'ሙሉ ስም ያስገቡ',
    email: 'ኢሜይል አድራሻ ያስገቡ',
    password: 'የይለፍ ቃል ያስገቡ',
    confirmPassword: 'የይለፍ ቃል ያረጋግጡ',
    search: 'በስም ወይም በተጠቃሚ ስም ይፈልጉ...',
    selectRole: 'ሚና ይምረጡ',
    selectSubcity: 'ንኡስ ከተማ ይምረጡ',
  },
  
  // Messages
  messages: {
    noUsers: 'ምንም ተጠቃሚዎች አልተገኙም',
    noUsersDescription: 'ማጣሪያዎችዎን ያስተካክሉ ወይም አዲስ ተጠቃሚ ይጨምሩ።',
    loading: 'ተጠቃሚዎችን በመጫን ላይ...',
    userCreated: 'ተጠቃሚ በተሳካ ሁኔታ ተፈጠረ',
    userSuspended: 'ተጠቃሚ በተሳካ ሁኔታ ታግዷል',
    userActivated: 'ተጠቃሚ በተሳካ ሁኔታ ነቅቷል',
    userDeleted: 'ተጠቃሚ በተሳካ ሁኔታ ተሰርዟል',
    approvalSubmitted: 'የማፅደቅ ጥያቄ ቀርቧል',
    deleteConfirmation: 'ይህን ተጠቃሚ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?',
    suspendConfirmation: 'ይህን ተጠቃሚ ማገድ እንደሚፈልጉ እርግጠኛ ነዎት?',
    activateConfirmation: 'ይህን ተጠቃሚ ማንቃት እንደሚፈልጉ እርግጠኛ ነዎት?',
    cannotDeleteSelf: 'የራስዎን መለያ መሰረዝ አይችሉም',
    cannotSuspendSelf: 'የራስዎን መለያ ማገድ አይችሉም',
  },
  
  // Errors
  errors: {
    fetchFailed: 'ተጠቃሚዎችን ማምጣት አልተሳካም',
    createFailed: 'ተጠቃሚ መፍጠር አልተሳካም',
    updateFailed: 'ተጠቃሚ ማዘመን አልተሳካም',
    suspendFailed: 'ተጠቃሚ ማገድ አልተሳካም',
    activateFailed: 'ተጠቃሚ ማንቃት አልተሳካም',
    deleteFailed: 'ተጠቃሚ መሰረዝ አልተሳካም',
    usernameExists: 'የተጠቃሚ ስም ቀድሞ አለ',
    passwordMismatch: 'የይለፍ ቃሎች አይዛመዱም',
    invalidRole: 'የተሳሳተ ሚና ተመርጧል',
    required: '{{field}} ያስፈልጋል',
    minLength: '{{field}} ቢያንስ {{count}} ፊደላት መሆን አለበት',
  },
  
  
  // Suspend/Activate Modal


  
 
  
  // Role display names
  roles: {
    CITY_ADMIN: 'የከተማ አድሚን',
    CITY_APPROVER: 'የከተማ አፅዳቂ',
    SUBCITY_ADMIN: 'የንኡስ ከተማ አድሚን',
    SUBCITY_APPROVER: 'የንኡስ ከተማ አፅዳቂ',
    SUBCITY_NORMAL: 'የንኡስ ከተማ ተጠቃሚ',
    SUBCITY_AUDITOR: 'የንኡስ ከተማ ኦዲተር',
    REVENUE_ADMIN: 'የገቢ አድሚን',
    REVENUE_APPROVER: 'የገቢ አፅዳቂ',
    REVENUE_USER: 'የገቢ ተጠቃሚ',
  },
  


  subcity: {
    none: 'የለም',
    yourSubcity: '(የእርስዎ ንኡስ ከተማ)',
    adminRestriction: 'እንደ ንኡስ ከተማ አድሚን፣ በራስዎ ንኡስ ከተማ ውስጥ ብቻ ተጠቃሚዎችን መፍጠር ይችላሉ',
    select: 'ንኡስ ከተማ ይምረጡ',
    selectDescription: 'ይህ ተጠቃሚ የሚያስተዳድረውን ንኡስ ከተማ ይምረጡ',
    enterDescription: 'ለዚህ ተጠቃሚ የንኡስ ከተማ መታወቂያ ያስገቡ',
  },
  
  addUser: {
    title: 'አዲስ ተጠቃሚ ጨምር',
    subtitle: 'አዲስ የተጠቃሚ መለያ ይፍጠሩ',
    requiresApproval: 'ይህ ተጠቃሚ መፍጠር ማፅደቅ ይጠይቃል',
    approvalMessage: 'ጥያቄዎ በአፅዳቂ ለግምገማ ይላካል። ተጠቃሚው ከተፀደቀ በኋላ ይፈጠራል።',
    passwordHint: 'ቢያንስ 6 ፊደላት',
    submit: 'ተጠቃሚ ፍጠር',
    submitForApproval: 'ለማፅደቅ አስገባ',
    submitting: 'በመፍጠር ላይ...',
  },
  
  suspendModal: {
    title_suspend: 'ተጠቃሚ አግድ',
    title_activate: 'ተጠቃሚ አንቃ',
    confirmMessage_suspend: '{{name}}ን ማገድ እንደሚፈልጉ እርግጠኛ ነዎት?',
    confirmMessage_activate: '{{name}}ን ማንቃት እንደሚፈልጉ እርግጠኛ ነዎት?',
    reasonRequired: 'ለዚህ ድርጊት ምክንያት (ያስፈልጋል)',
    reasonOptional: 'ለዚህ ድርጊት ምክንያት (አማራጭ)',
    reasonPlaceholder: 'እባክዎ ለዚህ ድርጊት ምክንያት ያቅርቡ...',
    reasonOptionalPlaceholder: 'አማራጭ ምክንያት...',
    requiresApproval: 'ይህ ድርጊት ማፅደቅ ይጠይቃል',
    approvalMessage: 'ጥያቄዎ በአፅዳቂ ለግምገማ ይላካል። ከተሰራ በኋላ ይነገርዎታል።',
    requestAction: '{{action}} ጠይቅ',
  },
  
  deleteModal: {
    title: 'ተጠቃሚ ሰርዝ',
    confirmMessage: '{{name}}ን መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?',
    reasonLabel: 'ለመሰረዝ ምክንያት (አማራጭ)',
    reasonPlaceholder: 'እባክዎ ለዚህ መሰረዝ ምክንያት ያቅርቡ...',
    requiresApproval: 'ይህ ድርጊት ማፅደቅ ይጠይቃል',
    approvalMessage: 'ጥያቄዎ በአፅዳቂ ለግምገማ ይላካል። ከተሰራ በኋላ ይነገርዎታል።',
    confirmButton: 'መሰረዝ ጠይቅ',
  },
  
  approvalModal: {
    title: 'የማፅደቅ ጥያቄ ቀርቧል',
    message: 'የ{{entity}} {{action}} ጥያቄዎ ለማፅደቅ ቀርቧል።',
    requestId: 'የጥያቄ መታወቂያ',
    status: 'ሁኔታ',
    pending: 'ማፅደቅ በመጠበቅ ላይ',
    action: 'ድርጊት',
    notification: 'አፅዳቂው ጥያቄዎን ሲገመግም ይነገርዎታል።',
    close: 'ገባኝ',
  },
  
  accessDenied: {
    title: 'መዳረሻ አልተፈቀደም',
    message: 'ይህን ገጽ የማየት ፈቃድ የለዎትም።',
  },

};