export const ownersSection = {
  title: 'ናይ ሕዚ ዋኖት',
  count: '{{count}} ዋንኣ',
  count_plural: '{{count}} ዋኖት',
  
  // Empty state
  empty: {
    title: 'ነዚ ቦታ እዚ ዝተመዝገበ ዋንኣ የለን',
    description: 'መጀመሪያ ዋንኣ ብምውሳኽ ደገፍቲ ሰነዳት ኣተሓሕዝ።',
    addButton: 'ዋንኣ ወስኽ',
  },
  
  // New owner
  newOwner: {
    validation: 'ምሉእ ስምን መፍለዪ ቁጽሪ (ID) ን ግድን የድልዩ',
    createFailed: 'ዋንኣ ንምፍጣር ኣይተኻእለን: ',
  },
  
  // Transfer upload
  transfer: {
    upload: {
      title: 'ዝውውር ተወዲኡ ✓',
      description: 'ነዚ ቦታ ዝምልከቱ ደገፍቲ ሰነዳት ኣእትው',
      step: 'ስጉምቲ 2 ካብ 2',
      docsTitle: 'ደገፍቲ ሰነዳት ዝውውር',
      skip: 'ንሕዚ ሕለፎ',
      done: 'ተወዲኡ – ዕጾ',
      docTypes: {
        contract: 'ውዕል / ስምምዕነት ዝውውር',
        idCopy: 'ኮፒ መፍለዪ ወረቐት (ዓዳግን ሸያጥን)',
        paymentProof: 'መሰጋገሪ ወረቐት ክፍሊት (Receipt)',
        powerOfAttorney: 'ውክልና (እንተሃልዩ)',
        other: 'ካልእ ደጋፊ ሰነድ',
      },
    },
  },
};
