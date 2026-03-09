export const users = {
  // Page Titles by role
  pageTitle: {
    CITY_ADMIN: 'ምሕደራ ኣድማራት ንኡስ-ከተማታት',
    CITY_APPROVER: 'ምርመራ ሕቶታት ተጠቃሚታት',
    SUBCITY_ADMIN: 'ምሕደራ ተጠቃሚታት ንኡስ-ከተማ',
    SUBCITY_APPROVER: 'ምርመራ ሕቶታት ተጠቃሚታት ንኡስ-ከተማ',
    REVENUE_ADMIN: 'ምሕደራ ተጠቃሚታት ገበና',
    REVENUE_APPROVER: 'ምርመራ ሕቶታት ተጠቃሚታት ገበና',
    default: 'ምሕደራ ተጠቃሚታት',
  },

  // Page description
  description: 'ኣብ ወሰንካ ዘለዉ ኣካውንትታትን ፍቓድታትን ተጠቃሚታት ምሕደር',

  // Actions
  actions: {
    refresh: 'ምንዳድ',
    addUser: 'ተጠቃሚ ወስኽ',
    edit: 'ምምራመር',
    suspend: 'ምንጻግ',
    activate: 'ምንቃል',
    delete: 'ምስራዝ',
    view: 'ምርኣይ',
  },

  // Stats
  stats: {
    totalUsers: 'ጠቕላሊ ተጠቃሚታት',
    activeUsers: 'ዝነቅሉ ተጠቃሚታት',
    suspendedUsers: 'ዝተንጸጉ ተጠቃሚታት',
  },

  // Filters
  filters: {
    search: 'ፍለጥ',
    searchPlaceholder: 'ብስም ወይ ብመጠቀሚ ስም ፈልጥ...',
    role: 'ቦታ / ሚና',
    status: 'ደረጃ',
    allRoles: 'ኩሎም ሚናታት',
    allStatuses: 'ኩሎም ደረጃታት',
    active: 'ዝነቅል',
    suspended: 'ዝተንጸገ',
  },

  // Status
  status: {
    active: 'ዝነቅል',
    inactive: 'ዘይነቅል',
    pending: 'ዝጽበየሉ',
  },

  // Table headers
  table: {
    user: 'ተጠቃሚ',
    role: 'ሚና',
    subcity: 'ንኡስ-ከተማ',
    status: 'ደረጃ',
    actions: 'ስራሓት',
    createdAt: 'ዝተፈጠረ ግዜ',
    lastLogin: 'ናይ መወዳእታ ምእታው',
  },

  // User fields
  fields: {
    username: 'መጠቀሚ ስም',
    fullName: 'ሙሉእ ስም',
    email: 'ኢመይል',
    password: 'መልእኽቲ ይለፍ',
    confirmPassword: 'መልእኽቲ ይለፍ ኣረጋግጽ',
    role: 'ሚና',
    subcity: 'ንኡስ-ከተማ',
    status: 'ደረጃ',
    createdAt: 'ዝተፈጠረ ግዜ',
    lastLogin: 'ናይ መወዳእታ ምእታው',
  },

  // Placeholders
  placeholders: {
    username: 'መጠቀሚ ስም ኣተኣኻኽብ',
    fullName: 'ሙሉእ ስም ኣተኣኻኽብ',
    email: 'ኢመይል ኣድራሻ ኣተኣኻኽብ',
    password: 'መልእኽቲ ይለፍ ኣተኣኻኽብ',
    confirmPassword: 'መልእኽቲ ይለፍ ኣረጋግጽ',
    search: 'ብስም ወይ ብመጠቀሚ ስም ፈልጥ...',
    selectRole: 'ሓደ ሚና ምረጽ',
    selectSubcity: 'ሓደ ንኡስ-ከተማ ምረጽ',
  },

  // Messages
  messages: {
    noUsers: 'ዝኾነ ተጠቃሚታት ኣይተረኸበን',
    noUsersDescription: 'ፊልተራትካ ኣስተካክል ወይ ሓድሽ ተጠቃሚ ወስኽ።',
    loading: 'ተጠቃሚታት ይጽንበርዩ...',
    userCreated: 'ተጠቃሚ ብትክክል ተፈጢሩ እዩ',
    userSuspended: 'ተጠቃሚ ብትክክል ተንጸገ',
    userActivated: 'ተጠቃሚ ብትክክል ተነቅለ',
    userDeleted: 'ተጠቃሚ ብትክክል ተሰሪዙ እዩ',
    approvalSubmitted: 'ሕቶ ፍቓድ ቀሪቡ እዩ',
    deleteConfirmation: 'እዚ ተጠቃሚ ክትስርዞ ትሕቲ እወ ድዩ?',
    suspendConfirmation: 'እዚ ተጠቃሚ ክትንጽጎ ትሕቲ እወ ድዩ?',
    activateConfirmation: 'እዚ ተጠቃሚ ክትነቅሎ ትሕቲ እወ ድዩ?',
    cannotDeleteSelf: 'ናይ ገዛእ ርእስኻ ኣካውንት ክትስርዞ ኣይትኽእልን',
    cannotSuspendSelf: 'ናይ ገዛእ ርእስኻ ኣካውንት ክትንጽጎ ኣይትኽእልን',
  },

  // Errors
  errors: {
    fetchFailed: 'ተጠቃሚታት ምግላጽ ኣይከኣለን',
    createFailed: 'ተጠቃሚ ምፍጣር ኣይከኣለን',
    updateFailed: 'ተጠቃሚ ምምራመር ኣይከኣለን',
    suspendFailed: 'ተጠቃሚ ምንጻግ ኣይከኣለን',
    activateFailed: 'ተጠቃሚ ምንቃል ኣይከኣለን',
    deleteFailed: 'ተጠቃሚ ምስራዝ ኣይከኣለን',
    usernameExists: 'እዚ መጠቀሚ ስም ድሮ ኣሎ',
    passwordMismatch: 'መልእኽቲ ይለፍ ኣይተማሳሰለን',
    invalidRole: 'ዘይሕጋዊ ሚና ተመሪጹ እዩ',
    required: '{{field}} ይድልየካ እዩ',
    minLength: '{{field}} ብዙሕ ብዙሕ {{count}} ፊደላት ክህልዎ ኣለዎ',
  },

  // Role display names
  roles: {
    CITY_ADMIN: 'ኣድሚን ከተማ',
    CITY_APPROVER: 'ምርመራይ ከተማ',
    SUBCITY_ADMIN: 'ኣድሚን ንኡስ-ከተማ',
    SUBCITY_APPROVER: 'ምርመራይ ንኡስ-ከተማ',
    SUBCITY_NORMAL: 'ተራ ተጠቃሚ ንኡስ-ከተማ',
    SUBCITY_AUDITOR: 'ተርጓሚ / ኦዲተር ንኡስ-ከተማ',
    REVENUE_ADMIN: 'ኣድሚን ገበና',
    REVENUE_APPROVER: 'ምርመራይ ገበና',
    REVENUE_USER: 'ተጠቃሚ ገበና',
  },

  subcity: {
    none: 'የለን / N/A',
    yourSubcity: '(ናይቲ ንኡስ-ከተማኻ)',
    adminRestriction: 'ከም ኣድሚን ንኡስ-ከተማ፣ ኣብ ናይ ገዛእ ርእስኻ ንኡስ-ከተማ ጥራይ ተጠቃሚታት ክትፈጥር ትኽእል',
    select: 'ንኡስ-ከተማ ምረጽ',
    selectDescription: 'እዚ ተጠቃሚ ዝዳልዎ ንኡስ-ከተማ ምረጽ',
    enterDescription: 'ቁጽሪ ንኡስ-ከተማ ንዚ ተጠቃሚ ኣተኣኻኽብ',
  },

  addUser: {
    title: 'ሓድሽ ተጠቃሚ ወስኽ',
    subtitle: 'ሓድሽ ኣካውንት ተጠቃሚ ፍጠር',
    requiresApproval: 'እዚ ምፍጣር ተጠቃሚ ፍቓድ ይሓትት',
    approvalMessage: 'ሕቶኻ ናብ ምርመራይ ክለኣኽ እዩ። ካብ ድሕሪ ፍቓድ እዩ ክፍጠር።',
    passwordHint: 'ብዙሕ ብዙሕ 6 ፊደላት',
    submitForApproval: 'ንፍቓድ ኣቕርብ',
    submitting: 'ይፈጠር ኣሎ...',
    submit: 'ተጠቃሚ ፍጠር',
    cancel: 'ሰርዝ',
  },

  suspendModal: {
    title_suspend: 'ተጠቃሚ ምንጻግ',
    title_activate: 'ተጠቃሚ ምንቃል',
    confirmMessage_suspend: '{{name}} ክትንጽጎ ትሕቲ እወ ድዩ?',
    confirmMessage_activate: '{{name}} ክትነቅሎ ትሕቲ እወ ድዩ?',
    reasonRequired: 'ምኽንያት እዚ ስራሕ (ይድልየካ እዩ)',
    reasonOptional: 'ምኽንያት እዚ ስራሕ (ኣይግደፍን)',
    reasonPlaceholder: 'እቲ ምኽንያት ኣብዚ ኣቐምጥ...',
    reasonOptionalPlaceholder: 'ኣይግደፍን ምኽንያት ኣብዚ ኣቐምጥ...',
    requiresApproval: 'እዚ ስራሕ ፍቓድ ይሓትት',
    approvalMessage: 'ሕቶኻ ናብ ምርመራይ ክለኣኽ እዩ። ምስ ተረመረ ክትፈልጥ ኢኻ።',
    requestAction: '{{action}} ሕቶ ኣቕርብ',
  },

  deleteModal: {
    title: 'ተጠቃሚ ምስራዝ',
    confirmMessage: '{{name}} ክትስርዞ ትሕቲ እወ ድዩ?',
    reasonLabel: 'ምኽንያት ምስራዝ (ኣይግደፍን)',
    reasonPlaceholder: 'ምኽንያት እቲ ምስራዝ ኣብዚ ኣቐምጥ...',
    requiresApproval: 'እዚ ስራሕ ፍቓድ ይሓትት',
    approvalMessage: 'ሕቶኻ ናብ ምርመራይ ክለኣኽ እዩ። ምስ ተረመረ ክትፈልጥ ኢኻ።',
    confirmButton: 'ሕቶ ምስራዝ ኣቕርብ',
  },

  approvalModal: {
    title: 'ሕቶ ፍቓድ ቀሪቡ',
    message: 'ሕቶኻ ን{{entity}} {{action}} ንፍቓድ ቀሪቡ እዩ።',
    requestId: 'ቁጽሪ ሕቶ',
    status: 'ደረጃ',
    pending: 'ዝጽበየሉ ፍቓድ',
    action: 'ስራሕ',
    notification: 'ምስ ምርመራይ ዝርከብ ክትፈልጥ ኢኻ።',
    close: 'ተረዲኡኒ',
  },

  accessDenied: {
    title: 'መግቢ ተኸልከለ',
    message: 'ናብ እዚ ገጽ መግቢ ፍቓድ የብልካን።',
  },
};