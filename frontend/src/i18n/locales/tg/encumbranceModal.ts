export const encumbranceModal = {
  title: {
    edit: 'እገዳ ኣስተኻኽል',
    create: 'ሓድሽ እገዳ ወስኽ',
  },
  
  // Fields
  fields: {
    type: 'ዓይነት እገዳ',
    issuingEntity: 'ዝኣገደ ኣካል',
    referenceNumber: 'ቁጽሪ መወከሲ',
    status: 'ኩነታት',
    registrationDate: 'ዝተመዝገበሉ ዕለት',
  },
  
  // Status
  status: {
    active: 'ንጡፍ',
    released: 'ዝተላዕለ',
  },
  
  // Placeholders
  placeholders: {
    selectType: 'ዓይነት እገዳ ምረጽ',
  },
  
  // Buttons
  buttons: {
    update: 'ለውጥታት ዕቅብ',
    create: 'ፍጠር',
  },
  
  // Messages
  messages: {
    updateSuccess: 'እገዳ ብትኽክል ተስተኻኺሉ ኣሎ',
    createSuccess: 'እገዳ ብትኽክል ተፈጢሩ ኣሎ',
    submitted: 'ናይ እገዳ ምፍጣር ጠለብ ንምጽዳቕ ተላኢኹ ኣሎ',
  },
  
  // Errors
  errors: {
    loadTypes: 'ዓይነታት እገዳ ክመጽኡ ኣይከኣሉን',
    updateFailed: 'እገዳ ንምስትኽኻል ኣይተኻእለን',
    createFailed: 'እገዳ ንምፍጣር ኣይተኻእለን',
    validation: 'ዝተመልአ ሓበሬታ ጌጋ ኣለዎ',
    operationFailed: 'እቲ ተግባር ኣይተዓወተን',
    unexpected: 'ዘይተጸበናዮ ጌጋ ተፈጢሩ',
    noTypes: 'ዝርከቡ ዓይነታት እገዳ የለዉን',
  },
};
