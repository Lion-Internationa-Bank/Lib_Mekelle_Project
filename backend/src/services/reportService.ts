// src/services/billService.ts
import prisma from '../config/prisma.ts';
import ExcelJS from 'exceljs';

interface BillFilterOptions {
  subcityId?: string;
  status?: 'PAID' | 'UNPAID' | 'OVERDUE';
  fromDate?: string;
  toDate?: string;
}

interface BillData {
  upin: string;
  installment_number: number | null;
  fiscal_year: number;
  base_payment: any | null;
  amount_due: any;
  due_date: Date | null;
  payment_status: string;
  interest_amount: any;
  interest_rate_used: any | null;
  penalty_amount: any | null;
  penalty_rate_used: any | null;
  full_name: string;
  phone_number: string;
  subcity_name?: string;
}

export class BillService {
  async getFilteredBills(filters: BillFilterOptions): Promise<BillData[]> {
    // Build where clause manually
    const whereClause: any = {};
    
    // Apply subcity filter
    if (filters.subcityId) {
      whereClause.parcel = {
        sub_city_id: filters.subcityId
      };
    }
    
    // Apply status filter
    if (filters.status) {
      whereClause.payment_status = filters.status;
    }
    
    // Apply date range filter on due_date
    if (filters.fromDate || filters.toDate) {
      whereClause.due_date = {};
      
      if (filters.fromDate) {
        whereClause.due_date.gte = new Date(filters.fromDate);
      }
      
      if (filters.toDate) {
        whereClause.due_date.lte = new Date(filters.toDate);
      }
    }
    
    const bills = await prisma.billing_records.findMany({
      where: whereClause,
      include: {
        parcel: {
          include: {
            sub_city: true,
            owners: {
              where: {
                is_active: true
              },
              include: {
                owner: true
              }
            }
          }
        }
      },
      orderBy: [
        { due_date: 'asc' },
        { upin: 'asc' }
      ]
    });
    
    // Transform data to flat structure
    return bills.map(bill => {
      // Get the first active owner (or handle multiple owners as needed)
      const activeOwner = bill.parcel.owners.find((po: any) => po.is_active);
      
      return {
        upin: bill.upin,
        installment_number: bill.installment_number,
        fiscal_year: bill.fiscal_year,
        base_payment: bill.base_payment,
        amount_due: bill.amount_due,
        due_date: bill.due_date,
        payment_status: bill.payment_status,
        interest_amount: bill.interest_amount,
        interest_rate_used: bill.interest_rate_used,
        penalty_amount: bill.penalty_amount,
        penalty_rate_used: bill.penalty_rate_used,
        full_name: activeOwner?.owner?.full_name || 'N/A',
        phone_number: activeOwner?.owner?.phone_number || 'N/A',
        subcity_name: bill.parcel.sub_city?.name || 'N/A'
      };
    });
  }
  
  async generateExcel(bills: BillData[], filters?: BillFilterOptions): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bills');
    
    // Track current row
    let currentRow = 1;
    
    // Define columns with clean headers - THIS IS THE FIRST ROW OF THE TABLE
    worksheet.columns = [
      { header: 'UPIN', key: 'upin', width: 20 },
      { header: 'Installment', key: 'installment_number', width: 12 },
      { header: 'Fiscal Year', key: 'fiscal_year', width: 12 },
      { header: 'Base Payment', key: 'base_payment', width: 15 },
      { header: 'Amount Due', key: 'amount_due', width: 15 },
      { header: 'Due Date', key: 'due_date', width: 12 },
      { header: 'Status', key: 'payment_status', width: 12 },
      { header: 'Interest Amt', key: 'interest_amount', width: 12 },
      { header: 'Interest Rate', key: 'interest_rate_used', width: 12 },
      { header: 'Penalty Amt', key: 'penalty_amount', width: 12 },
      { header: 'Penalty Rate', key: 'penalty_rate_used', width: 12 },
      { header: 'Owner Name', key: 'full_name', width: 20 },
      { header: 'Phone', key: 'phone_number', width: 15 }
    ];
    
    // Style the header row - FIRST ROW
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' } // Dark blue background
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;
    
    // Add borders to header
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    currentRow = 2; // Move to next row after header
    
    // Add data rows
    bills.forEach((bill, index) => {
      const row = worksheet.addRow({
        upin: bill.upin,
        installment_number: bill.installment_number,
        fiscal_year: bill.fiscal_year,
        base_payment: bill.base_payment ? Number(bill.base_payment) : null,
        amount_due: Number(bill.amount_due),
        due_date: bill.due_date ? bill.due_date.toISOString().split('T')[0] : null,
        payment_status: bill.payment_status,
        interest_amount: Number(bill.interest_amount),
        interest_rate_used: bill.interest_rate_used ? Number(bill.interest_rate_used) : null,
        penalty_amount: bill.penalty_amount ? Number(bill.penalty_amount) : null,
        penalty_rate_used: bill.penalty_rate_used ? Number(bill.penalty_rate_used) : null,
        full_name: bill.full_name,
        phone_number: bill.phone_number
      });
      
      // Simple alternating row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9F9F9' }
        };
      }
      
