// src/controllers/approvalDocumentController.ts
import {type Response } from 'express';
// 
import {type AuthRequest } from '../middlewares/authMiddleware.ts';
import { ApprovalDocumentStorageService } from '../services/approvalDocumentStorageService.ts';
import prisma from '../config/prisma.ts';
import { RequestStatus } from '../generated/prisma/enums.ts';
import fs from 'fs';

export class ApprovalDocumentController {
  private docService: ApprovalDocumentStorageService;

  constructor() {
    this.docService = new ApprovalDocumentStorageService();
  }

  // Upload document to approval request
  async uploadDocument(req: AuthRequest, res: Response) {
    try {
      const  request_id  = req.params.request_id as string;
      const { document_type,metadata } = req.body;
      const file = (req as any).file;
      const user = req.user!;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Get approval request
      const approvalRequest = await prisma.approval_requests.findUnique({
        where: { request_id },
        include: { maker: true }
      });

      if (!approvalRequest) {
        return res.status(404).json({
          success: false,
          message: 'Approval request not found'
        });
      }

      // Check permissions - only maker can upload
      const isMaker = approvalRequest.maker_id === user.user_id;
      
      if (!isMaker) {
        return res.status(403).json({
          success: false,
          message: 'Only the request creator can upload documents'
        });
      }

      if (approvalRequest.status !== RequestStatus.PENDING) {
        return res.status(400).json({
          success: false,
          message: 'Cannot upload documents to a processed request'
        });
      }
      console.log("document type",document_type)
       // Parse metadata if it's a string
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === 'string' 
          ? JSON.parse(metadata) 
          : metadata;
      } catch (e) {
        console.error('Failed to parse metadata:', e);
      }
    }

      // Store document
      const storedDoc = await this.docService.storeTemporary(
        file,
        request_id,
        document_type || 'SUPPORTING_DOCUMENT',
        { ...parsedMetadata,
          uploaded_by: user.user_id,
          uploaded_by_role: user.role,
          uploaded_at: new Date().toISOString()
        }
      );
console.log("store doc from app constroller ", storedDoc )
      // Get current request data
      const requestData = approvalRequest.request_data as any;
      const currentDocuments = Array.isArray(requestData?.documents) 
        ? requestData.documents 
        : [];

      // Update request_data with new document
    const updatedRequestData = {
      ...requestData,
      documents: [...currentDocuments, storedDoc],
      
      // If this is a subdivision document, also store it under the specific parcel
      ...(parsedMetadata.parcel_upin && {
        parcel_documents: {
          ...(requestData.parcel_documents || {}),
          [parsedMetadata.parcel_upin]: [
            ...(requestData.parcel_documents?.[parsedMetadata.parcel_upin] || []),
            storedDoc
          ]
        }
      }),
      last_document_update: new Date().toISOString()
    };
    
 console.log("updated reqest data form app doc controller  ",updatedRequestData)
      // Update approval request
      await prisma.approval_requests.update({
        where: { request_id },
        data: {
          request_data: updatedRequestData,
          updated_at: new Date()
        }
      });

      // Create audit log
      await prisma.audit_logs.create({
        data: {
          user_id: user.user_id,
          action_type: 'UPDATE',
          entity_type: 'APPROVAL_REQUEST',
          entity_id: request_id,
          changes: {
            action: 'upload_document',
            document_id: storedDoc.id,
            document_name: storedDoc.file_name,
            document_type: storedDoc.document_type,
            total_documents_now: updatedRequestData.documents.length,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date(),
          ip_address: req.ip || req.socket.remoteAddress
        }
      });

      return res.status(200).json({
        success: true,
        data: storedDoc
      });

    } catch (error: any) {
      console.error('Upload approval document error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload document'
      });
    }
  }

  // Upload multiple documents
  async uploadMultipleDocuments(req: AuthRequest, res: Response) {
    try {
      const  request_id  = req.params.request_id as string;
      const { document_type } = req.body;
      const files = (req as any).files as Express.Multer.File[];
      const user = req.user!;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Get approval request
      const approvalRequest = await prisma.approval_requests.findUnique({
        where: { request_id },
        include: { maker: true }
      });

      if (!approvalRequest) {
        return res.status(404).json({
          success: false,
          message: 'Approval request not found'
        });
      }

      // Check permissions
      const isMaker = approvalRequest.maker_id === user.user_id;
      
      if (!isMaker) {
        return res.status(403).json({
          success: false,
          message: 'Only the request creator can upload documents'
        });
      }

      if (approvalRequest.status !== RequestStatus.PENDING) {
        return res.status(400).json({
          success: false,
          message: 'Cannot upload documents to a processed request'
        });
      }

      // Upload each file
      const uploadedDocs = [];
      const requestData = approvalRequest.request_data as any;
      const currentDocuments = Array.isArray(requestData?.documents) 
        ? requestData.documents 
        : [];

      for (const file of files) {
        const storedDoc = await this.docService.storeTemporary(
          file,
          request_id,
          document_type || 'SUPPORTING_DOCUMENT',
          {
            uploaded_by: user.user_id,
            uploaded_by_role: user.role,
            uploaded_at: new Date().toISOString()
          }
        );

        uploadedDocs.push(storedDoc);
      }

      // Update request_data
      const updatedRequestData = {
        ...requestData,
        documents: [...currentDocuments, ...uploadedDocs],
        last_document_update: new Date().toISOString()
      };

      // Update approval request
      await prisma.approval_requests.update({
        where: { request_id },
        data: {
          request_data: updatedRequestData,
          updated_at: new Date()
        }
      });

      // Create audit log
      await prisma.audit_logs.create({
        data: {
          user_id: user.user_id,
          action_type: 'UPDATE',
          entity_type: 'APPROVAL_REQUEST',
          entity_id: request_id,
          changes: {
            action: 'upload_multiple_documents',
            document_count: files.length,
            document_types: uploadedDocs.map(doc => doc.document_type),
            total_documents_now: updatedRequestData.documents.length,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date(),
          ip_address: req.ip || req.socket.remoteAddress
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          uploaded_count: uploadedDocs.length,
          documents: uploadedDocs,
          total_documents: updatedRequestData.documents.length
        }
      });

    } catch (error: any) {
      console.error('Upload multiple approval documents error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload documents'
      });
    }
  }

  // List documents for approval request
