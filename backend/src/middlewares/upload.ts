// src/middlewares/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_BASE = path.join(process.cwd(), 'uploads');
const TEMP_UPLOADS = path.join(UPLOADS_BASE, 'temp');

[UPLOADS_BASE, TEMP_UPLOADS].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export function sanitizeFileName(name: string): string {
  return (
    name
      .normalize('NFC')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/[. ]+$/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 150) || 'document'
  );
}

export function sanitizeFolderName(name: string): string {
  return (
    name
      .normalize('NFC')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/[. ]+$/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50) || 'unknown'
  );
}

/**
 * Local string union that exactly matches your Prisma DocType enum
 * Keep this list in sync with schema.prisma enum DocType
 */
type DocTypeString =
  | 'TITLE_DEED'
  | 'SITE_MAP'
  | 'SURVEY_PLAN'
  | 'ID_COPY'
  | 'POWER_OF_ATTORNEY'
  | 'LEASE_CONTRACT'
  | 'LEASE_PAYMENT_RECEIPT'
  | 'TRANSFER_CONTRACT'
  | 'TRANSFER_PAYMENT_PROOF'
  | 'TRANSFER_TAX_RECEIPT'
  | 'ANNUAL_LEASE_RECEIPT'
  | 'PROPERTY_TAX_RECEIPT'
  | 'SERVICE_FEE_RECEIPT'
  | 'MORTGAGE_AGREEMENT'
  | 'COURT_FREEZE_ORDER'
  | 'GOVT_RESERVATION_NOTICE'
  | 'VALUATION_REPORT'
  | 'VALUATION_APPEAL'
  | 'BUILDING_PERMIT'
  | 'COMPLETION_CERTIFICATE'
  | 'CORRESPONDENCE'
  | 'PHOTO'
  | 'OTHER';

type DocConfig = {
  folders: string[];
  prismaEnum: DocTypeString;
};

const DOCUMENT_TYPE_CONFIG: Partial<Record<string, DocConfig>> = {
  SITE_MAP: { folders: ['site_map'], prismaEnum: 'SITE_MAP' },
  SURVEY_PLAN: { folders: ['site_map', 'survey'], prismaEnum: 'SURVEY_PLAN' },
  OWNER_ID_COPY: { folders: ['owner', 'id_copy'], prismaEnum: 'ID_COPY' },
  POWER_OF_ATTORNEY: { folders: ['owner', 'poa'], prismaEnum: 'POWER_OF_ATTORNEY' },
  LEASE_CONTRACT: { folders: ['lease', 'contract'], prismaEnum: 'LEASE_CONTRACT' },
  LEASE_PAYMENT_RECEIPT: { folders: ['lease', 'receipts'], prismaEnum: 'LEASE_PAYMENT_RECEIPT' },
  TRANSFER_CONTRACT: { folders: ['transfer', 'contract'], prismaEnum: 'TRANSFER_CONTRACT' },
  PAYMENT_PROOF: { folders: ['transfer', 'payment'], prismaEnum: 'TRANSFER_PAYMENT_PROOF' },
  TRANSFER_TAX_RECEIPT: { folders: ['transfer', 'tax'], prismaEnum: 'TRANSFER_TAX_RECEIPT' },
  ANNUAL_LEASE_RECEIPT: { folders: ['billing', 'lease'], prismaEnum: 'ANNUAL_LEASE_RECEIPT' },
  PROPERTY_TAX_RECEIPT: { folders: ['billing', 'tax'], prismaEnum: 'PROPERTY_TAX_RECEIPT' },
  SERVICE_FEE_RECEIPT: { folders: ['billing', 'service'], prismaEnum: 'SERVICE_FEE_RECEIPT' },
  MORTGAGE_AGREEMENT: { folders: ['encumbrance', 'mortgage'], prismaEnum: 'MORTGAGE_AGREEMENT' },
  COURT_FREEZE_ORDER: { folders: ['encumbrance', 'court'], prismaEnum: 'COURT_FREEZE_ORDER' },
  GOVT_RESERVATION_NOTICE: { folders: ['encumbrance', 'govt'], prismaEnum: 'GOVT_RESERVATION_NOTICE' },
  VALUATION_REPORT: { folders: ['valuation'], prismaEnum: 'VALUATION_REPORT' },
  VALUATION_APPEAL: { folders: ['valuation', 'appeal'], prismaEnum: 'VALUATION_APPEAL' },
  BUILDING_PERMIT: { folders: ['building', 'permit'], prismaEnum: 'BUILDING_PERMIT' },
  COMPLETION_CERTIFICATE: { folders: ['building', 'completion'], prismaEnum: 'COMPLETION_CERTIFICATE' },
  CORRESPONDENCE: { folders: ['correspondence'], prismaEnum: 'CORRESPONDENCE' },
  PHOTO: { folders: ['photos'], prismaEnum: 'PHOTO' },
  OTHER: { folders: ['other'], prismaEnum: 'OTHER' },
};

/**
 * Always returns a valid DocConfig — never undefined
 */
export function resolveDocumentConfig(documentType: string): DocConfig {
  const key = documentType.toUpperCase().replace(/-/g, '_');
  const config = DOCUMENT_TYPE_CONFIG[key];
  
  // Guaranteed fallback
  if (config) return config;
  
  return DOCUMENT_TYPE_CONFIG.OTHER as DocConfig;
}

// Multer setup (unchanged)
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, TEMP_UPLOADS),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext);
    const safeBase = sanitizeFileName(base);
    const suffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    cb(null, `${safeBase}-${suffix}${ext}`);
  },
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = /\.(jpe?g|png|pdf|docx?|xlsx?|pptx?)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images, PDF, Office files'));
    }
  },
}).single('document');