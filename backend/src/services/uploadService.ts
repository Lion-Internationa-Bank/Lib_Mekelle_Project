import ExcelJS from 'exceljs';
import prisma from '../config/prisma.ts';


interface ExcelRow {
  sn?: number | string;
  tabia?: string;
  tender?: string;
  ketena?: string;
  block?: string;
  upin: string;
  full_name?: string;
  file_number?: string;
  total_area_m2?: number | string;
  land_use?: string;
  court_encumbrance?: string;
  bank_encumbrance?: string;
  lease_agreement?: string;
  phone_number?: string;
  rowNumber: number;
}

interface UploadResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  skippedRows: number;
  results: {
    successful: Array<{ row: number; upin: string; message: string }>;
    failed: Array<{ row: number; upin: string; errors: string[] }>;
    skipped: Array<{ row: number; upin: string; reason: string }>;
  };
  summary: {
    parcelsCreated: number;
    parcelsSkipped: number; // Changed from parcelsUpdated
    ownersCreated: number;
    ownersLinked: number;
    encumbrancesCreated: number;
  };
}

// Update the uploadExcelFile function to store file_number in the error context
export const uploadExcelFile = async (filePath: string, subcityId: string): Promise<UploadResult> => {
  const result: UploadResult = {
    success: false,
    totalRows: 0,
    processedRows: 0,
    failedRows: 0,
    skippedRows: 0,
    results: {
      successful: [],
      failed: [],
      skipped: []
    },
    summary: {
      parcelsCreated: 0,
      parcelsSkipped: 0,
      ownersCreated: 0,
      ownersLinked: 0,
      encumbrancesCreated: 0
    }
  };

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Get the first worksheet (assuming data is in Sheet1)
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      throw new Error('No worksheet found in the Excel file');
    }

    // Process each row (starting from row 3 as specified)
    for (let i = 3; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      
      // Check if row is empty
      if (isEmptyRow(row)) {
        continue;
      }

      result.totalRows++;

      const rowData = extractRowData(row, i);
      
      // Skip if UPIN is missing (required field)
      if (!rowData.upin) {
        result.skippedRows++;
        result.results.skipped.push({
          row: i,
          upin: 'N/A',
          reason: 'UPIN is required but was empty'
        });
        continue;
      }

      // Validate row data
      const validationErrors = validateRowData(rowData);
      
      if (validationErrors.length > 0) {
        result.failedRows++;
        result.results.failed.push({
          row: i,
          upin: rowData.upin,
          errors: validationErrors
        });
        continue;
      }

      try {
        // Process the row within a transaction
        await prisma.$transaction(async (tx) => {
          // Check if parcel already exists
          const existingParcel = await tx.land_parcels.findUnique({
            where: { upin: rowData.upin }
          });

          if (existingParcel) {
            // Skip if parcel already exists (no update)
            result.skippedRows++;
            result.results.skipped.push({
              row: i,
              upin: rowData.upin,
              reason: 'Parcel with this UPIN already exists'
            });
            result.summary.parcelsSkipped++;
            return;
          }

          // Create new parcel
          const parcel = await createParcel(tx, rowData, subcityId);
          result.summary.parcelsCreated++;

          // Handle owner
          if (rowData.full_name) {
            await handleOwner(tx, parcel.upin, rowData, subcityId, result.summary);
          }

          // Handle encumbrances
          await handleEncumbrances(tx, parcel.upin, rowData, result.summary);

          result.processedRows++;
          result.results.successful.push({
            row: i,
            upin: rowData.upin,
            message: 'Created successfully'
          });
        });
      } catch (error: any) {
        console.error(`Error processing row ${i}:`, error);
        result.failedRows++;
        
        // Format the error message with row data context
        const formattedErrors = formatPrismaError(error, rowData);
        
        result.results.failed.push({
          row: i,
          upin: rowData.upin,
          errors: formattedErrors
        });
      }
    }

    result.success = result.failedRows === 0;
    return result;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
};

