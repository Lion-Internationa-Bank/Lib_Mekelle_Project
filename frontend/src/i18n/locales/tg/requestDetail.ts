// src/i18n/locales/tg/requestDetail.ts
export const requestDetail = {
  // Loading states
  loading: 'ዝርዝር ጠለብ ይጽዕን ኣሎ...',
  notFound: 'እቲ ዝተሓተተ ጠለብ ኣይተረኽበን',
  backButton: 'ናብ ዝጽበዩ ዘለዉ ጠለባት ተመለስ',
  
  // Request header
  header: {
    title: '{{entity}} - {{action}}',
    created: '📅 ዝተፈጠረሉ:',
    by: '👤 ብ:',
    subcity: '📍 ክፍለ ከተማ:',
    unknown: 'ዘይፍለጥ',
    na: 'የለን'
  },
  
  // Request ID accordion
  requestId: {
    show: 'መለለዪ ጠለብ ኣርኢ',
    hide: 'መለለዪ ጠለብ ሕባእ',
    value: '{{id}}'
  },
  
  // Action section
  action: {
    title: 'ተግባር ፈጽም',
    approve: 'ጠለብ ኣጽድቕ',
    reject: 'ጠለብ ንጸግ',
    approveIcon: '✓',
    rejectIcon: '✗'
  },
  
  // View only mode
  viewOnly: {
    title: 'ንምርኣይ ጥራይ (Read-only)',
    description: 'ነዚ ጠለብ እዚ ንምርኣይ ጥራይ ኢኻ ትኽእል። መጽደቂ (Approvers) ጥራይ እዮም ስጉምቲ ክወስዱ ዝኽእሉ።',
    icon: '👁️'
  },
  
  // Status messages
  status: {
    rejected: {
      title: 'ምኽንያት ምንጻግ',
      rejectedOn: 'ዝተነጸገሉ ዕለት:'
    },
    approved: {
      title: 'ዝጸደቐ',
      approvedOn: '{{date}}'
    },
    returned: {
      title: 'ንመመሓየሺ ዝተመልሰ',
      description: 'እዚ ጠለብ እዚ መመሓየሺ ክግበረሉ ተመሊሱ ኣሎ።'
    }
  },
  
  // Entity detail fallback
  entityDetail: {
    title: 'ዳታ ጠለብ',
    notSpecified: 'ዓይነት እቲ ኣካል ኣይተገልጸን'
  },
  
  // Action Dialog
  actionDialog: {
    approve: {
      title: 'ጠለብ ኣጽድቕ',
      confirm: 'ምጽዳቕ ኣረጋግፅ',
      processing: 'የጽድቕ ኣሎ...'
    },
    reject: {
      title: 'ጠለብ ንጸግ',
      reason: {
        label: 'ምኽንያት ምንጻግ',
        required: 'በጃኹም ምኽንያት ምንጻግ የእትዉ',
        placeholder: 'በጃኹም ዝርዝር ምኽንያት ምንጻግ ኣብዚ ጸሓፉ...'
      },
      confirm: 'ምንጻግ ኣረጋግፅ',
      processing: 'ይነጽግ ኣሎ...'
    },
    comments: {
      label: 'ርእይቶታት',
      optional: '(ኣማራጺ)',
      approvePlaceholder: 'ንዚ ምጽዳቕ ዝኸውን ርእይቶ ወስኽ...',
      rejectPlaceholder: 'ተወሳኺ ርእይቶታት ወስኽ...'
    },
    cancel: 'ሰርዝ'
  },
  
  // Errors
  errors: {
    requestIdRequired: 'መለለዪ ቁጽሪ ጠለብ ግድን የድሊ',
    fetchFailed: 'ዝርዝር ጠለብ ንምምጻእ ኣይተኻእለን',
    unexpectedError: 'ዘይተጸበናዮ ጌጋ ተፈጢሩ',
    approveFailed: 'ጠለብ ንምጽዳቕ ኣይተኻእለን',
    rejectFailed: 'ጠለብ ንምንጻግ ኣይተኻእለን',
    rejectReasonRequired: 'በጃኹም ምኽንያት ምንጻግ የእትዉ'
  },
  
  // Success messages
  success: {
    approved: 'ጠለብ ብትኽክል ጸዲቑ ኣሎ',
    rejected: 'ጠለብ ተነጺጉ ኣሎ'
  }
};