// In approvalDocumentController.ts - listDocuments method
async listDocuments(req: AuthRequest, res: Response) {
  try {
    const request_id = req.params.request_id as string;
    const user = req.user!;

    const approvalRequest = await prisma.approval_requests.findUnique({
      where: { request_id },
      include: { maker: true }
    });

    if (!approvalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    // Check permissions
    const isMaker = approvalRequest.maker_id === user.user_id;
    const isApprover = user.role === approvalRequest.approver_role;
    
    if (!isMaker && !isApprover) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get documents from database (request_data)
    const documents = await this.docService.listDocuments(request_id);

    return res.status(200).json({
      success: true,
      data: {
        approval_request_id: request_id,
        document_count: documents.length,
        documents: documents
      }
    });

  } catch (error: any) {
    console.error('List approval documents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list documents'
    });
  }
}
  // Delete document from approval request
  async deleteDocument(req: AuthRequest, res: Response) {
    try {

    //   const { request_id, document_id } = req.params;
    const request_id = req.params.request_id as string;
    const document_id = req.params.document_id as string
      const user = req.user!;

      const approvalRequest = await prisma.approval_requests.findUnique({
        where: { request_id },
        include: { maker: true }
      });

      if (!approvalRequest) {
        return res.status(404).json({
          success: false,
          message: 'Approval request not found'
        });
      }

      // Check permissions
      const isMaker = approvalRequest.maker_id === user.user_id;
      
      if (!isMaker) {
        return res.status(403).json({
          success: false,
          message: 'Only the request creator can delete documents'
        });
      }

      if (approvalRequest.status !== RequestStatus.PENDING) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete documents from a processed request'
        });
      }

      // Get current request data
      const requestData = approvalRequest.request_data as any;
      const currentDocuments = Array.isArray(requestData?.documents) 
        ? requestData.documents 
        : [];

      // Find document to delete
      const documentToDelete = currentDocuments.find((doc: any) => doc.id === document_id);
      
      if (!documentToDelete) {
        return res.status(404).json({
          success: false,
          message: 'Document not found in request data'
        });
      }

      // Extract filename from URL and delete from storage
      const urlParts = documentToDelete.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      await this.docService.deleteTemporary(request_id, fileName);

      // Remove from request_data
      const updatedDocuments = currentDocuments.filter((doc: any) => doc.id !== document_id);
      const updatedRequestData = {
        ...requestData,
        documents: updatedDocuments
      };

      // Update approval request
      await prisma.approval_requests.update({
        where: { request_id },
        data: {
          request_data: updatedRequestData,
          updated_at: new Date()
        }
      });

      // Create audit log
      await prisma.audit_logs.create({
        data: {
          user_id: user.user_id,
          action_type: 'UPDATE',
          entity_type: 'APPROVAL_REQUEST',
          entity_id: request_id,
          changes: {
            action: 'delete_document',
            document_id,
            document_name: documentToDelete.file_name,
            remaining_documents: updatedDocuments.length,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date(),
          ip_address: req.ip || req.socket.remoteAddress
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
        data: {
          remaining_documents: updatedDocuments.length
        }
      });

    } catch (error: any) {
      console.error('Delete approval document error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete document'
      });
    }
  }

  // Serve approval document
  async serveDocument(req: AuthRequest, res: Response) {
    try {
     const request_id = req.params.request_id as string;
     const filename =   req.params.request_id as string;
     const user = req.user!;

      const approvalRequest = await prisma.approval_requests.findUnique({
        where: { request_id },
        include: { maker: true }
      });

      if (!approvalRequest) {
        return res.status(404).json({
          success: false,
          message: 'Approval request not found'
        });
      }

      // Check permissions
      const isMaker = approvalRequest.maker_id === user.user_id;
      const isApprover = user.role === approvalRequest.approver_role;
      
      if (!isMaker && !isApprover) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const filePath = await this.docService.getTemporaryFile(request_id, filename);
      
      // Determine content type
      const contentType = this.getMimeType(filename);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (error: any) {
      console.error('Serve approval document error:', error);
      if (error.message === 'File not found') {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to serve document'
      });
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
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.zip': 'application/zip',
      '.txt': 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}