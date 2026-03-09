export const requests = {
  // Page Titles
  title: {
    approver: 'ንምጽዳቕ ዝጽበዩ ዘለዉ ጠለባት',
    maker: 'ናተይ ጠለባት',
  },
  
  // Count
  count: '{{count}} ጠለብ ተረኺቡ',
  count_plural: '{{count}} ጠለባት ተረኺቦም',
  
  // View types
  view: {
    approver: 'ናይ መጽደቂ ርእይቶ',
    maker: 'ናይ መዳልዊ ርእይቶ',
  },
  
  // Loading
  loading: 'ጠለባት ይጽዕን ኣሎ...',
  loadingMessage: 'ጠለባትካ ክሳብ ዝመጽኡ በጃኻ ተዓገስ',
  
  // Filters
  filters: {
    status: 'ኩነታት',
    entityType: 'ዓይነት ኣካል',
    actionType: 'ዓይነት ተግባር',
    sortBy: 'መስርዕ',
    allStatuses: 'ኩሎም ኩነታት',
    allEntities: 'ኩሎም ኣካላት',
    allActions: 'ኩሎም ተግባራት',
    activeFilters: 'ንጡፋት መጻረዪታት:',
  },
  
  // Clear
  clearFilters: 'መጻረዪታት ኣጥፍእ',
  
  // Sort options
  sort: {
    created: 'ዝተፈጠረሉ ዕለት',
    updated: 'ዝተስተኻኸለሉ ዕለት',
    asc: 'ካብ ንእሽቶ ናብ ዓቢ',
    desc: 'ካብ ዓቢ ናብ ንእሽቶ',
  },
  
  // Status values
  status: {
    PENDING: 'ኣብ መስርሕ',
    APPROVED: 'ዝጸደቐ',
    REJECTED: 'ዝተነጸገ',
    RETURNED: 'ዝተመልሰ',
    CANCELLED: 'ዝተሰረዘ',
    FAILED: 'ዝፈሸለ',
  },
  
  // Entity types
  entity: {
    USERS: 'ተጠቃሚ',
    RATE_CONFIGURATION: 'ምድላው ተመን',
    SUBCITY: 'ክፍለ ከተማ',
    CONFIGURATIONS: 'ምድላዋት',
    LAND_PARCELS: 'ቦታ መሬት',
    OWNERS: 'ዋንኣ',
    LEASE_AGREEMENTS: 'ውዕል ሊዝ',
    ENCUMBRANCES: 'እገዳ',
    APPROVAL_REQUEST: 'ጠለብ ምጽዳቕ',
    WIZARD_SESSION: 'ግዜያዊ ቆጸራ (Session)',
  },
  
  // Action types
  action: {
    CREATE: 'ፍጠር',
    UPDATE: 'ኣስተኻኽል',
    DELETE: 'ደምስስ',
    SUSPEND: 'ኣግድ',
    ACTIVATE: 'ኣንጥፍ',
    TRANSFER: 'ኣመሓላልፍ',
    SUBDIVIDE: 'መቓቕል',
    MERGE: 'ሓውስ',
    TERMINATE: 'ኣቋርጽ',
    EXTEND: 'ኣናውሕ',
    ADD_OWNER: 'ዋንኣ ወስኽ',
  },
  
  // Card fields
  card: {
    id: 'መለለዪ (ID)',
    requester: 'ዝሓተተ ኣካል',
    role: 'ተግባር/ሓላፍነት',
    subcity: 'ክፍለ ከተማ',
    noSubcity: 'ክፍለ ከተማ የለን',
    created: 'ዝተፈጠረሉ',
    unknownUser: 'ዘይፍለጥ ተጠቃሚ',
  },
  
  // Empty states
  empty: {
    title: 'ዝተረኽበ ጠለብ የለን',
    approver: 'ኣብዚ ሕዚ እዋን ንምጽዳቕ ዝጽበ ዘሎ ጠለብ የለን።',
    maker: 'ክሳብ ሕዚ ዘቕረብካዮ ጠለብ የለን።',
    filtered: 'ምስቲ ዝመረጽካዮ መጻረዪ ዝመሳሰል ጠለብ የለን።',
  },
  
  // Errors
  errors: {
    fetchFailed: 'ጠለባት ንምምጻእ ኣይተኻእለን',
    unexpected: 'ዘይተጸበናዮ ጌጋ ተፈጢሩ',
    invalidResponse: 'ጌጋ ዘለዎ ኣሰራርሓ ዳታ',
  },
};
