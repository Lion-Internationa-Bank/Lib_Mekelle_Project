export const billingSection = {
  title: 'Billing History',
  subtitle: 'Payment records and financial overview',
  downloadPDF: 'Download PDF',
  owner: 'Owner',
  id: 'ID',
  notAvailable: 'N/A',
  moreOwners: '+{{count}} more',
  
  // Lease Overview
  leaseOverview: {
    title: 'Lease Overview',
    financialTerms: 'Financial Terms',
    paymentTerms: 'Payment Terms',
    timeline: 'Lease Timeline',
    totalLeaseAmount: 'Total Lease Amount',
    downPayment: 'Down Payment',
    otherPayment: 'Other Payment',
    annualInstallment: 'Annual Installment',
    paymentTerm: 'Payment Term',
    leasePeriod: 'Lease Period',
    pricePerM2: 'Price per m²',
    startDate: 'Start Date',
    startDateHint: 'Lease commencement date',
    contractDate: 'Contract Date',
    contractDateHint: 'Agreement signing date',
    expiryDate: 'Expiry Date',
    expiryDateHint: 'Lease termination date',
  },
  
  // Years
  years: '{{count}} year',
  years_plural: '{{count}} years',
  
  // No Lease
  noLease: {
    title: 'No Lease Agreement Found',
    description: 'This parcel does not have an associated lease agreement.',
  },
  
  // Billing
  billing: {
    records: 'Billing Records ({{count}})',
    totalDue: 'Total amount due',
    overdue: 'Overdue',
    empty: {
      title: 'No Billing Records',
      description: 'There are no billing records available.',
    },
    columns: {
      sno: 'S.NO',
      year: 'Year',
      dueDate: 'Due Date',
      base: 'Base (ETB)',
      interest: 'Interest (ETB)',
      penalty: 'Penalty (ETB)',
      amountDue: 'Amount Due (ETB)',
      status: 'Status',
      remaining: 'Remaining (ETB)',
    },
    status: {
      unpaid: 'Unpaid',
      partial: 'Partial',
      paid: 'Paid',
      overdue: 'Overdue',
    },
  },
};