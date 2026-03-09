export const billingSection = {
  title: 'ታሪኽ ክፍሊት (Billing History)',
  subtitle: 'መዝገብ ክፍሊትን ፋይናንሳዊ ትሕዝቶን',
  downloadPDF: 'PDF ኣውርድ',
  owner: 'ዋንኣ',
  id: 'መፍለዪ (ID)',
  notAvailable: 'የለን',
  moreOwners: '+{{count}} ተወሳኺ ዋኖት',
  
  // Lease Overview
  leaseOverview: {
    title: 'ሓፈሻዊ ትሕዝቶ ሊዝ',
    financialTerms: 'ፋይናንሳዊ ውዕላት',
    paymentTerms: 'ውዕላት ክፍሊት',
    timeline: 'ግዜያዊ ሰሌዳ ሊዝ',
    totalLeaseAmount: 'ጠቕላላ መጠን ሊዝ',
    downPayment: 'ቅድመ ክፍሊት',
    otherPayment: 'ካልእ ክፍሊት',
    annualInstallment: 'ዓመታዊ ክፍሊት (Installment)',
    paymentTerm: 'እዋን ክፍሊት',
    leasePeriod: 'ናይ ሊዝ ግዜ',
    pricePerM2: 'ዋጋ ብ ትርብዒት ሜትሮ (m²)',
    startDate: 'ዝጅምረሉ ዕለት',
    startDateHint: 'ሊዝ ዝጅምረሉ ዕለት',
    contractDate: 'ዕለት ውዕል',
    contractDateHint: 'ውዕል ዝተፈረመሉ ዕለት',
    expiryDate: 'ዘብቅዓሉ ዕለት',
    expiryDateHint: 'ሊዝ ዘብቅዓሉ ዕለት',
  },
  
  // Years
  years: '{{count}} ዓመት',
  years_plural: '{{count}} ዓመታት',
  
  // No Lease
  noLease: {
    title: 'ናይ ሊዝ ውዕል ኣይተረኽበን',
    description: 'እዚ ቦታ እዚ ምስኡ ዝተተሓሓዘ ናይ ሊዝ ውዕል የብሉን።',
  },
  
  // Billing
  billing: {
    records: 'መዝገብ ክፍሊታት ({{count}})',
    totalDue: 'ጠቕላላ ዝኽፈል መጠን',
    overdue: 'እዋኑ ዝሓለፎ',
    empty: {
      title: 'ዝተመዝገበ ክፍሊት የለን',
      description: 'ክሳብ ሕዚ ዝተመዝገበ ዝኾነ ዓይነት ክፍሊት የለን።',
    },
    columns: {
      sno: 'ተ.ቑ',
      year: 'ዓመት',
      dueDate: 'ክኽፈለሉ ዝነበሮ ዕለት',
      base: 'ቀንዲ ክፍሊት (ETB)',
      interest: 'ወለድ (ETB)',
      penalty: 'መቕጻዕቲ (ETB)',
      amountDue: 'ዝኽፈል መጠን (ETB)',
      status: 'ኩነታት ክፍሊት',
      remaining: 'ዝተረፈ ክፍሊት (ETB)',
    },
    status: {
      unpaid: 'ዘይተኸፍለ',
      partial: 'ብከፊል ዝተኸፍለ',
      paid: 'ዝተኸፈለ',
      overdue: 'እዋኑ ዝሓለፎ',
    },
  },
};
