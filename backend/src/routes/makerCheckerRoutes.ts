// src/routes/makerCheckerRoutes.ts
import express from 'express';
import { MakerCheckerController } from '../controllers/makerCheckerController.ts';
import { WizardController, uploadMiddleware } from '../controllers/wizardController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';
import { canApproveRequest } from '../middlewares/approvalMiddleware.ts';
import { validateRequest } from '../middlewares/validateRequest.ts';
import {
  approveRequestSchema,
  rejectRequestSchema,
  createWizardSessionSchema,
  saveWizardStepSchema,
  uploadDocumentSchema,
  submitWizardSchema
} from '../validation/makerCheckerSchemas.ts';

// Initialize services
import prisma from '../config/prisma.ts';
import { MakerCheckerService } from '../services/makerCheckerService.ts';
import { WizardSessionService } from '../services/wizardSessionService.ts';
import { AuditService } from '../services/auditService.ts';
import { DocumentStorageService } from '../services/documentStorageService.ts';

const auditService = new AuditService();
const makerCheckerService = new MakerCheckerService( auditService);
const wizardSessionService = new WizardSessionService(makerCheckerService, auditService);
const documentStorageService = new DocumentStorageService();

const makerCheckerController = new MakerCheckerController(makerCheckerService, wizardSessionService);
const wizardController = new WizardController(wizardSessionService, documentStorageService);

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// === Approval Routes ===

// Get pending requests (for approvers)
router.get('/requests', 
  authorize(['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'CITY_ADMIN']),
  (req, res) => makerCheckerController.getPendingRequests(req, res)
);

// Get request details
router.get('/requests/:request_id',
  authorize(['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'CITY_ADMIN']),
  (req, res) => makerCheckerController.getRequestDetails(req, res)
);

// Approve request
router.post('/requests/:request_id/approve',
  authorize(['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'CITY_ADMIN']),
  canApproveRequest,
  validateRequest(approveRequestSchema),
  (req, res) => makerCheckerController.approveRequest(req, res)
);

// Reject request
router.post('/requests/:request_id/reject',
  authorize(['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'CITY_ADMIN']),
  canApproveRequest,
  validateRequest(rejectRequestSchema),
  (req, res) => makerCheckerController.rejectRequest(req, res)
);

// === Wizard Session Routes ===

// Create new wizard session
router.post('/wizard/sessions',
  validateRequest(createWizardSessionSchema),
  (req, res) => wizardController.createSession(req, res)
);

// Get wizard session
router.get('/wizard/sessions/:session_id',
  (req, res) => wizardController.getSession(req, res)
);

// Save wizard step
router.post('/wizard/sessions/:session_id/steps',
  validateRequest(saveWizardStepSchema),
  (req, res) => wizardController.saveStep(req, res)
);

// Upload document for wizard
router.post('/wizard/sessions/:session_id/documents',
  uploadMiddleware,
  validateRequest(uploadDocumentSchema),
  (req, res) => wizardController.uploadDocument(req, res)
);

// Submit wizard for approval
router.post('/wizard/sessions/:session_id/submit',
  validateRequest(submitWizardSchema),
  (req, res) => wizardController.submitForApproval(req, res)
);

// Validate wizard session
router.get('/wizard/sessions/:session_id/validate',
  (req, res) => wizardController.validateSession(req, res)
);

// Get user's wizard sessions
router.get('/wizard/sessions',
  (req, res) => makerCheckerController.getUserSessions(req, res)
);

export default router;