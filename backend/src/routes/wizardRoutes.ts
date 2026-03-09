// src/routes/wizardRoutes.ts
import express from 'express';
import { WizardController, uploadMiddleware } from '../controllers/wizardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

// Initialize services
// import prisma from '../config/prisma.ts';
import { WizardSessionService } from '../services/wizardSessionService.js';
import { MakerCheckerService } from '../services/makerCheckerService.js';
import { AuditService } from '../services/auditService.js';
import { DocumentStorageService } from '../services/documentStorageService.js';
import { ActionExecutionService } from '../services/actionExecutionService.js';

const auditService = new AuditService();
const makerCheckerService = new MakerCheckerService( auditService);
const actionExecutionService = new ActionExecutionService()
const wizardSessionService = new WizardSessionService( makerCheckerService, auditService,actionExecutionService);
const documentStorageService = new DocumentStorageService();

const wizardController = new WizardController(wizardSessionService, documentStorageService);

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// === Wizard Session Management ===

// Create new wizard session
router.post('/sessions', (req, res) => wizardController.createSession(req, res));

// Get wizard session
router.get('/sessions/:session_id', (req, res) => wizardController.getSession(req, res));

// Save wizard step
router.post('/sessions/:session_id/steps', (req, res) => wizardController.saveStep(req, res));

// Upload document for wizard
router.post('/sessions/:session_id/documents', 
  uploadMiddleware,
  (req, res) => wizardController.uploadDocument(req, res)
);

// Delete wizard session (only DRAFT or REJECTED)
router.delete('/sessions/:session_id', 
  (req, res) => wizardController.deleteSession(req, res)
);

// Delete document from wizard
router.delete('/sessions/:session_id/documents/:document_id', 
  (req, res) => wizardController.deleteDocument(req, res)
);

// Validate wizard session
router.get('/sessions/:session_id/validate', 
  (req, res) => wizardController.validateSession(req, res)
);

// Submit wizard for approval
router.post('/sessions/:session_id/submit', 
  (req, res) => wizardController.submitForApproval(req, res)
);

// Get user's wizard sessions
router.get('/sessions', 
  (req, res) => wizardController.getUserSessions(req, res)
);

// Serve temporary document (for preview)
// router.get('/documents/:session_id/:step/:filename',
//   (req, res) => wizardController.serveDocument(req, res)
// );

export default router;