      // Apply status colors
      const statusCell = row.getCell('payment_status');
      if (bill.payment_status === 'PAID') {
        statusCell.font = { color: { argb: 'FF008000' } };
      } else if (bill.payment_status === 'OVERDUE') {
        statusCell.font = { color: { argb: 'FFFF0000' } };
      } else if (bill.payment_status === 'UNPAID') {
        statusCell.font = { color: { argb: 'FFCC7700' } };
      }
      
      // Format number cells
      row.getCell('amount_due').numFmt = '#,##0.00';
      row.getCell('base_payment').numFmt = '#,##0.00';
      row.getCell('interest_amount').numFmt = '#,##0.00';
      row.getCell('penalty_amount').numFmt = '#,##0.00';
      row.getCell('interest_rate_used').numFmt = '0.00%';
      row.getCell('penalty_rate_used').numFmt = '0.00%';
      
      // Add borders to all cells
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      currentRow++;
    });
    
    // Add auto-filter
    worksheet.autoFilter = {
      from: `A1`,
      to: `M1`
    };
    
    // Calculate summary statistics
    const paidCount = bills.filter(b => b.payment_status === 'PAID').length;
    const unpaidCount = bills.filter(b => b.payment_status === 'UNPAID').length;
    const overdueCount = bills.filter(b => b.payment_status === 'OVERDUE').length;
    
    const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.amount_due), 0);
    const totalPaid = bills
      .filter(b => b.payment_status === 'PAID')
      .reduce((sum, bill) => sum + Number(bill.amount_due), 0);
    const totalUnpaid = bills
      .filter(b => b.payment_status === 'UNPAID' || b.payment_status === 'OVERDUE')
      .reduce((sum, bill) => sum + Number(bill.amount_due), 0);
    
    // Add empty row before summary
    worksheet.addRow([]);
    currentRow = worksheet.rowCount + 1;
    
    // Add SUMMARY section
    const summaryHeaderRow = worksheet.addRow(['SUMMARY']);
    summaryHeaderRow.font = { bold: true, size: 12 };
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    summaryHeaderRow.alignment = { vertical: 'middle', horizontal: 'left' };
    currentRow++;
    
    // Add summary rows
    const summaryRows = [
      `Total Bills: ${bills.length}`,
      `Paid: ${paidCount} | Unpaid: ${unpaidCount} | Overdue: ${overdueCount}`,
      `Total Amount Due: ${totalAmount.toFixed(2)}`,
      `Total Paid: ${totalPaid.toFixed(2)}`,
      `Total Unpaid/Overdue: ${totalUnpaid.toFixed(2)}`,
    ];
    
    summaryRows.forEach(text => {
      const row = worksheet.addRow([text]);
      worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.height = 18;
      currentRow++;
    });
    
    // Add empty row before filters
    worksheet.addRow([]);
    currentRow++;
    
    // Add APPLIED FILTERS section
    const filterHeaderRow = worksheet.addRow(['APPLIED FILTERS']);
    filterHeaderRow.font = { bold: true, size: 12 };
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    filterHeaderRow.alignment = { vertical: 'middle', horizontal: 'left' };
    currentRow++;
    
    // Get subcity name if subcityId is provided
    let subcityName = '';
    if (filters?.subcityId) {
      const subcity = await prisma.sub_cities.findUnique({
        where: { sub_city_id: filters.subcityId }
      });
      subcityName = subcity?.name || filters.subcityId;
    }
    
    // Build filter display lines
    const filterLines: string[] = [];
    
    if (subcityName) {
      filterLines.push(`Subcity: ${subcityName}`);
    }
    
    if (filters?.status) {
      filterLines.push(`Payment Status: ${filters.status}`);
    }
    
    if (filters?.fromDate || filters?.toDate) {
      const fromDate = filters.fromDate ? new Date(filters.fromDate).toLocaleDateString() : 'Any';
      const toDate = filters.toDate ? new Date(filters.toDate).toLocaleDateString() : 'Any';
      filterLines.push(`Date Range: ${fromDate} - ${toDate}`);
    }
    
    // Display filters or "No filters applied"
    if (filterLines.length > 0) {
      filterLines.forEach(line => {
        const infoRow = worksheet.addRow([line]);
        worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
        infoRow.font = { size: 11 };
        infoRow.alignment = { vertical: 'middle', horizontal: 'left' };
        infoRow.height = 20;
        currentRow++;
      });
    } else {
      const noFilterRow = worksheet.addRow(['No filters applied - Showing all bills']);
      worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
      noFilterRow.font = { italic: true, size: 11 };
      noFilterRow.alignment = { vertical: 'middle', horizontal: 'left' };
      noFilterRow.height = 20;
      currentRow++;
    }
    
    // Add empty row before generation date
    worksheet.addRow([]);
    currentRow++;
    
    // Add generation date at the very bottom
    const generationDateRow = worksheet.addRow([`Report generated on: ${new Date().toLocaleString()}`]);
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    generationDateRow.font = { italic: true, size: 10, color: { argb: 'FF666666' } };
    generationDateRow.alignment = { horizontal: 'right' };
    generationDateRow.height = 18;
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}