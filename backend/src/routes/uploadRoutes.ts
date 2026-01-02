// routes/upload.ts
import { Router } from 'express';
import { uploadDocument } from '../middlewares/upload.ts';
import { handleUpload } from '../controllers/uploadController.ts';

const router = Router();

router.post('/', uploadDocument, handleUpload);

export default router;