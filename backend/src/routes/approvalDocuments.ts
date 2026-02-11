// src/routes/approvalDocuments.ts
import { Router } from 'express';
import multer from 'multer';
import { ApprovalDocumentController } from '../controllers/approvalDocumentController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';

const router = Router();
const controller = new ApprovalDocumentController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Max 5 files per request
  }
});

// Upload single document
router.post('/:request_id/documents',
  authenticate,
  upload.single('document'),
  controller.uploadDocument.bind(controller)
);

// Upload multiple documents
router.post('/:request_id/documents/multiple',
  authenticate,
  uploadMultiple.array('documents', 5),
  controller.uploadMultipleDocuments.bind(controller)
);

// List documents
router.get('/:request_id/documents',
  authenticate,
  controller.listDocuments.bind(controller)
);

// Delete document
router.delete('/:request_id/documents/:document_id',
  authenticate,
  controller.deleteDocument.bind(controller)
);

// Serve document
router.get('/documents/:request_id/:filename',
  authenticate,
  controller.serveDocument.bind(controller)
);

export default router;