// src/controllers/uploadController.ts (Updated)
import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma.ts';
import { AuditAction } from '../generated/prisma/enums.ts';
import type { AuthRequest } from '../middlewares/authMiddleware.ts';

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
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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

// Export middleware
export const uploadMiddleware = upload.single('document');