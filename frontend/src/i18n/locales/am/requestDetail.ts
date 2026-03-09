// src/i18n/locales/am/requestDetail.ts
export const requestDetail = {
  // Loading states
  loading: 'የጥያቄ ዝርዝሮችን በማምጣት ላይ...',
  notFound: 'ጥያቄ አልተገኘም',
  backButton: 'ወደ በመጠባበቅ ላይ ያሉ ጥያቄዎች ተመለስ',
  
  // Request header
  header: {
    title: '{{entity}} - {{action}}',
    created: '📅 የተፈጠረበት ቀን:',
    by: '👤 በ:',
    subcity: '📍 ክፍለ ከተማ:',
    unknown: 'ያልታወቀ',
    na: 'የለም'
  },
  
  // Request ID accordion
  requestId: {
    show: 'የጥያቄ መታወቂያ አሳይ',
    hide: 'የጥያቄ መታወቂያ ደብቅ',
    value: '{{id}}'
  },
  
  // Action section
  action: {
    title: 'እርምጃ ይውሰዱ',
    approve: 'ጥያቄውን ይቀበሉ',
    reject: 'ጥያቄውን ይቃወሙ',
    approveIcon: '✓',
    rejectIcon: '✗'
  },
  
  // View only mode
  viewOnly: {
    title: 'የማየት ብቻ ሁነታ',
    description: 'ይህን ጥያቄ በማንበብ ብቻ እየተመለከቱት ነው። አጽዳቂዎች ብቻ በዚህ ጥያቄ ላይ እርምጃ መውሰድ ይችላሉ።',
    icon: '👁️'
  },
  
  // Status messages
  status: {
    rejected: {
      title: 'የውድቀት ምክንያት',
      rejectedOn: 'የተቃወመበት ቀን:'
    },
    approved: {
      title: 'ጸድቋል',
      approvedOn: '{{date}}'
    },
    returned: {
      title: 'ለክለሳ ተመልሷል',
      description: 'ይህ ጥያቄ ለማሻሻያ ተመልሷል።'
    }
  },
  
  // Entity detail fallback
  entityDetail: {
    title: 'የጥያቄ ውሂብ',
    notSpecified: 'የአካል አይነት አልተገለጸም'
  },
  
  // Action Dialog
  actionDialog: {
    approve: {
      title: 'ጥያቄውን ይቀበሉ',
      confirm: 'ማረጋገጫ ቀበል',
      processing: 'በመቀበል ላይ...'
    },
    reject: {
      title: 'ጥያቄውን ይቃወሙ',
      reason: {
        label: 'የውድቀት ምክንያት',
        required: 'እባክዎ የውድቀት ምክንያት ያስገቡ',
        placeholder: 'እባክዎ ለውድቀት ዝርዝር ምክንያት ያስገቡ...'
      },
      confirm: 'ውድቀት አረጋግጥ',
      processing: 'በመቃወም ላይ...'
    },
    comments: {
      label: 'አስተያየቶች',
      optional: '(አማራጭ)',
      approvePlaceholder: 'ለዚህ ማረጋገጫ ማንኛውንም አስተያየት ያክሉ...',
      rejectPlaceholder: 'ማንኛውንም ተጨማሪ አስተያየት ያክሉ...'
    },
    cancel: 'ሰርዝ'
  },
  
  // Errors
  errors: {
    requestIdRequired: 'የጥያቄ መታወቂያ ያስፈልጋል',
    fetchFailed: 'የጥያቄ ዝርዝሮችን ማምጣት አልተሳካም',
    unexpectedError: 'ያልተጠበቀ ስህተት ተከስቷል',
    approveFailed: 'ጥያቄውን መቀበል አልተሳካም',
    rejectFailed: 'ጥያቄውን መቃወም አልተሳካም',
    rejectReasonRequired: 'እባክዎ የውድቀት ምክንያት ያስገቡ'
  },
  
  // Success messages
  success: {
    approved: 'ጥያቄው በተሳካ ሁኔታ ተቀባይነት አግኝቷል',
    rejected: 'ጥያቄው በተሳካ ሁኔታ ተቃውሟል'
  }
};