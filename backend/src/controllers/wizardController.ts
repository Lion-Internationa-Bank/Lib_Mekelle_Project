// src/controllers/wizardController.ts
import type { Request, Response } from 'express';
import multer from 'multer';
import { WizardSessionService } from '../services/wizardSessionService.ts';
import { DocumentStorageService } from '../services/documentStorageService.ts';
import type { AuthRequest } from '../middlewares/authMiddleware.ts';
import { ActionExecutionService } from '../services/actionExecutionService.ts';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma.ts';
import { MakerCheckerService } from '../services/makerCheckerService.ts';
import { AuditService } from '../services/auditService.ts';


// Initialize services
const auditService = new AuditService();
const makerCheckerService = new MakerCheckerService( auditService);
const actionExecutionService = new ActionExecutionService()
const wizardSessionService = new WizardSessionService(makerCheckerService, auditService,actionExecutionService);
const documentStorageService = new DocumentStorageService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [ 
      'application/pdf',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF is allowed.'));
    }
  }
});

export class WizardController {
  private wizardService: WizardSessionService;
  private documentStorage: DocumentStorageService;

  constructor(
    wizardService: WizardSessionService,
    documentStorage: DocumentStorageService
  ) {
    this.wizardService = wizardService;
    this.documentStorage = documentStorage;
  }

  // Create new wizard session
  async createSession(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      
      // Check if user has existing draft session
      const existingSession = await this.wizardService.getUserDraftSession(user.user_id);
      
      if (existingSession) {
        return res.status(200).json({
          success: true,
          data: { 
            session_id: existingSession.session_id,
            existing: true 
          }
        });
      }

      const sessionId = await this.wizardService.createSession(
        user.user_id,
        user.sub_city_id?? ""
      );

      return res.status(201).json({
        success: true,
        data: { session_id: sessionId }
      });
    } catch (error: any) {
      console.error('Create session error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create wizard session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get session data
  async getSession(req: AuthRequest, res: Response) {
    try {
      const session_id = req.params.session_id as string;
      const user = req.user!;
      console.log("user",user)
      console.log("session id",session_id)

      const session = await this.wizardService.getSession(session_id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check permissions
      if (session.user_id !== user.user_id && !this.canViewAsApprover(user, session)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      return res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Get session error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get session'
      });
    }
  }

  // Save step data
  async saveStep(req: AuthRequest, res: Response) {
    try {
      const session_id = req.params.session_id as string;
      const { step, data } = req.body;
      const user = req.user!;
   

      // Validate step
      const validSteps = ['parcel', 'parcel-docs', 'owner', 'owner-docs', 'lease', 'lease-docs'];
      if (!validSteps.includes(step)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid step'
        });
      }
  
      // Verify session belongs to user
      const session = await this.wizardService.getSession(session_id);
      if (!session || session.user_id !== user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await this.wizardService.saveStep({
        sessionId: session_id,
        step,
        data
      });

      return res.status(200).json({
        success: true,
        message: 'Step saved successfully'
      });
    } catch (error: any) {
      console.error('Save step error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to save step'
      });
    }
  }

  
  // Validate session
  async validateSession(req: AuthRequest, res: Response) {
    try {
      const session_id = req.params.session_id as string;
      const user = req.user!;

      // Verify session belongs to user
      const session = await this.wizardService.getSession(session_id);
      if (!session || session.user_id !== user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const validation = await this.wizardService.validateSession(session_id);

      return res.status(200).json({
        success: true,
        data: validation
      });
    } catch (error: any) {
      console.error('Validate session error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to validate session'
      });
    }
  }

