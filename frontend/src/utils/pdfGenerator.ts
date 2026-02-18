// src/utils/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ParcelDetail } from "../services/parcelDetailApi";

const formatCurrency = (value: number) => {
  return Number(value).toLocaleString('en-ET', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

// Helper function to get owner name from the nested structure
const getOwnerName = (owners: ParcelDetail['owners']): string => {
  if (!owners || owners.length === 0) return 'N/A';
  
  const firstOwner = owners[0];
  if (firstOwner?.owner?.full_name) {
    return firstOwner.owner.full_name;
  }
  
  return 'N/A';
};

// Helper function to get owner ID/national ID
const getOwnerNationalId = (owners: ParcelDetail['owners']): string => {
  if (!owners || owners.length === 0) return 'N/A';
  
  const firstOwner = owners[0];
  if (firstOwner?.owner?.national_id) {
    return firstOwner.owner.national_id;
  }
  
  return 'N/A';
};

export const generateBillingPDF = (data: ParcelDetail) => {
  const { 
    billing_records, 
    lease_agreement: lease, 
    owners, 
    upin, 
    file_number, 
    sub_city, 
    tabia, 
    ketena, 
    block, 
    total_area_m2 
  } = data;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Use minimal margins to maximize table width
  const leftMargin = 8;
  const rightMargin = 8;
  const tableWidth = pageWidth - leftMargin - rightMargin;
  
  // Get owner information
  const ownerName = getOwnerName(owners);
  const ownerNationalId = getOwnerNationalId(owners);
  const ownerCount = owners?.length || 0;

  // Helper function to add footer to each page
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }
  };

  // Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("BILLING STATEMENT", pageWidth / 2, 25, { align: "center" });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Parcel Information Section
  let yPos = 50;
  
  doc.setFillColor(240, 244, 248);
  doc.rect(leftMargin, yPos - 5, tableWidth, 58, 'F');
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Parcel Information", leftMargin + 5, yPos + 5);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const col1 = leftMargin + 5;
  const col2 = leftMargin + 60;
  const col3 = leftMargin + 110;
  
  // Row 1
  doc.text(`UPIN:`, col1, yPos + 15);
  doc.setFont("helvetica", "bold");
  doc.text(upin || 'N/A', col2, yPos + 15);
  
  doc.setFont("helvetica", "normal");
  doc.text(`File No:`, col3, yPos + 15);
  doc.setFont("helvetica", "bold");
  doc.text(file_number || 'N/A', col3 + 25, yPos + 15);
  
  // Row 2 - Owner Name
  doc.setFont("helvetica", "normal");
  doc.text(`Owner:`, col1, yPos + 22);
  doc.setFont("helvetica", "bold");
  // Truncate owner name if too long
  const displayOwnerName = ownerName.length > 25 ? ownerName.substring(0, 22) + '...' : ownerName;
  doc.text(displayOwnerName, col2, yPos + 22);
  
  doc.setFont("helvetica", "normal");
  doc.text(`National ID:`, col3, yPos + 22);
  doc.setFont("helvetica", "bold");
  doc.text(ownerNationalId, col3 + 25, yPos + 22);
  
  // Row 3 - Area and Location
  doc.setFont("helvetica", "normal");
  doc.text(`Area:`, col1, yPos + 29);
  doc.setFont("helvetica", "bold");
  doc.text(`${total_area_m2 || '0'} m²`, col2, yPos + 29);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Sub-city:`, col3, yPos + 29);
  doc.setFont("helvetica", "bold");
  doc.text(sub_city?.name || 'N/A', col3 + 25, yPos + 29);
  
  // Row 4 - Tabia and Ketena
  doc.setFont("helvetica", "normal");
  doc.text(`Tabia:`, col1, yPos + 36);
  doc.setFont("helvetica", "bold");
  doc.text(tabia || 'N/A', col2, yPos + 36);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Ketena:`, col3, yPos + 36);
  doc.setFont("helvetica", "bold");
  doc.text(ketena || 'N/A', col3 + 25, yPos + 36);
  
  // Row 5 - Block
  doc.setFont("helvetica", "normal");
  doc.text(`Block:`, col1, yPos + 43);
  doc.setFont("helvetica", "bold");
  doc.text(block || 'N/A', col2, yPos + 43);
  
  // Show if there are multiple owners
  if (ownerCount > 1) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`+ ${ownerCount - 1} additional owner(s)`, col3, yPos + 43);
    doc.setTextColor(0, 0, 0);
  }
  
  yPos += 70; // Increased gap after parcel information
  
  // Lease Summary Section (if available) - Removed Lease ID
  if (lease) {
    // Check if we need a new page
    if (yPos + 80 > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    // Calculate background height based on number of items (9 items * 7px row height = 63px, plus padding)
    const leaseBgHeight = 68;
    
    doc.setFillColor(240, 244, 248);
    doc.rect(leftMargin, yPos - 5, tableWidth, leaseBgHeight, 'F');
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Lease Summary", leftMargin + 5, yPos + 5);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Lease details - Removed Lease ID
    const leaseDetails = [
      { label: "Payment Term:", value: `${lease.payment_term_years || 0} years` },
      { label: "Lease Period:", value: `${lease.lease_period_years || 0} years` },
      { label: "Total Amount:", value: `${formatCurrency(Number(lease.total_lease_amount) || 0)} ETB` },
      { label: "Annual Installment:", value: `${formatCurrency(Number(lease.annual_installment) || 0)} ETB` },
      { label: "Down Payment:", value: `${formatCurrency(Number(lease.down_payment_amount) || 0)} ETB` },
      { label: "Start Date:", value: formatDate(lease.start_date) },
      { label: "Expiry Date:", value: formatDate(lease.expiry_date) },
      { label: "Contract Date:", value: formatDate(lease.contract_date) },
      { label: "Price per m²:", value: `${formatCurrency(Number(lease.price_per_m2) || 0)} ETB` }
    ];
    
    leaseDetails.forEach((detail, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const xPos = col === 0 ? leftMargin + 5 : pageWidth / 2 + 5;
      
      doc.setFont("helvetica", "normal");
      doc.text(detail.label, xPos, yPos + 15 + (row * 7));
      doc.setFont("helvetica", "bold");
      doc.text(detail.value, xPos + (col === 0 ? 50 : 50), yPos + 15 + (row * 7));
    });
    
    yPos += leaseBgHeight + 15; // Increased gap after lease summary (background height + extra spacing)
  } else {
    yPos += 15; // Add some gap even if no lease
  }
  
  // Billing Records Table - Removed Paid column
  if (billing_records && billing_records.length > 0) {
    // Check if we need a new page
    if (yPos + 20 > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Billing Records", leftMargin + 5, yPos);
    yPos += 15; // Increased gap after Billing Records title
    
    const now = new Date();
    
    // Prepare table data - Removed Paid column
    const tableData = billing_records.map((record, index) => {
      const dueDate = record.due_date ? new Date(record.due_date) : null;
      const isPastDue = dueDate && dueDate.getTime() < now.getTime();
      const penaltyVisible = isPastDue && (Number(record.penalty_amount) || 0) > 0;
      
      return [
        (index + 1).toString(),
        record.fiscal_year || '-',
        formatDate(record.due_date),
        formatCurrency(Number((record as any).base_payment) || Number(record.amount_due) || 0),
        formatCurrency(Number((record as any).interest_amount) || 0),
        penaltyVisible ? formatCurrency(Number(record.penalty_amount) || 0) : '-',
        formatCurrency(Number(record.amount_due) || 0),
        record.payment_status || 'UNPAID',
        formatCurrency(Number((record as any).remaining_amount) || 0)
      ];
    });
    
    // Calculate column widths to use full A4 width
    const columnWidths = {
      0: 12,  // S.No
      1: 18,  // Year
      2: 22,  // Due Date
      3: 24,  // Base
      4: 24,  // Interest
      5: 24,  // Penalty
      6: 24,  // Due
      7: 22,  // Status
      8: 26,  // Remaining
    };
    
    // Generate table with full width
    autoTable(doc, {
      startY: yPos,
      head: [[
        'S.No', 
        'Year', 
        'Due Date', 
        'Base\n(ETB)', 
        'Interest\n(ETB)', 
        'Penalty\n(ETB)', 
        'Due\n(ETB)', 
        'Status', 
        'Remaining\n(ETB)'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 8,
        halign: 'center',
        valign: 'middle'
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      columnStyles: {
        0: { cellWidth: columnWidths[0], halign: 'center' },
        1: { cellWidth: columnWidths[1], halign: 'center' },
        2: { cellWidth: columnWidths[2], halign: 'center' },
        3: { cellWidth: columnWidths[3], halign: 'right' },
        4: { cellWidth: columnWidths[4], halign: 'right' },
        5: { cellWidth: columnWidths[5], halign: 'right' },
        6: { cellWidth: columnWidths[6], halign: 'right' },
        7: { cellWidth: columnWidths[7], halign: 'left' },
        8: { cellWidth: columnWidths[8], halign: 'right' },
      },
      margin: { left: leftMargin, right: rightMargin },
      tableWidth: tableWidth,
      didDrawPage: function(data) {
        // Add a light gray line at the top of new pages to separate from header
        if (data.pageNumber > 1) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(leftMargin, 45, pageWidth - rightMargin, 45);
        }
      }
    });
    
    // Get the final Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 20;
    
    // Summary Footer
    if (finalY + 40 < pageHeight - 20) {
    //   // Calculate totals
    //   const totalDue = billing_records.reduce((sum, record) => sum + (Number(record.amount_due) || 0), 0);
    //   const totalPaid = billing_records.reduce((sum, record) => sum + (Number(record.amount_paid) || 0), 0);
    //   const totalRemaining = billing_records.reduce((sum, record) => sum + (Number((record as any).remaining_amount) || 0), 0);
      
    //   // Add a light background for the summary
    //   doc.setFillColor(240, 244, 248);
    //   doc.rect(leftMargin, finalY + 10, tableWidth, 28, 'F');
      
    //   doc.setFontSize(9);
    //   doc.setFont("helvetica", "bold");
      
    //   // First row of summary
    //   doc.text(`Total Amount Due: ${formatCurrency(totalDue)} ETB`, leftMargin + 5, finalY + 18);
    //   doc.text(`Total Amount Paid: ${formatCurrency(totalPaid)} ETB`, leftMargin + 95, finalY + 18);
      
    //   // Second row of summary
    //   doc.text(`Total Remaining: ${formatCurrency(totalRemaining)} ETB`, leftMargin + 5, finalY + 28);
      
    //   // Add a note about the status
    //   doc.setFont("helvetica", "normal");
    //   doc.setFontSize(7);
    //   doc.setTextColor(100, 100, 100);
    //   doc.text(
    //     `* Remaining balance reflects the outstanding amount after all payments`,
    //     leftMargin + 5, finalY + 36
    //   );
    }
  } else {
    // No billing records message
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("No billing records available", pageWidth / 2, yPos + 20, { align: "center" });
  }
  
  // Add footers to all pages
  addFooter();
  
  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`billing_statement_${upin || 'parcel'}_${timestamp}.pdf`);
};