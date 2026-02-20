// src/routes/uploadRoutes.ts (Updated)
import express from 'express';
import { uploadDocument, serveWizardDocument, uploadMiddleware,uploadExcel, validateUpload,uploadExcelMiddleware} from '../controllers/uploadController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';
import path from 'path';
import upload from '../middlewares/uploadMiddleware.ts';
const router = express.Router();
const uploadsPath = path.join(process.cwd());

// Regular document upload (for existing entities)
router.post('/',
  authenticate,
  authorize(['SUBCITY_NORMAL', 'SUBCITY_ADMIN', 'REVENUE_USER']),
  uploadMiddleware,
  uploadDocument
);

router.get(
  '/:filename',
  authenticate,
  (req, res) => {
    console.log(req.params.filename)
    const decodedFilename = decodeURIComponent(req.params.filename as string);
    const filePath = path.join(uploadsPath, decodedFilename);
    res.sendFile(filePath);
  }
);

// Serve wizard documents (public endpoint for preview)
router.get('/wizard/:session_id/:step/:filename',
  serveWizardDocument
);

router.post(
  '/excel',
  authenticate,
  uploadExcelMiddleware,
  validateUpload,
  uploadExcel
);


export default router;