// Helper function to format Prisma errors with row data
function formatPrismaError(error: any, rowData: ExcelRow): string[] {
  const errors: string[] = [];
  
  // Handle Prisma unique constraint errors (P2002)
  if (error.code === 'P2002') {
    const target = error.meta?.target || [];
    
    if (target.includes('file_number')) {
      errors.push(`File number "${rowData.file_number || 'MISSING'}" already exists in the system. Each file number must be unique.`);
    } else if (target.includes('upin')) {
      errors.push(`UPIN "${rowData.upin}" already exists in the system. Each UPIN must be unique.`);
    } else {
      errors.push(`Duplicate value detected. This record conflicts with existing data.`);
    }
  }
  // Handle foreign key constraint errors (P2003)
  else if (error.code === 'P2003') {
    errors.push(`Referenced record not found. Please check that all referenced IDs are valid.`);
  }
  // Handle other Prisma errors
  else if (error.code?.startsWith('P')) {
    errors.push(`Database error: ${error.message || 'Unknown database error'}`);
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    errors.push(error.message);
  }
  // Handle generic errors
  else {
    errors.push(error.message || 'Unknown error occurred');
  }
  
  return errors;
}

// Update the generateSummaryReport function to properly format errors
function generateSummaryReport(result: any): string {
  const date = new Date().toLocaleString();
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push('EXCEL UPLOAD SUMMARY REPORT');
  lines.push('='.repeat(80));
  lines.push(`Generated: ${date}`);
  lines.push('');
  
  // Summary statistics
  lines.push('SUMMARY STATISTICS');
  lines.push('-'.repeat(40));
  lines.push(`Total Rows Processed: ${result.totalRows}`);
  lines.push(`✅ Successfully Processed: ${result.processedRows}`);
  lines.push(`❌ Failed: ${result.failedRows}`);
  lines.push(`⏭️ Skipped: ${result.skippedRows}`);
  lines.push('');
  
  // Database operations
  lines.push('DATABASE OPERATIONS');
  lines.push('-'.repeat(40));
  lines.push(`📦 Parcels Created: ${result.summary.parcelsCreated}`);
  lines.push(`⏭️ Parcels Skipped (Duplicate UPIN): ${result.summary.parcelsSkipped}`);
  lines.push(`👤 Owners Created: ${result.summary.ownersCreated}`);
  lines.push(`🔗 Owner-Parcel Relationships: ${result.summary.ownersLinked}`);
  lines.push(`⚖️ Encumbrances Created: ${result.summary.encumbrancesCreated}`);
  lines.push('');
  
  // Successful rows
  if (result.results.successful.length > 0) {
    lines.push('✅ SUCCESSFUL ROWS');
    lines.push('-'.repeat(40));
    result.results.successful.forEach((item: any) => {
      lines.push(`  Row ${item.row}: UPIN ${item.upin} - ${item.message}`);
    });
    lines.push('');
  }
  
  // Skipped rows with reasons
  if (result.results.skipped.length > 0) {
    lines.push('⏭️ SKIPPED ROWS');
    lines.push('-'.repeat(40));
    result.results.skipped.forEach((item: any) => {
      lines.push(`  Row ${item.row}: UPIN ${item.upin}`);
      lines.push(`  Reason: ${item.reason}`);
      lines.push('');
    });
  }
  
  // Failed rows with errors
  if (result.results.failed.length > 0) {
    lines.push('❌ FAILED ROWS - ACTION REQUIRED');
    lines.push('-'.repeat(40));
    result.results.failed.forEach((item: any) => {
      lines.push(`Row ${item.row}: UPIN ${item.upin}`);
      lines.push(`  File Number: ${item.file_number || 'N/A'}`);
      lines.push('  Errors:');
      
      // Format each error message to be human-readable
      item.errors.forEach((error: string) => {
        lines.push(`    • ${error}`);
      });
      lines.push('');
    });
  }
  
  // Recommendations based on errors
  if (result.failedRows > 0 || result.skippedRows > 0) {
    lines.push('📋 RECOMMENDATIONS');
    lines.push('-'.repeat(40));
    
    // Check for specific error types and provide targeted recommendations
    const hasDuplicateFileNumber = result.results.failed.some((item: any) => 
      item.errors.some((e: string) => e.toLowerCase().includes('file number') && e.toLowerCase().includes('already exists'))
    );
    
    const hasDuplicateUPIN = result.results.failed.some((item: any) => 
      item.errors.some((e: string) => e.toLowerCase().includes('upin') && e.toLowerCase().includes('already exists'))
    );
    
    const hasMissingRequired = result.results.failed.some((item: any) => 
      item.errors.some((e: string) => e.toLowerCase().includes('required'))
    );
    
    const hasInvalidValues = result.results.failed.some((item: any) => 
      item.errors.some((e: string) => e.toLowerCase().includes('must be') || e.toLowerCase().includes('positive'))
    );
    
    if (hasDuplicateFileNumber) {
      lines.push('🔴 DUPLICATE FILE NUMBERS DETECTED:');
      lines.push('   • Each file number must be unique in the system');
      lines.push('   • The file numbers you provided already exist in the database');
      lines.push('   • Check the failed rows above to see which file numbers are duplicate');
      lines.push('   • Solution: Use different file numbers or remove these rows from your upload');
      lines.push('');
    }
    
    if (hasDuplicateUPIN) {
      lines.push('🔴 DUPLICATE UPIN DETECTED:');
      lines.push('   • Each UPIN must be unique in the system');
      lines.push('   • The UPINs you provided already exist in the database');
      lines.push('   • Solution: Remove duplicate UPINs from your file');
      lines.push('');
    }
    
    if (hasMissingRequired) {
      lines.push('⚠️ MISSING REQUIRED FIELDS:');
      lines.push('   • Some rows are missing required information');
      lines.push('   • Check the failed rows above for specific missing fields');
      lines.push('   • Solution: Fill in all required fields and re-upload');
      lines.push('');
    }
    
    if (hasInvalidValues) {
      lines.push('⚠️ INVALID VALUES:');
      lines.push('   • Some fields contain invalid data');
      lines.push('   • Check the failed rows above for specific validation errors');
      lines.push('   • Solution: Correct the values and re-upload');
      lines.push('');
    }
    
    // General recommendations
    lines.push('📌 GENERAL GUIDANCE:');
    if (result.failedRows > 0) {
      lines.push('   • Fix the errors in failed rows and re-upload ONLY those rows');
      lines.push('   • Keep the successful rows as they are - no need to re-upload');
    }
    
    if (result.skippedRows > 0) {
      lines.push('   • Skipped rows (duplicate UPINs) cannot be re-uploaded');
      lines.push('   • Use the update feature to modify existing parcels');
    }
    
    lines.push('');
  }
  
  // Next steps
  lines.push('🚀 NEXT STEPS');
  lines.push('-'.repeat(40));
  if (result.failedRows === 0 && result.skippedRows === 0) {
    lines.push('✅ All rows processed successfully! No action needed.');
  } else if (result.failedRows === 0 && result.skippedRows > 0) {
    lines.push('⚠️ File partially processed. Review skipped rows above.');
    lines.push('📤 You can proceed with the successfully created records.');
  } else {
    lines.push('📝 Please fix the errors in failed rows and upload a corrected file.');
    lines.push('💾 Save this report for reference when fixing the errors.');
  }
  lines.push('');
  
  lines.push('='.repeat(80));
  lines.push('END OF REPORT');
  lines.push('='.repeat(80));
  
  return lines.join('\n');
}

