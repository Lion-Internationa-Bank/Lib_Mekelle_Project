// src/config/uploadPaths.ts
import path from 'path';
import fs from 'fs';

// Get upload directory from environment variable, default to 'uploads' in current working directory
export const UPLOADS_BASE_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

// Define all subdirectories
export const UPLOAD_PATHS = {
  // Base directories
  BASE: UPLOADS_BASE_DIR,
  TEMP: path.join(UPLOADS_BASE_DIR, 'temp'),
  APPROVED: path.join(UPLOADS_BASE_DIR, 'approved'),
  
  // Specific temp subdirectories
  TEMP_WIZARD: path.join(UPLOADS_BASE_DIR, 'temp', 'wizard-docs'),
  TEMP_APPROVAL: path.join(UPLOADS_BASE_DIR, 'temp', 'approval-docs'),
  TEMP_UPLOADS: path.join(UPLOADS_BASE_DIR, 'temp', 'uploads'), // for multer temp files
  
  // Regular uploads (non-wizard)
  REGULAR_UPLOADS: path.join(UPLOADS_BASE_DIR, 'regular'),
  
  // Excel uploads
  EXCEL_UPLOADS: path.join(UPLOADS_BASE_DIR, 'excel'),
};

// Ensure all directories exist
export function ensureUploadDirectoriesExist() {
  Object.values(UPLOAD_PATHS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Helper to get public URL for a file
export function getPublicUrl(relativePath: string): string {
  // Ensure path starts with /uploads/
  if (relativePath.startsWith('/')) {
    return relativePath;
  }
  return `/uploads/${relativePath}`;
}

// Helper to convert public URL to filesystem path
export function publicUrlToPath(publicUrl: string): string {
  // Remove /uploads/ prefix to get relative path
  const relativePath = publicUrl.replace(/^\/uploads\//, '');
  return path.join(UPLOADS_BASE_DIR, relativePath);
}