// src/i18n/locales/en/billsReport.ts
export const billsReport = {
  title: 'Bills Report',
  description: 'View and filter bills by sub-city, date range, and payment status',
  
  // Columns
  columns: {
    upin: 'UPIN',
    owner: 'Owner',
    subCity: 'Sub City',
    amountDue: 'Amount Due',
    dueDate: 'Due Date',
    status: 'Status',
    fiscalYear: 'Fiscal Year',
    installment: 'Installment #{{number}}'
  },
  
  // UPIN column
  upin: {
    upin: '{{upin}}',
    installment: 'Installment #{{number}}'
  },
  
  // Owner column
  owner: {
    name: '{{name}}',
    phone: '{{phone}}'
  },
  
  // Amount
  amount: {
    due: '{{amount}} ETB'
  },
  
  // Status
  status: {
    paid: 'PAID',
    unpaid: 'UNPAID',
    overdue: 'OVERDUE',
    partial: 'PARTIAL',
    colors: {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      partial: 'bg-blue-100 text-blue-800'
    }
  },
  
  // Expanded row
  expandedRow: {
    billDetails: 'Bill Details',
    interestAndPenalty: 'Interest & Penalty',
    ownerInformation: 'Owner Information',
    upin: 'UPIN',
    installmentNumber: 'Installment Number',
    fiscalYear: 'Fiscal Year',
    basePayment: 'Base Payment',
    amountDue: 'Amount Due',
    dueDate: 'Due Date',
    paymentStatus: 'Payment Status',
    interestAmount: 'Interest Amount',
    interestRate: 'Interest Rate',
    penaltyAmount: 'Penalty Amount',
    penaltyRate: 'Penalty Rate',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    subCity: 'Sub City',
    value: '{{value}} ETB',
    rate: '{{rate}}%',
    notAvailable: '-'
  },
  
  // Filters
  filters: {
    paymentStatus: {
      label: 'Payment Status'
    }
  },
  
  // Status options
  statusOptions: {
    paid: 'Paid',
    unpaid: 'Unpaid',
    overdue: 'Overdue',
    partial: 'Partial'
  },
  
  // Validation
  validation: {
    dateRange: 'From date cannot be greater than to date'
  },
  
  // Empty state
  empty: 'No bills found',
  
  // Errors
  errors: {
    fetchFailed: 'Error fetching bills:',
    subCitiesFailed: 'Error fetching sub-cities:'
  }
};