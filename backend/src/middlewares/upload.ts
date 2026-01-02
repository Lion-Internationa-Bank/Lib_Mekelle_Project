// src/middlewares/upload.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root uploads folder (project root/uploads)
export const UPLOADS_BASE = path.join(process.cwd(), 'uploads');

// Temporary folder for initial upload
const TEMP_UPLOADS = path.join(UPLOADS_BASE, 'temp');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_BASE)) {
  fs.mkdirSync(UPLOADS_BASE, { recursive: true });
}
if (!fs.existsSync(TEMP_UPLOADS)) {
  fs.mkdirSync(TEMP_UPLOADS, { recursive: true });
}

/**
 * Sanitize filename: remove dangerous characters, normalize Unicode
 */
export function sanitizeFileName(name: string): string {
  return name
    .normalize('NFC')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid filesystem chars
    .replace(/[. ]+$/g, '')               // Trim trailing dots/spaces
    .replace(/\s+/g, '_')                 // Collapse spaces to underscore
    || 'file';                            // Fallback if empty
}

/**
 * Sanitize folder names (UPIN, sub_city)
 */
export function sanitizeFolderName(name: string): string {
  return name
    .normalize('NFC')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/[. ]+$/g, '')
    .replace(/\s+/g, '_')
    || 'unknown';
}

/**
 * Map document_type to folder structure
 */
export function resolveFolderSegments(documentTypeRaw: string): string[] {
  switch (documentTypeRaw) {
    case 'SITE_MAP':
      return ['site_map'];
    case 'OWNER_ID_COPY':
      return ['owner', 'id_copy'];
    case 'LEASE_CONTRACT':
      return ['lease', 'contract'];
    default:
      return ['other'];
  }
}

// Multer configuration: save to temp folder first
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOADS);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext);
    const safeBase = sanitizeFileName(base);
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);

    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images, PDF, Office docs'));
    }
  },
});

// Export the middleware
export const uploadDocument = upload.single('document');