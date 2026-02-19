// src/controllers/uploadController.ts (Updated)
import type {Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma.ts';
import { AuditAction } from '../generated/prisma/enums.ts';
import type { AuthRequest } from '../middlewares/authMiddleware.ts';
import { uploadExcelFile } from '../services/uploadService.ts';

// Configure multer for regular uploads (non-wizard)
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and DOC/DOCX are allowed.'));
    }
  }
});

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  
  try {
    const {
      document_type,
      upin,
      owner_id,
      lease_id,
      is_lease,
      sub_city,
    } = req.body;

    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Validate required fields based on context
    if (!document_type) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required',
      });
    }

    // Build document data
    const documentData: any = {
      file_url: `/uploads/${file.filename}`,
      file_name: file.originalname,
      doc_type: document_type,
      is_verified: false,
      upload_date: new Date(),
    };

    // Determine entity to link to
    if (is_lease === 'true' && lease_id) {
      // Check if lease exists
      const lease = await prisma.lease_agreements.findUnique({
        where: { lease_id },
      });

      if (!lease) {
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        return res.status(404).json({
          success: false,
          message: 'Lease not found',
        });
      }

      documentData.lease_id = lease_id;
      documentData.upin = lease.upin;
    } 
    else if (upin) {
      // Check if parcel exists
      const parcel = await prisma.land_parcels.findUnique({
        where: { upin },
      });

      if (!parcel) {
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        return res.status(404).json({
          success: false,
          message: 'Parcel not found',
        });
      }

      documentData.upin = upin;
    } 
    else if (owner_id) {
      // Check if owner exists
      const owner = await prisma.owners.findUnique({
        where: { owner_id },
      });

      if (!owner) {
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        return res.status(404).json({
          success: false,
          message: 'Owner not found',
        });
      }

      documentData.owner_id = owner_id;
    } 
    else {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: 'Either upin, owner_id, or lease_id must be provided',
      });
    }

    // Create document record
    const document = await prisma.documents.create({
      data: documentData,
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        user_id: user.user_id,
        action_type: AuditAction.CREATE,
        entity_type: 'documents',
        entity_id: document.doc_id,
        changes: {
          action: 'upload_document',
          document_type: document.doc_type,
          file_name: document.file_name,
          linked_to: documentData.upin ? 'parcel' : 
                    documentData.owner_id ? 'owner' : 'lease',
          linked_id: documentData.upin || documentData.owner_id || documentData.lease_id,
          actor_id: user.user_id,
          actor_role: user.role,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        doc_id: document.doc_id,
        file_url: document.file_url,
        file_name: document.file_name,
        doc_type: document.doc_type,
        upload_date: document.upload_date,
      },
    });
  } catch (error: any) {
    console.error('Upload document error:', error);
    
    // Clean up file if it was uploaded
    if ((req as any).file?.path && fs.existsSync((req as any).file.path)) {
      fs.unlinkSync((req as any).file.path);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Separate endpoint for wizard document serving
export const serveWizardDocument = async (req: Request, res: Response) => {
  try {

    const session_id = req.params.session_id as string;
      const  step = req.params.step as string;
       const  filename = req.params.filename as string;
    
    // Get file path from wizard temporary storage
    const wizardDocsDir = path.join(process.cwd(), 'temp', 'wizard_docs');
    const filePath = path.join(wizardDocsDir, session_id, step, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }
    
    // Determine content type
    const ext = path.extname(filename as string).toLowerCase();
    const contentType = {
      '.pdf': 'application/pdf',
        }[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    
    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Serve wizard document error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to serve document',
    });
  }
};



// src/controllers/uploadController.ts (Updated uploadExcel function)

export const uploadExcel = async (req: Request, res: Response) => {
  let filePath: string | null = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    filePath = req.file.path;

    const subcityId = (req as any).user?.sub_city_id;
    
    if (!subcityId) {
      // Clean up file if it exists
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: 'Subcity ID not found in user context'
      });
    }

    const result = await uploadExcelFile(filePath, subcityId);

    // Generate summary report as string
    const reportContent = generateSummaryReport(result);

    // Clean up uploaded Excel file
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up file:', cleanupError);
    }

    // Set response headers for text file download
    const fileName = `upload_report_${Date.now()}.txt`;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', Buffer.byteLength(reportContent));

    // Send the file content directly
    return res.send(reportContent);

  } catch (error: any) {
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    // Generate error report as string
    const errorReport = generateErrorReport(error);
    
    // Set response headers for text file download
    const fileName = `error_report_${Date.now()}.txt`;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', Buffer.byteLength(errorReport));

    // Send the error file content directly
    return res.send(errorReport);
  }
};


export const validateUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  next();
};

// Helper function to generate human-readable summary report
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