// Also update the extractRowData function to ensure file_number is properly extracted
function extractRowData(row: ExcelJS.Row, rowNumber: number): ExcelRow {
  // Column mappings (1-based index)
  const fileNumber = row.getCell(8).value?.toString() || '';
  
  const data: ExcelRow = {
    sn: row.getCell(1).value?.toString() || '',
    tabia: row.getCell(2).value?.toString() || '',
    tender: row.getCell(3).value?.toString() || '',
    ketena: row.getCell(4).value?.toString() || '',
    block: row.getCell(5).value?.toString() || '',
    upin: row.getCell(6).value?.toString() || '',
    full_name: row.getCell(7).value?.toString() || '',
    file_number: fileNumber,
    total_area_m2: Number(row.getCell(9).value),
    land_use: row.getCell(10).value?.toString() || '',
    court_encumbrance: row.getCell(11).value?.toString() || '',
    bank_encumbrance: row.getCell(12).value?.toString() || '',
    lease_agreement: row.getCell(13).value?.toString() || '',
    phone_number: row.getCell(16).value?.toString() || '',
    rowNumber
  };

  return data;
}
function isEmptyRow(row: ExcelJS.Row): boolean {
  let isEmpty = true;
  row.eachCell({ includeEmpty: false }, () => {
    isEmpty = false;
  });
  return isEmpty;
}