  // Submit session for approval
  async submitForApproval(req: AuthRequest, res: Response) {
    try {
      const session_id = req.params.session_id as string;
      const user = req.user!;

      // Verify session belongs to user
      const session = await this.wizardService.getSession(session_id);
      if (!session || session.user_id !== user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const result = await this.wizardService.submitForApproval(session_id);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Submit for approval error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit for approval'
      });
    }
  }

  // Get user's wizard sessions
  async getUserSessions(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const sessions = await this.wizardService.getUserSessions(user.user_id);

      return res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Get user sessions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user sessions'
      });
    }
  }

  // Serve temporary document
  async serveDocument(req: AuthRequest, res: Response) {
    try {
      const session_id = req.params.session_id as string;
      const step = req.params.step as string;
      const filename = req.params.filename as string;
      const user = req.user!;

      // Verify session belongs to user or approver can view
      const session = await this.wizardService.getSession(session_id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      const canView = session.user_id === user.user_id || this.canViewAsApprover(user, session);
      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const filePath = await this.documentStorage.getTemporaryFile(session_id, step, filename);
      
      // Determine content type
      const contentType = this.getContentType(filename);
      res.setHeader('Content-Type', contentType);
      
      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (error: any) {
      console.error('Serve document error:', error);
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
  // Upload document for wizard
  async uploadDocument(req: AuthRequest, res: Response) {
    try {
      const session_id = req.params.session_id as string;
      const { step, document_type } = req.body;
      const file = (req as any).file;
      const user = req.user!;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Validate step
      const validSteps = ['parcel-docs', 'owner-docs', 'lease-docs'];
      if (!validSteps.includes(step)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid step for document upload'
        });
      }

      // Verify session belongs to user
      const session = await this.wizardService.getSession(session_id);
      if (!session || session.user_id !== user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (session.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          message: 'Cannot upload documents to a submitted session'
        });
      }

      // Store document temporarily
      const storedDoc = await this.documentStorage.storeTemporary(
        file,
        session_id,
        step,
        document_type,
        {
          uploaded_by: user.user_id,
          uploaded_at: new Date().toISOString()
        }
      );

      // Get current documents for this step
      const stepField = step === 'parcel-docs' ? 'parcel_docs' :
                       step === 'owner-docs' ? 'owner_docs' : 'lease_docs';
      
      const currentDocs: any[] = Array.isArray(session[stepField]) ? session[stepField] : [];
      const updatedDocs = [...currentDocs, storedDoc];

      // Save to session
      await this.wizardService.saveStep({
        sessionId: session_id,
        step,
        data: updatedDocs
      });

      return res.status(200).json({
        success: true,
        data: storedDoc
      });
    } catch (error: any) {
      console.error('Upload document error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload document'
      });
    }
  }

  // Delete document from wizard
  async deleteDocument(req: AuthRequest, res: Response) {
    try {
      const session_id = req.params.session_id as string;
      const document_id = req.params.document_id as string;
      const { step } = req.body;
      const user = req.user!;


      console.log('SID',session_id)
      console.log("document id",document_id)

      // Verify session belongs to user
      const session = await this.wizardService.getSession(session_id);
      if (!session || session.user_id !== user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (session.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete documents from a submitted session'
        });
      }

      // Get current documents
      const stepField = step === 'parcel-docs' ? 'parcel_docs' :
                       step === 'owner-docs' ? 'owner_docs' : 'lease_docs';
      
      const currentDocs: any[] = Array.isArray(session[stepField]) ? session[stepField] : [];
      console.log("current docs",currentDocs)
      const documentToDelete = currentDocs.find((doc: any) => doc.id === document_id);
        console.log("document to delete",documentToDelete)
      if (!documentToDelete) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Extract filename from URL
      const urlParts = documentToDelete.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await this.documentStorage.deleteTemporary(session_id, step, fileName);

      // Remove from session
      const updatedDocs = currentDocs.filter((doc: any) => doc.id !== document_id);
      
      await this.wizardService.saveStep({
        sessionId: session_id,
        step,
        data: updatedDocs
      });

      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete document error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete document'
      });
    }
  }


  private canViewAsApprover(user: any, session: any): boolean {
    if (user.role === 'SUBCITY_ADMIN' && session.sub_city_id === user.sub_city_id) {
      return true;
    }
    
    if (user.role === 'CITY_ADMIN') {
      return true;
    }
    
    return false;
  }

  private getContentType(filename: string): string {
    const extension = path.extname(filename).toLowerCase();
    
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
    };
    
    return contentTypes[extension] || 'application/octet-stream';
  }
}

// Export upload middleware
export const uploadMiddleware = upload.single('file');