// Helper function to generate error report
function generateErrorReport(error: any): string {
  const date = new Date().toLocaleString();
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push('EXCEL UPLOAD ERROR REPORT');
  lines.push('='.repeat(80));
  lines.push(`Generated: ${date}`);
  lines.push('');
  lines.push('❌ ERROR DETAILS');
  lines.push('-'.repeat(40));
  
  // Format error based on type
  if (error.code === 'ENOENT' || error.message?.includes('file not found')) {
    lines.push('📁 FILE ACCESS ERROR');
    lines.push('');
    lines.push('The uploaded file could not be found or accessed.');
    lines.push('');
    lines.push('Possible causes:');
    lines.push('  • File was deleted during upload');
    lines.push('  • Insufficient file permissions');
    lines.push('  • Invalid file path');
    lines.push('  • Disk space issue');
    lines.push('');
    lines.push('Solutions:');
    lines.push('  • Try uploading the file again');
    lines.push('  • Check if you have write permissions in the uploads directory');
    lines.push('  • Contact system administrator if the problem persists');
  } 
  else if (error.message?.includes('Invalid Excel file') || error.message?.includes('worksheet not found')) {
    lines.push('📊 FILE FORMAT ERROR');
    lines.push('');
    lines.push('The file is not a valid Excel file or has an incorrect structure.');
    lines.push('');
    lines.push('Requirements:');
    lines.push('  • File must be a valid Excel file (.xlsx or .xls)');
    lines.push('  • Data must be in the first worksheet (Sheet1)');
    lines.push('  • Headers should be in rows 1-2');
    lines.push('  • Data should start from row 3');
    lines.push('  • File must not be corrupted or password-protected');
    lines.push('');
    lines.push('Solutions:');
    lines.push('  • Save your file as .xlsx format');
    lines.push('  • Ensure the file is not open in another program');
    lines.push('  • Try opening and re-saving the file');
    lines.push('  • Remove any password protection from the file');
  }
  else if (error.code === 'P2002') {
    lines.push('🔄 DUPLICATE RECORD ERROR');
    lines.push('');
    lines.push('A record with the same unique identifier already exists.');
    lines.push('');
    if (error.meta?.target) {
      lines.push(`Duplicate field: ${error.meta.target.join(', ')}`);
    }
    lines.push('');
    lines.push('Solutions:');
    lines.push('  • Remove duplicate entries from your file');
    lines.push('  • Use unique UPIN and file numbers');
    lines.push('  • If updating existing records, use the update feature instead');
  }
  else if (error.code === 'P2003') {
    lines.push('🔗 REFERENCE ERROR');
    lines.push('');
    lines.push('Invalid reference to parent record.');
    lines.push('');
    lines.push('Solutions:');
    lines.push('  • Check that all referenced subcity IDs are valid');
    lines.push('  • Ensure related records exist before creating this one');
    lines.push('  • Verify you have the correct permissions');
  }
  else if (error.message?.includes('timeout')) {
    lines.push('⏱️ TIMEOUT ERROR');
    lines.push('');
    lines.push('The upload operation took too long to complete.');
    lines.push('');
    lines.push('Solutions:');
    lines.push('  • Reduce the number of rows in your file');
    lines.push('  • Split large files into smaller batches');
    lines.push('  • Try again during off-peak hours');
  }
  else {
    lines.push(`Error Type: ${error.name || 'Unknown Error'}`);
    lines.push(`Error Message: ${error.message || 'No message available'}`);
    
    if (process.env.NODE_ENV === 'development' && error.stack) {
      lines.push('');
      lines.push('Stack Trace:');
      lines.push(error.stack);
    }
  }
  
  lines.push('');
  lines.push('🔧 TROUBLESHOOTING STEPS');
  lines.push('-'.repeat(40));
  lines.push('1. Verify your Excel file follows the required template');
  lines.push('2. Check that all required fields (UPIN, File Number) are filled');
  lines.push('3. Ensure UPIN values are unique in your file');
  lines.push('4. Validate that area values are positive numbers');
  lines.push('5. Make sure YES/NO fields contain only "YES" or "NO"');
  lines.push('6. Check that file numbers are unique');
  lines.push('7. Try uploading a smaller batch of rows (50-100 rows)');
  lines.push('8. Contact system administrator with this error report');
  lines.push('');
  lines.push('📞 SUPPORT INFORMATION');
  lines.push('-'.repeat(40));
  lines.push('Please provide this error report when contacting support:');
  lines.push(`Error Code: ${error.code || 'N/A'}`);
  lines.push(`Timestamp: ${date}`);
  lines.push(`File: ${error.fileName || 'N/A'}`);
  lines.push('');
  lines.push('='.repeat(80));
  lines.push('END OF ERROR REPORT');
  lines.push('='.repeat(80));
  
  return lines.join('\n');
}

// Export middleware
export const uploadMiddleware = upload.single('document');
export const uploadExcelMiddleware = upload.single('file');