function validateRowData(row: ExcelRow): string[] {
  const errors: string[] = [];

  // Required fields
  if (!row.upin) {
    errors.push('UPIN is required');
  }

  if (!row.file_number) {
    errors.push('File number is required');
  }

  // Validate area if provided
  if (row.total_area_m2) {
    const area = parseFloat(row.total_area_m2.toString());
    if (isNaN(area) || area <= 0) {
      errors.push('Total area must be a positive number');
    }
  }

  // Validate encumbrance values
  if (row.court_encumbrance && !['YES', 'NO'].includes(row.court_encumbrance.toUpperCase())) {
    errors.push('Court encumbrance must be YES or NO');
  }

  if (row.bank_encumbrance && !['YES', 'NO'].includes(row.bank_encumbrance.toUpperCase())) {
    errors.push('Bank encumbrance must be YES or NO');
  }

  // Validate lease agreement
  if (row.lease_agreement && !['YES', 'NO'].includes(row.lease_agreement.toUpperCase())) {
    errors.push('Lease agreement must be YES or NO');
  }

  return errors;
}

async function createParcel(
  tx: any,
  rowData: ExcelRow,
  subcityId: string
) {
  // Parse area to Decimal
  let area = null;
  if (rowData.total_area_m2) {
    const areaValue = parseFloat(rowData.total_area_m2.toString());
    if (!isNaN(areaValue) && areaValue > 0) {
      area =  Number(areaValue.toString());
    }
  }

  const tenureType = rowData.lease_agreement?.toUpperCase() === 'YES' 
    ? 'LEASE' 
    : 'OLD_POSSESSION';

  return tx.land_parcels.create({
    data: {
      upin: rowData.upin,
      file_number: rowData.file_number,
      tender: rowData.tender || null,
      tabia: rowData.tabia || null,
      ketena: rowData.ketena || null,
      block: rowData.block || null,
      total_area_m2: area,
      land_use: rowData.land_use?.toUpperCase() || null,
      sub_city_id: subcityId,
      tenure_type: tenureType
    }
  });
}

async function handleOwner(
  tx: any,
  upin: string,
  rowData: ExcelRow,
  subcityId: string,
  summary: any
) {
  // Create new owner
  const owner = await tx.owners.create({
    data: {
      full_name: rowData.full_name!,
      phone_number: rowData.phone_number || null,
      sub_city_id: subcityId
    }
  });
  summary.ownersCreated++;

  // Create parcel-owner relationship
  await tx.parcel_owners.create({
    data: {
      upin,
      owner_id: owner.owner_id,
      is_active: true,
      acquired_at: new Date()
    }
  });
  summary.ownersLinked++;
}

async function handleEncumbrances(
  tx: any,
  upin: string,
  rowData: ExcelRow,
  summary: any
) {
  const encumbrances: Array<{ type: string; issuing_entity: string }> = [];

  if (rowData.court_encumbrance?.toUpperCase() === 'YES') {
    encumbrances.push({ type: 'COURT', issuing_entity: 'COURT' });
  }

  if (rowData.bank_encumbrance?.toUpperCase() === 'YES') {
    encumbrances.push({ type: 'BANK', issuing_entity: 'BANK' });
  }

  // Create new encumbrances if any
  for (const enc of encumbrances) {
    await tx.encumbrances.create({
      data: {
        upin,
        type: enc.type,
        issuing_entity: enc.issuing_entity,
        status: 'ACTIVE',
        registration_date: new Date()
      }
    });
    summary.encumbrancesCreated++;
  }
}