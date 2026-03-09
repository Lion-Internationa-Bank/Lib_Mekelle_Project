export const leaseDocsStep = {
  title: 'ሰነዳት ሊዝ',
  subtitle: 'ነቲ ናይ ሊዝ ውዕል ደገፍቲ ሰነዳት ኣእትው (PDF, JPG, PNG ክሳብ 10MB)',
  empty: 'ክሳብ ሕዚ ዝኣተወ ሰነድ የለን',
  uploadedBy: 'ብዓልኻ',
  
  // No Lease
  noLease: {
    title: 'ናይ ሊዝ ውዕል የለን',
    description: 'እዚ ቦታ እዚ ናይ ሊዝ ውዕል የብሉን። ናብ ምርግጋጽ (Validation) ክትሓልፍ ትኽእል ኢኻ።',
  },
  
  // Upload
  upload: {
    title: 'ሰነዳት ሊዝ ኣእትው',
    description: 'ሰነዳት ንምእታው ኣብ ታሕቲ ጸቅጥ (PDF, JPG, PNG ክሳብ 10MB)',
    clickToUpload: 'ንምእታው ኣብዚ ጸቅጥ',
  },
  
  // Actions
  actions: {
    view: 'ርአ',
    remove: 'ኣውጽእ',
    back: 'ተመለስ',
    skip: 'ሰነዳት ሊዝ ሕለፎ',
    backToLease: 'ናብ ሓበሬታ ሊዝ ተመለስ',
    proceed: 'ናብ ምርግጋጽ ሕለፍ',
    next: 'ቀጽል: ክለሳን ምርካብን',
  },
  
  // Messages
  messages: {
    uploadSuccess: '{{type}} ብትኽክል ኣትዩ ኣሎ',
    deleteSuccess: 'ሰነድ ተደምሲሱ ኣሎ',
    skipInfo: 'ስጉምቲ ሊዝ ተሓሊፉ። ናብ ምርግጋጽ ይሕለፍ ኣሎ።',
  },
  
  // Errors
  errors: {
    invalidFileType: 'ዘይተፈቐደ ዓይነት ፋይል እዩ። በጃኹም PDF, JPG, ወይ PNG ፋይላት ተጠቐሙ።',
    fileTooLarge: 'መጠን ፋይል ካብ 10MB ንላዕሊ እዩ።',
    uploadFailed: 'ምእታው ኣይተኻእለን',
    deleteFailed: 'ሰነድ ንምድምሳስ ኣይተኻእለን',
  },
  
  // Confirmations
  confirm: {
    delete: 'ነዚ ሰነድ እዚ ክትደምስሶ ርግጸኛ ዲኻ?',
  },
};
