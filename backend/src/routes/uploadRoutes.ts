// src/routes/uploadRoutes.ts (Updated)
import express from 'express';
import { uploadDocument, serveWizardDocument, uploadMiddleware } from '../controllers/uploadController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';

const router = express.Router();

// Regular document upload (for existing entities)
router.post('/',
  authenticate,
  authorize(['SUBCITY_NORMAL', 'SUBCITY_ADMIN', 'REVENUE_USER']),
  uploadMiddleware,
  uploadDocument
);

// Serve wizard documents (public endpoint for preview)
router.get('/wizard/:session_id/:step/:filename',
  serveWizardDocument
);

export default router;