// src/services/approvalDocumentStorageService.ts
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import prisma from '../config/prisma.ts';
import { connect } from 'http2';

export interface ApprovalStoredDocument {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  metadata?: any;
}

export class ApprovalDocumentStorageService {
  private tempDir: string;
  private permanentDir: string;
  
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'approval_docs');
    this.permanentDir = path.join(process.cwd(), 'uploads', 'approved');
    
    // Ensure directories exist
    [this.tempDir, this.permanentDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Store document temporarily for approval request
 async storeTemporary(
  file: Express.Multer.File,
  approvalRequestId: string,
  documentType: string,
  metadata?: any
): Promise<ApprovalStoredDocument> {
  // Store under uploads/temp/approval-docs/{approvalRequestId}/
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const tempDir = path.join(uploadsDir, 'temp', 'approval-docs', approvalRequestId);
  
  console.log("doc type from approval service for store temporary", documentType);
  console.log("Saving to directory:", tempDir);
  
  // Ensure directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Generate unique filename
  const fileId = randomBytes(16).toString('hex');
  const fileExtension = path.extname(file.originalname);
  const fileName = `${fileId}${fileExtension}`;
  const filePath = path.join(tempDir, fileName);
  
  // Public URL that matches the express static route
  // This will be served from: /uploads/temp/approval-docs/{approvalRequestId}/{fileName}
  const publicUrl = `/uploads/temp/approval-docs/${approvalRequestId}/${fileName}`;

  // Save file
  await fs.promises.writeFile(filePath, file.buffer);

  return {
    id: fileId,
    file_url: publicUrl,  // Now starts with /uploads
    file_name: file.originalname,
    file_size: file.size,
    mime_type: file.mimetype,
    document_type: documentType,
    metadata: metadata || {}
  };
}

  // Get temporary file for approval request
  async getTemporaryFile(approvalRequestId: string, fileName: string): Promise<string> {
    const filePath = path.join(this.tempDir, approvalRequestId, fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    return filePath;
  }

// Move approval documents to permanent storage with transaction support
async moveToPermanent(
  approvalRequestId: string,
  entityType: string,
  entityId: string,
  documents: ApprovalStoredDocument[],
  approverId: string,
  tx?: any // Transaction parameter for all-or-nothing behavior
): Promise<any[]> {
  const permanentDocs = [];
  const movedFiles: { tempPath: string; permanentPath: string }[] = [];

  try {
    // Use transaction if provided, otherwise use default prisma client
    const db = tx || prisma;

    // Define uploadsDir at the function level so it's accessible everywhere
    const uploadsDir = path.join(process.cwd(), 'uploads');

    for (const doc of documents) {
      // Extract filename from URL
      // New URL format: /uploads/temp/approval-docs/{approvalRequestId}/{fileName}
      const urlParts = doc.file_url.split('/');
      const tempFileName = urlParts[urlParts.length - 1] as string;
      
      // Generate permanent path under uploads/approved directory
      const permanentPath = this.generatePermanentPath(
        entityType,
        entityId,
        doc.file_name,
        doc.document_type
      );

      // New temp file path under uploads/temp/approval-docs/{approvalRequestId}/
      const tempFilePath = path.join(
        uploadsDir, 
        'temp', 
        'approval-docs', 
        approvalRequestId, 
        tempFileName
      );

      console.log('Moving file from:', tempFilePath);
      console.log('Moving file to:', permanentPath.path);

      if (fs.existsSync(tempFilePath)) {
        // Ensure permanent directory exists
        const permanentDir = path.dirname(permanentPath.path);
        if (!fs.existsSync(permanentDir)) {
          fs.mkdirSync(permanentDir, { recursive: true });
        }

        // Track the file move for rollback if needed
        movedFiles.push({
          tempPath: tempFilePath,
          permanentPath: permanentPath.path
        });

        // Move file - copy first, then delete original after successful DB operation
        await fs.promises.copyFile(tempFilePath, permanentPath.path);

        // Create document record in database
        // Filter metadata to only include valid Prisma fields or store as JSON in a valid field
        const documentData = {
          file_url: permanentPath.url, // This will be /uploads/approved/{entityType}/{entityId}/{fileName}
          file_name: doc.file_name,
          doc_type: doc.document_type,
          is_verified: true,
          upload_date: new Date(),
          user: {
            connect: {
              user_id: approverId
            }
          },
          ...this.getEntityForeignKeys(entityType, entityId),
          ...this.filterValidDocumentMetadata(doc.metadata) // Filter metadata to valid fields
        };

        const docRecord = await db.documents.create({
          data: documentData
        });

        permanentDocs.push({
          ...docRecord,
          original_document_id: doc.id,
          metadata: doc.metadata // Keep original metadata separate
        });
      } else {
        console.error(`Temp file not found: ${tempFilePath}`);
        throw new Error(`Temporary file not found: ${tempFileName}`);
      }
    }

    // Now that all DB operations are successful, delete the temporary files
    for (const file of movedFiles) {
      if (fs.existsSync(file.tempPath)) {
        await fs.promises.unlink(file.tempPath);
        console.log('Deleted temp file:', file.tempPath);
      }
    }

    // Clean up empty temporary directory
    const requestDir = path.join(uploadsDir, 'temp', 'approval-docs', approvalRequestId);
    await this.cleanupDirectoryIfEmpty(requestDir);

    return permanentDocs;

  } catch (error) {
    // Rollback: Delete any files that were moved to permanent storage
    console.error('Error during move to permanent, rolling back:', error);
    for (const file of movedFiles) {
      if (fs.existsSync(file.permanentPath)) {
        try {
          await fs.promises.unlink(file.permanentPath);
          console.log('Rollback - deleted permanent file:', file.permanentPath);
        } catch (unlinkError) {
          console.error('Error rolling back file move:', unlinkError);
        }
      }
    }
    
    // Database rollback will be handled by the transaction
    throw error;
  }
}

// Filter metadata to only include valid Prisma document fields
private filterValidDocumentMetadata(metadata?: any): any {
  if (!metadata) return {};
  
  const validFields = [
    'uploaded_at', // This is invalid in Prisma schema, should be upload_date
    'uploaded_by',
    'uploaded_by_role',
    // Add other metadata fields that should be stored elsewhere
  ];
  
  const filteredMetadata: any = {};
  
  // Check each metadata property
  for (const [key, value] of Object.entries(metadata)) {
    // Handle special cases
    if (key === 'uploaded_at') {
      // Convert uploaded_at to upload_date if it's a string
      if (typeof value === 'string') {
        filteredMetadata.upload_date = new Date(value);
      }
    } else if (validFields.includes(key)) {
      // Only include fields that are valid in the Prisma schema
      // Note: uploaded_by and uploaded_by_role don't exist in the Prisma schema
      // You might need to store these in a different way
    }
  }
  
  return filteredMetadata;
}

  // Alternative method that handles the entire operation in a transaction
  async moveToPermanentWithTransaction(
    approvalRequestId: string,
    entityType: string,
    entityId: string,
    documents: ApprovalStoredDocument[],
    approverId: string
  ): Promise<any[]> {
    return await prisma.$transaction(async (tx) => {
      return this.moveToPermanent(
        approvalRequestId,
        entityType,
        entityId,
        documents,
        approverId,
        tx
      );
    });
  }

  // Delete temporary document
  async deleteTemporary(approvalRequestId: string, fileName: string): Promise<void> {
    const filePath = path.join(this.tempDir, approvalRequestId, fileName);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      
      // Clean up empty directories
      await this.cleanupEmptyDirectories(path.join(this.tempDir, approvalRequestId));
    }
  }

// List documents for approval request (from database only)
async listDocuments(approvalRequestId: string): Promise<ApprovalStoredDocument[]> {
  try {
    // Get the approval request to access request_data
    const approvalRequest = await prisma.approval_requests.findUnique({
      where: { request_id: approvalRequestId },
      select: { 
        request_data: true,
        entity_type: true,
        entity_id: true
      }
    });

    if (!approvalRequest || !approvalRequest.request_data) {
      return [];
    }

    const requestData = approvalRequest.request_data as any;
    const documents: ApprovalStoredDocument[] = [];

    // Extract documents from request_data
    if (requestData.documents && Array.isArray(requestData.documents)) {
      for (const doc of requestData.documents) {
        // Skip invalid documents
        if (!doc || typeof doc !== 'object') {
          continue;
        }

        // Ensure required fields exist
        const docId = doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fileName = doc.file_name || 'unknown_document';
        const fileUrl = doc.file_url || '';
        
        // Determine document type
        let documentType = doc.document_type || 'SUPPORTING_DOCUMENT';
        
        // If no document type specified, try to infer from filename
        if (!doc.document_type && fileName) {
          const fileNameLower = fileName.toLowerCase();
          if (fileNameLower.includes('id') || fileNameLower.includes('identification')) {
            documentType = 'ID_COPY';
          } else if (fileNameLower.includes('contract') || fileNameLower.includes('agreement')) {
            documentType = 'CONTRACT';
          } else if (fileNameLower.includes('map') || fileNameLower.includes('plan')) {
            documentType = 'MAP';
          } else if (fileNameLower.includes('tax') || fileNameLower.includes('tin')) {
            documentType = 'TAX_DOCUMENT';
          } else if (fileNameLower.includes('transfer') || fileNameLower.includes('deed')) {
            documentType = 'TRANSFER_DEED';
          } else if (fileNameLower.includes('subdivision')) {
            documentType = 'SUBDIVISION_PLAN';
          }
        }

        // Create document object
        const document: ApprovalStoredDocument = {
          id: docId,
          file_url: fileUrl,
          file_name: fileName,
          file_size: doc.file_size || 0,
          mime_type: doc.mime_type || this.getMimeType(fileName),
          document_type: documentType,
          metadata: {
            ...(doc.metadata || {}),
            source: 'approval_request_data',
            entity_type: approvalRequest.entity_type,
            entity_id: approvalRequest.entity_id,
            uploaded_at: doc.metadata?.uploaded_at || new Date().toISOString(),
            uploaded_by: doc.metadata?.uploaded_by,
            uploaded_by_role: doc.metadata?.uploaded_by_role
          }
        };

        documents.push(document);
      }
    }

    // Also check for owner_details or other nested data that might contain documents
    if (requestData.owner_details?.documents && Array.isArray(requestData.owner_details.documents)) {
      for (const doc of requestData.owner_details.documents) {
        if (doc && typeof doc === 'object') {
          const docId = doc.id || `owner_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          documents.push({
            id: docId,
            file_url: doc.file_url || '',
            file_name: doc.file_name || 'owner_document',
            file_size: doc.file_size || 0,
            mime_type: doc.mime_type || 'application/octet-stream',
            document_type: doc.document_type || 'OWNER_DOCUMENT',
            metadata: {
              ...(doc.metadata || {}),
              source: 'owner_details',
              nested_in: 'owner_details',
              uploaded_at: doc.metadata?.uploaded_at || new Date().toISOString()
            }
          });
        }
      }
    }

    return documents;

  } catch (error) {
    console.error('Error listing approval request documents from database:', error);
    return [];
  }
}

// // Helper method to get MIME type from filename
// private getMimeType(filename: string): string {
//   if (!filename) return 'application/octet-stream';
  
//   const ext = path.extname(filename).toLowerCase();
//   const mimeTypes: Record<string, string> = {
//     '.pdf': 'application/pdf',
//     '.jpg': 'image/jpeg',
//     '.jpeg': 'image/jpeg',
//     '.png': 'image/png',
//     '.gif': 'image/gif',
//     '.bmp': 'image/bmp',
//     '.doc': 'application/msword',
//     '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     '.xls': 'application/vnd.ms-excel',
//     '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     '.ppt': 'application/vnd.ms-powerpoint',
//     '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//     '.txt': 'text/plain',
//     '.csv': 'text/csv',
//     '.zip': 'application/zip'
//   };
  
//   return mimeTypes[ext] || 'application/octet-stream';
// }

  // Clean up expired approval requests (run via cron job)
  async cleanupExpiredApprovals(): Promise<void> {
    const expiredRequests = await prisma.approval_requests.findMany({
      where: {
        status: 'APPROVED',
        updated_at: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Older than 7 days
        }
      },
      select: { request_id: true }
    });

    for (const request of expiredRequests) {
      const requestDir = path.join(this.tempDir, request.request_id);
      if (fs.existsSync(requestDir)) {
        try {
          await fs.promises.rm(requestDir, { recursive: true, force: true });
        } catch (error) {
          console.error(`Error cleaning up request ${request.request_id}:`, error);
        }
      }
    }
  }





private generatePermanentPath(
  entityType: string,
  entityId: string,
  fileName: string,
  documentType: string
): { path: string; url: string } {
  // Generate unique filename to avoid collisions
  const fileId = randomBytes(16).toString('hex');
  const fileExtension = path.extname(fileName);
  const uniqueFileName = `${fileId}${fileExtension}`;
  
  // Store under uploads/approved/{entityType}/{entityId}/
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const permanentDir = path.join(uploadsDir, 'approved', entityType, entityId);
  const permanentFilePath = path.join(permanentDir, uniqueFileName);
  
  // Public URL that matches the express static route
  const publicUrl = `/uploads/approved/${entityType}/${entityId}/${uniqueFileName}`;
  
  return {
    path: permanentFilePath,
    url: publicUrl
  };
}

  private getEntityForeignKeys(entityType: string, entityId: string): any {
    switch (entityType) {
      case 'LAND_PARCELS':
        return { parcel: { connect: { upin: entityId } } };
      case 'OWNERS':
        return { owner: { connect: { owner_id: entityId } } };
      case 'ENCUMBRANCES':
        return { encumbrance: { connect: { encumbrance_id: entityId } } };
      case 'LEASE_AGREEMENTS':
        return { lease: { connect: { lease_id: entityId } } };
      case 'HISTORY':
        return { history: { connect: { history_id: entityId } } };
      default:
        return {};
    }
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private async cleanupEmptyDirectories(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) return;
    
    const items = await fs.promises.readdir(dirPath);
    if (items.length === 0) {
      await fs.promises.rmdir(dirPath);
      
      // Check parent directory
      const parentDir = path.dirname(dirPath);
      if (parentDir !== this.tempDir) {
        await this.cleanupEmptyDirectories(parentDir);
      }
    }
  }

private async cleanupDirectoryIfEmpty(dirPath: string): Promise<void> {
  if (fs.existsSync(dirPath)) {
    const files = await fs.promises.readdir(dirPath);
    if (files.length === 0) {
      await fs.promises.rmdir(dirPath);
      console.log('Removed empty directory:', dirPath);
      
      // Also try to clean up parent directories if they're empty
      const parentDir = path.dirname(dirPath);
      if (parentDir.includes('temp')) {
        const parentFiles = await fs.promises.readdir(parentDir);
        if (parentFiles.length === 0) {
          await fs.promises.rmdir(parentDir);
          console.log('Removed empty parent directory:', parentDir);
        }
      }
    }
  }
}
}
