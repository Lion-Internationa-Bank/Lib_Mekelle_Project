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

// Helper function to check if text contains Amharic characters
const containsAmharic = (text: string): boolean => {
  const amharicRange = /[\u1200-\u137F]/;
  return amharicRange.test(text);
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

// Improved font registration with better error handling
const registerAmharicFont = async (doc: jsPDF): Promise<boolean> => {
  try {
    console.log('Attempting to load Amharic fonts...');
    
    // Fetch Regular font from public folder with cache busting
    const regularFontUrl = `/fonts/Noto_Sans_Ethiopic/static/NotoSansEthiopic_ExtraCondensed-Regular.ttf?t=${Date.now()}`;
    console.log('Fetching regular font from:', regularFontUrl);
    
    const regularFontResponse = await fetch(regularFontUrl);
    if (!regularFontResponse.ok) {
      throw new Error(`Failed to fetch regular font: ${regularFontResponse.status}`);
    }
    
    const regularFontArrayBuffer = await regularFontResponse.arrayBuffer();
    
    // Convert to base64 more reliably
    const regularFontBase64 = btoa(
      Array.from(new Uint8Array(regularFontArrayBuffer))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    
    // Add regular font
    doc.addFileToVFS('NotoSansEthiopic-Regular.ttf', regularFontBase64);
    doc.addFont('NotoSansEthiopic-Regular.ttf', 'amharic', 'normal');
    console.log('Regular Amharic font loaded successfully');

    // Fetch Bold font
    const boldFontUrl = `/fonts/Noto_Sans_Ethiopic/static/NotoSansEthiopic_ExtraCondensed-Bold.ttf?t=${Date.now()}`;
    console.log('Fetching bold font from:', boldFontUrl);
    
    const boldFontResponse = await fetch(boldFontUrl);
    if (!boldFontResponse.ok) {
      throw new Error(`Failed to fetch bold font: ${boldFontResponse.status}`);
    }
    
    const boldFontArrayBuffer = await boldFontResponse.arrayBuffer();
    const boldFontBase64 = btoa(
      Array.from(new Uint8Array(boldFontArrayBuffer))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    
    // Add bold font
    doc.addFileToVFS('NotoSansEthiopic-Bold.ttf', boldFontBase64);
    doc.addFont('NotoSansEthiopic-Bold.ttf', 'amharic', 'bold');
    console.log('Bold Amharic font loaded successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to load Amharic fonts:', error);
    return false;
  }
};

export const generateBillingPDF = async (data: ParcelDetail) => {
  console.log('Generating PDF with data:', data);
  
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
  
  // Create PDF document with better settings
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Register Amharic fonts and wait for completion
  const fontsLoaded = await registerAmharicFont(doc);
  console.log('Fonts loaded status:', fontsLoaded);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Use minimal margins to maximize table width
  const leftMargin = 10;
  const rightMargin = 10;
  const tableWidth = pageWidth - leftMargin - rightMargin;
  
  // Get owner information
  const ownerName = getOwnerName(owners);
  const ownerNationalId = getOwnerNationalId(owners);
  const ownerCount = owners?.length || 0;

  console.log('Owner name:', ownerName);
  console.log('Contains Amharic:', containsAmharic(ownerName));

  // Helper function to add footer to each page
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      
      // Use Helvetica for footer
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }
  };

  // Improved helper function to add text with reliable font switching
  const addText = (
    text: string, 
    x: number, 
    y: number, 
    options?: {
      style?: 'normal' | 'bold' | 'italic',
      fontSize?: number,
      align?: 'left' | 'center' | 'right',
      forceAmharic?: boolean // Force Amharic font even if no Amharic detected
    }
  ) => {
    const hasAmharic = containsAmharic(text) || options?.forceAmharic;
    const style = options?.style || 'normal';
    const fontSize = options?.fontSize || 10;
    const align = options?.align || 'left';
    
    doc.setFontSize(fontSize);
    
    // Always try to use Amharic font if text contains Amharic or forced
    if (hasAmharic && fontsLoaded) {
      try {
        // Use appropriate style
        if (style === 'bold') {
          doc.setFont('amharic', 'bold');
        } else {
          doc.setFont('amharic', 'normal');
        }
        console.log(`Using Amharic font for: "${text.substring(0, 20)}..."`);
      } catch (error) {
        console.warn('Failed to set Amharic font, falling back to Helvetica:', error);
        doc.setFont("helvetica", style);
      }
    } else {
      doc.setFont("helvetica", style);
    }
    
    // For debugging, log when Amharic text is being rendered
    if (hasAmharic) {
      console.log(`Rendering Amharic text: "${text}"`);
    }
    
    doc.text(text, x, y, { align });
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
  
  // Draw background
  doc.setFillColor(240, 244, 248);
  doc.rect(leftMargin, yPos - 5, tableWidth, 68, 'F'); // Increased height to accommodate all rows
  
  // Section title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Parcel Information", leftMargin + 5, yPos + 5);
  
  // Column positions
  const col1 = leftMargin + 5;
  const col2 = leftMargin + 65; // Adjusted for better spacing
  const col3 = leftMargin + 120; // Adjusted for better spacing
  
  // Row 1
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("UPIN:", col1, yPos + 15);
  doc.setFont("helvetica", "bold");
  doc.text(upin || 'N/A', col2, yPos + 15);
  
  doc.setFont("helvetica", "normal");
  doc.text("File No:", col3, yPos + 15);
  doc.setFont("helvetica", "bold");
  doc.text(file_number || 'N/A', col3 + 25, yPos + 15);
  
  // Row 2 - Owner Name (using addText for Amharic support)
  addText("Owner:", col1, yPos + 22);
  // Truncate owner name if too long
  const displayOwnerName = ownerName.length > 30 ? ownerName.substring(0, 27) + '...' : ownerName;
  addText(displayOwnerName, col2, yPos + 22, { style: 'bold', forceAmharic: true }); // Force Amharic for owner names
  
  addText("National ID:", col3, yPos + 22);
  addText(ownerNationalId, col3 + 25, yPos + 22, { style: 'bold' });
  
  // Row 3 - Area and Sub-city
  addText("Area:", col1, yPos + 29);
  addText(`${total_area_m2 || '0'} m²`, col2, yPos + 29, { style: 'bold' });
  
  addText("Sub-city:", col3, yPos + 29);
  addText(sub_city?.name || 'N/A', col3 + 25, yPos + 29, { style: 'bold', forceAmharic: true });
  
  // Row 4 - Tabia and Ketena
  addText("Tabia:", col1, yPos + 36);
  addText(tabia || 'N/A', col2, yPos + 36, { style: 'bold', forceAmharic: true });
  
  addText("Ketena:", col3, yPos + 36);
  addText(ketena || 'N/A', col3 + 25, yPos + 36, { style: 'bold', forceAmharic: true });
  
  // Row 5 - Block
  addText("Block:", col1, yPos + 43);
  addText(block || 'N/A', col2, yPos + 43, { style: 'bold' });
  
  // Show if there are multiple owners
  if (ownerCount > 1) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    addText(`+ ${ownerCount - 1} additional owner(s)`, col3, yPos + 43, { style: 'italic' });
    doc.setTextColor(0, 0, 0);
  }
  
  yPos += 75; // Increased gap after parcel information
  
  // Lease Summary Section (if available)
  if (lease) {
    console.log('Adding lease section:', lease);
    
    // Check if we need a new page
    if (yPos + 90 > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    // Calculate background height
    const leaseBgHeight = 75; // Increased for better spacing
    
    // Draw background
    doc.setFillColor(240, 244, 248);
    doc.rect(leftMargin, yPos - 5, tableWidth, leaseBgHeight, 'F');
    
    // Section title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Lease Summary", leftMargin + 5, yPos + 5);
    
    doc.setFontSize(10);
    
    // Lease details - organized in rows
    const leaseRows = [
      [
        { label: "Payment Term:", value: `${lease.payment_term_years || 0} years` },
        { label: "Lease Period:", value: `${lease.lease_period_years || 0} years` }
      ],
      [
        { label: "Total Amount:", value: `${formatCurrency(Number(lease.total_lease_amount) || 0)} ETB` },
        { label: "Annual Installment:", value: `${formatCurrency(Number(lease.annual_installment) || 0)} ETB` }
      ],
      [
        { label: "Down Payment:", value: `${formatCurrency(Number(lease.down_payment_amount) || 0)} ETB` },
        { label: "Price per m²:", value: `${formatCurrency(Number(lease.price_per_m2) || 0)} ETB` }
      ],
      [
        { label: "Start Date:", value: formatDate(lease.start_date) },
        { label: "Expiry Date:", value: formatDate(lease.expiry_date) }
      ],
      [
        { label: "Contract Date:", value: formatDate(lease.contract_date) },
        { label: "", value: "" } // Empty for alignment
      ]
    ];
    
    leaseRows.forEach((row, rowIndex) => {
      // Left column
      doc.setFont("helvetica", "normal");
      doc.text(row[0].label, leftMargin + 5, yPos + 18 + (rowIndex * 8));
      doc.setFont("helvetica", "bold");
      doc.text(row[0].value, leftMargin + 55, yPos + 18 + (rowIndex * 8));
      
      // Right column
      if (row[1].label) {
        doc.setFont("helvetica", "normal");
        doc.text(row[1].label, pageWidth / 2 + 5, yPos + 18 + (rowIndex * 8));
        doc.setFont("helvetica", "bold");
        doc.text(row[1].value, pageWidth / 2 + 55, yPos + 18 + (rowIndex * 8));
      }
    });
    
    yPos += leaseBgHeight + 15;
  } else {
    yPos += 15;
  }
  
  // Billing Records Table
  if (billing_records && billing_records.length > 0) {
    console.log('Adding billing records:', billing_records.length);
    
    // Check if we need a new page
    if (yPos + 20 > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Billing Records", leftMargin + 5, yPos);
    yPos += 10;
    
    const now = new Date();
    
    // Prepare table data
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
    
    // Generate table
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
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 22, halign: 'right' },
        7: { cellWidth: 22, halign: 'left' },
        8: { cellWidth: 24, halign: 'right' },
      },
      margin: { left: leftMargin, right: rightMargin },
      didDrawPage: function(data) {
        if (data.pageNumber > 1) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(leftMargin, 45, pageWidth - rightMargin, 45);
        }
      }
    });
    
  } else {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("No billing records available", pageWidth / 2, yPos + 20, { align: "center" });
  }
  
  // Add footers to all pages
  addFooter();
  
  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `billing_statement_${upin || 'parcel'}_${timestamp}.pdf`;
  console.log('Saving PDF as:', filename);
  
  doc.save(filename);
};