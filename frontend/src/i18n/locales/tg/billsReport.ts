// src/i18n/locales/tg/billsReport.ts
export const billsReport = {
  title: 'ጸብጻብ ክፍሊታት',
  description: 'ክፍሊታት ብክፍለ ከተማ፣ ብግዜ ገደብን ኩነታት ክፍሊትን መሚኻ ርአ',
  
  // Columns
  columns: {
    upin: 'UPIN (መለለዪ ቦታ)',
    owner: 'ዋንኣ',
    subCity: 'ክፍለ ከተማ',
    amountDue: 'ዝኽፈል መጠን',
    dueDate: 'ክኽፈለሉ ዝነበሮ ዕለት',
    status: 'ኩነታት',
    fiscalYear: 'ዓመተ ምሕረት (Fiscal Year)',
    installment: 'ክፍሊት ቁጽሪ #{{number}}'
  },
  
  // UPIN column
  upin: {
    upin: '{{upin}}',
    installment: 'ክፍሊት ቁጽሪ #{{number}}'
  },
  
  // Owner column
  owner: {
    name: '{{name}}',
    phone: '{{phone}}'
  },
  
  // Amount
  amount: {
    due: '{{amount}} ብር'
  },
  
  // Status
  status: {
    paid: 'ዝተኸፈለ',
    unpaid: 'ዘይተኸፍለ',
    overdue: 'እዋኑ ዝሓለፎ',
    partial: 'ብከፊል ዝተኸፍለ',
    colors: {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      partial: 'bg-blue-100 text-blue-800'
    }
  },
  
  // Expanded row
  expandedRow: {
    billDetails: 'ዝርዝር ክፍሊት',
    interestAndPenalty: 'ወለድን መቕጻዕትን',
    ownerInformation: 'ሓበሬታ ዋንኣ',
    upin: 'UPIN',
    installmentNumber: 'ቁጽሪ ክፍሊት',
    fiscalYear: 'ዓመተ ምሕረት',
    basePayment: 'ቀንዲ ክፍሊት',
    amountDue: 'ዝኽፈል መጠን',
    dueDate: 'ክኽፈለሉ ዝነበሮ ዕለት',
    paymentStatus: 'ኩነታት ክፍሊት',
    interestAmount: 'መጠን ወለድ',
    interestRate: 'ናይ ወለድ ፐርሰንት',
    penaltyAmount: 'መጠን መቕጻዕቲ',
    penaltyRate: 'ናይ መቕጻዕቲ ፐርሰንት',
    fullName: 'ምሉእ ስም',
    phoneNumber: 'ቁጽሪ ቴሌፎን',
    subCity: 'ክፍለ ከተማ',
    value: '{{value}} ብር',
    rate: '{{rate}}%',
    notAvailable: '-'
  },
  
  // Filters
  filters: {
    paymentStatus: {
      label: 'ኩነታት ክፍሊት'
    }
  },
  
  // Status options
  statusOptions: {
    paid: 'ዝተኸፈለ',
    unpaid: 'ዘይተኸፍለ',
    overdue: 'እዋኑ ዝሓለፎ',
    partial: 'ብከፊል ዝተኸፍለ'
  },
  
  // Validation
  validation: {
    dateRange: 'መበገሲ ዕለት ካብ መወዳእታ ዕለት ክዓቢ ኣይኽእልን'
  },
  
  // Empty state
  empty: 'ዝተረኽበ ክፍሊት የለን',
  
  // Errors
  errors: {
    fetchFailed: 'ክፍሊታት ኣብ ምምጻእ ጌጋ ተፈጢሩ:',
    subCitiesFailed: 'ክፍለ ከተማታት ኣብ ምምጻእ ጌጋ ተፈጢሩ:'
  }
};
