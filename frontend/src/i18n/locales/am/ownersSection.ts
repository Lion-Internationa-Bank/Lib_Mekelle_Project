export const ownersSection = {
  title: 'የአሁን ባለቤቶች',
  count: '{{count}} ባለቤት',
  count_plural: '{{count}} ባለቤቶች',
  
  // Empty state
  empty: {
    title: 'ለዚህ መሬት ቦታ እስካሁን ምንም ባለቤቶች አልተመዘገቡም',
    description: 'የመጀመሪያ ባለቤት ያክሉ እና ደጋፊ ሰነዶችን ያያይዙ።',
    addButton: 'ባለቤት ጨምር',
  },
  
  // New owner
  newOwner: {
    validation: 'ሙሉ ስም እና ብሄራዊ መታወቂያ ያስፈልጋሉ',
    createFailed: 'ባለቤት መፍጠር አልተሳካም: ',
  },
  
  // Transfer upload
  transfer: {
    upload: {
      title: 'ዝውውር ተጠናቋል ✓',
      description: 'ለዚህ መሬት ቦታ ደጋፊ ሰነዶችን ይስቀሉ',
      step: 'ደረጃ 2 ከ 2',
      docsTitle: 'የዝውውር ደጋፊ ሰነዶች',
      skip: 'ለአሁን ዝለል',
      done: 'ተከናውኗል – ዝጋ',
      docTypes: {
        contract: 'የዝውውር ውል / ስምምነት',
        idCopy: 'የመታወቂያ ቅጂዎች (ገዢ እና ሻጭ)',
        paymentProof: 'የክፍያ ደረሰኝ',
        powerOfAttorney: 'የውክልና ስልጣን (ካለ)',
        other: 'ሌላ ደጋፊ ሰነድ',
      },
    },
  },
};