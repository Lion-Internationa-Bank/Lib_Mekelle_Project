// src/routes/makerCheckerRoutes.ts
import express from 'express';
import { MakerCheckerController } from '../controllers/makerCheckerController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';
import { canApproveRequest } from '../middlewares/approvalMiddleware.ts';
import { validateRequest } from '../middlewares/validateRequest.ts';
import {
  approveRequestSchema,
  rejectRequestSchema,
  validateMakerPendingRequestsQuery,
  validateApproverPendingRequestsQuery
} from '../validation/makerCheckerSchemas.ts';


// Initialize services

import { MakerCheckerService } from '../services/makerCheckerService.ts';
import { WizardSessionService } from '../services/wizardSessionService.ts';
import { AuditService } from '../services/auditService.ts';
import { DocumentStorageService } from '../services/documentStorageService.ts';
import { ActionExecutionService } from '../services/actionExecutionService.ts';

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
  authorize(['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'CITY_ADMIN']),
  validateRequest(validateApproverPendingRequestsQuery),
  (req, res) => makerCheckerController.getPendingRequests(req, res)
);

// Get request details
router.get('/requests/:request_id',
  authorize(['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'CITY_ADMIN','SUBCITY_NORMAL']),
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


export default router;