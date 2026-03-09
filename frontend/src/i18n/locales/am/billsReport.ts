// src/i18n/locales/am/billsReport.ts
export const billsReport = {
  title: 'የክፍያ መጠየቂያ ሪፖርት',
  description: 'በክፍለ ከተማ፣ በቀን ክልል እና በክፍያ ሁኔታ የክፍያ መጠየቂያዎችን ይመልከቱ እና ያጣሩ',
  
  // Columns
  columns: {
    upin: 'ዩፒን',
    owner: 'ባለቤት',
    subCity: 'ክፍለ ከተማ',
    amountDue: 'የሚከፈል መጠን',
    dueDate: 'የክፍያ ቀን',
    status: 'ሁኔታ',
    fiscalYear: 'በጀት ዓመት',
    installment: 'ክፍያ #{{number}}'
  },
  
  // UPIN column
  upin: {
    upin: '{{upin}}',
    installment: 'ክፍያ #{{number}}'
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
    paid: 'የተከፈለ',
    unpaid: 'ያልተከፈለ',
    overdue: 'የማካካሻ ጊዜ ያለፈበት',
    partial: 'ከፊል የተከፈለ',
    colors: {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      partial: 'bg-blue-100 text-blue-800'
    }
  },
  
  // Expanded row
  expandedRow: {
    billDetails: 'የክፍያ መጠየቂያ ዝርዝሮች',
    interestAndPenalty: 'ወለድ እና ቅጣት',
    ownerInformation: 'የባለቤት መረጃ',
    upin: 'ዩፒን',
    installmentNumber: 'የክፍያ ቁጥር',
    fiscalYear: 'በጀት ዓመት',
    basePayment: 'መሰረታዊ ክፍያ',
    amountDue: 'የሚከፈል መጠን',
    dueDate: 'የክፍያ ቀን',
    paymentStatus: 'የክፍያ ሁኔታ',
    interestAmount: 'የወለድ መጠን',
    interestRate: 'የወለድ ተመን',
    penaltyAmount: 'የቅጣት መጠን',
    penaltyRate: 'የቅጣት ተመን',
    fullName: 'ሙሉ ስም',
    phoneNumber: 'ስልክ ቁጥር',
    subCity: 'ክፍለ ከተማ',
    value: '{{value}} ብር',
    rate: '{{rate}}%',
    notAvailable: '-'
  },
  
  // Filters
  filters: {
    paymentStatus: {
      label: 'የክፍያ ሁኔታ'
    }
  },
  
  // Status options
  statusOptions: {
    paid: 'የተከፈለ',
    unpaid: 'ያልተከፈለ',
    overdue: 'የማካካሻ ጊዜ ያለፈበት',
    partial: 'ከፊል የተከፈለ'
  },
  
  // Validation
  validation: {
    dateRange: 'የመጀመሪያ ቀን ከመጨረሻ ቀን በላይ መሆን አይችልም'
  },
  
  // Empty state
  empty: 'ምንም የክፍያ መጠየቂያዎች አልተገኙም',
  
  // Errors
  errors: {
    fetchFailed: 'የክፍያ መጠየቂያዎችን በማምጣት ላይ ስህተት:',
    subCitiesFailed: 'ክፍለ ከተማዎችን በማምጣት ላይ ስህተት:'
  }
};