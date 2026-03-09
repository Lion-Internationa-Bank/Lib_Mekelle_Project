// src/routes/makerCheckerRoutes.ts
import express from 'express';
import { MakerCheckerController } from '../controllers/makerCheckerController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { canApproveRequest } from '../middlewares/approvalMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  approveRequestSchema,
  rejectRequestSchema,
  validateMakerPendingRequestsQuery,
  validateApproverPendingRequestsQuery
} from '../validation/makerCheckerSchemas.js';


// Initialize services

import { MakerCheckerService } from '../services/makerCheckerService.js';
import { WizardSessionService } from '../services/wizardSessionService.js';
import { AuditService } from '../services/auditService.js';
import { DocumentStorageService } from '../services/documentStorageService.js';
import { ActionExecutionService } from '../services/actionExecutionService.js';

const auditService = new AuditService();
const makerCheckerService = new MakerCheckerService( auditService);
const actionExecutionService = new ActionExecutionService();
const wizardSessionService = new WizardSessionService(makerCheckerService, auditService,actionExecutionService);
const documentStorageService = new DocumentStorageService();

const makerCheckerController = new MakerCheckerController(makerCheckerService, wizardSessionService);

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// === Approval Routes ===
router.get('/makers/:maker_id/pending-requests',
  authenticate,
  validateRequest(validateMakerPendingRequestsQuery),
  (req, res) => makerCheckerController.getMakerPendingRequests(req, res)
);

// Get pending requests (for approvers)
router.get('/requests', 
  authorize(['SUBCITY_APPROVER', 'CITY_APPROVER', 'REVENUE_APPROVER']),
  validateRequest(validateApproverPendingRequestsQuery),
  (req, res) => makerCheckerController.getPendingRequests(req, res)
);

// Get request details
router.get('/requests/:request_id',
  authorize(['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'CITY_ADMIN','SUBCITY_NORMAL','SUBCITY_APPROVER', 'CITY_APPROVER', 'REVENUE_APPROVER']),
  (req, res) => makerCheckerController.getRequestDetails(req, res)
);

// Approve request
router.post('/requests/:request_id/approve',
  authorize(['SUBCITY_APPROVER', 'CITY_APPROVER', 'REVENUE_APPROVER']),
  canApproveRequest,
  validateRequest(approveRequestSchema),
  (req, res) => makerCheckerController.approveRequest(req, res)
);

// Reject request
router.post('/requests/:request_id/reject',
  authorize(['SUBCITY_APPROVER', 'CITY_APPROVER', 'REVENUE_APPROVER']),
  canApproveRequest,
  validateRequest(rejectRequestSchema),
  (req, res) => makerCheckerController.rejectRequest(req, res)
);


export default router;