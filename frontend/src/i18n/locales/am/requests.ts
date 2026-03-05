export const requests = {
  // Page Titles
  title: {
    approver: 'በመጠባበቅ ላይ ያሉ የማፅደቅ ጥያቄዎች',
    maker: 'የእኔ ጥያቄዎች',
  },
  
  // Count
  count: '{{count}} ጥያቄ ተገኝቷል',
  count_plural: '{{count}} ጥያቄዎች ተገኝተዋል',
  
  // View types
  view: {
    approver: 'አፅዳቂ እይታ',
    maker: 'ፈጣሪ እይታ',
  },
  
  // Loading
  loading: 'ጥያቄዎችን በመጫን ላይ...',
  loadingMessage: 'እባክዎ ጥያቄዎችን ስናመጣ ይጠብቁ',
  
  // Filters
  filters: {
    status: 'ሁኔታ',
    entityType: 'የድርጅት አይነት',
    actionType: 'የእርምጃ አይነት',
    sortBy: 'ደርድር በ',
    allStatuses: 'ሁሉም ሁኔታዎች',
    allEntities: 'ሁሉም ድርጅቶች',
    allActions: 'ሁሉም እርምጃዎች',
    activeFilters: 'ንቁ ማጣሪያዎች:',
  },
  
  // Clear
  clearFilters: 'ማጣሪያዎችን አጽዳ',
  
  // Sort options
  sort: {
    created: 'የተፈጠረበት ቀን',
    updated: 'የተሻሻለበት ቀን',
    asc: 'ከፍ ያለ',
    desc: 'ዝቅ ያለ',
  },
  
  // Status values
  status: {
    PENDING: 'በመጠባበቅ ላይ',
    APPROVED: 'ጸድቋል',
    REJECTED: 'ውድቅ ተደርጓል',
    RETURNED: 'ተመልሷል',
    CANCELLED: 'ተሰርዟል',
    FAILED: 'አልተሳካም',
  },
  
  // Entity types
  entity: {
    USERS: 'ተጠቃሚ',
    RATE_CONFIGURATION: 'የተመን ቅንብር',
    SUBCITY: 'ንኡስ ከተማ',
    CONFIGURATIONS: 'ውቅረት',
    LAND_PARCELS: 'የመሬት ቦታ',
    OWNERS: 'ባለቤት',
    LEASE_AGREEMENTS: 'የሊዝ ስምምነት',
    ENCUMBRANCES: 'እንቅፋት',
    APPROVAL_REQUEST: 'የማፅደቅ ጥያቄ',
    WIZARD_SESSION: 'ዊዛርድ ክፍለ ጊዜ',
  },
  
  // Action types
  action: {
    CREATE: 'ፍጠር',
    UPDATE: 'አዘምን',
    DELETE: 'ሰርዝ',
    SUSPEND: 'አግድ',
    ACTIVATE: 'አንቃ',
    TRANSFER: 'አስተላልፍ',
    SUBDIVIDE: 'ከፍል',
    MERGE: 'ዋህድ',
    TERMINATE: 'አቁም',
    EXTEND: 'አራዝም',
    ADD_OWNER: 'ባለቤት ጨምር',
  },
  
  // Card fields
  card: {
    id: 'መታወቂያ',
    requester: 'ጠያቂ',
    role: 'ሚና',
    subcity: 'ንኡስ ከተማ',
    noSubcity: 'ንኡስ ከተማ የለም',
    created: 'የተፈጠረበት',
    unknownUser: 'ያልታወቀ ተጠቃሚ',
  },
  
  // Empty states
  empty: {
    title: 'ምንም ጥያቄዎች አልተገኙም',
    approver: 'በአሁኑ ጊዜ በመጠባበቅ ላይ ያሉ የማፅደቅ ጥያቄዎች የሉም።',
    maker: 'እስካሁን ምንም ጥያቄዎችን አላቀረቡም።',
    filtered: 'ምንም ጥያቄዎች ከአሁኑ ማጣሪያዎችዎ ጋር አይዛመዱም። እባክዎ የተወሰኑ ማጣሪያዎችን ያጽዱ።',
  },
  
  // Errors
  errors: {
    fetchFailed: 'በመጠባበቅ ላይ ያሉ ጥያቄዎችን ማምጣት አልተሳካም',
    unexpected: 'ያልተጠበቀ ስህተት ተከስቷል',
    invalidResponse: 'ልክ ያልሆነ የምላሽ ቅርጸት',
  },
};