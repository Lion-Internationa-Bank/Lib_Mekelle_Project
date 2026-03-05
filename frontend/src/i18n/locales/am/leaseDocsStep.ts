export const leaseDocsStep = {
  title: 'የሊዝ ሰነዶች',
  subtitle: 'ለሊዝ ስምምነት ደጋፊ ሰነዶችን ይስቀሉ (ፒዲኤፍ፣ ጄፒጂ፣ ፒኤንጂ እስከ 10ሜባ)',
  empty: 'እስካሁን ምንም ሰነዶች አልተሰቀሉም',
  uploadedBy: 'እርስዎ',
  
  // No Lease
  noLease: {
    title: 'ምንም የሊዝ ስምምነት የለም',
    description: 'ይህ መሬት ቦታ የሊዝ ስምምነት የለውም። ወደ ማረጋገጫ መቀጠል ይችላሉ።',
  },
  
  // Upload
  upload: {
    title: 'የሊዝ ሰነዶችን ይስቀሉ',
    description: 'የሊዝ ስምምነት ሰነዶችን ለመስቀል ከታች ይጫኑ (ፒዲኤፍ፣ ጄፒጂ፣ ፒኤንጂ እስከ 10ሜባ)',
    clickToUpload: 'ለመስቀል ይጫኑ',
  },
  
  // Actions
  actions: {
    view: 'ተመልከት',
    remove: 'አስወግድ',
    back: 'ተመለስ',
    skip: 'የሊዝ ሰነዶች ዝለል',
    backToLease: 'ወደ ሊዝ መረጃ ተመለስ',
    proceed: 'ወደ ማረጋገጫ ቀጥል',
    next: 'ቀጣይ: ገምግም እና አስገባ',
  },
  
  // Messages
  messages: {
    uploadSuccess: '{{type}} በተሳካ ሁኔታ ተሰቅሏል',
    deleteSuccess: 'ሰነድ ተሰርዟል',
    skipInfo: 'የሊዝ ደረጃ ተዝሏል። ወደ ማረጋገጫ በመቀጠል ላይ።',
  },
  
  // Errors
  errors: {
    invalidFileType: 'ልክ ያልሆነ የፋይል አይነት። እባክዎ ፒዲኤፍ፣ ጄፒጂ ወይም ፒኤንጂ ፋይሎችን ይስቀሉ።',
    fileTooLarge: 'የፋይል መጠን ከ10ሜባ ገደብ ይበልጣል።',
    uploadFailed: 'መስቀል አልተሳካም',
    deleteFailed: 'ሰነድ መሰረዝ አልተሳካም',
  },
  
  // Confirmations
  confirm: {
    delete: 'ይህን ሰነድ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?',
  },
};