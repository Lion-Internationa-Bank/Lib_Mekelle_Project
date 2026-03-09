// src/services/documentStorageService.ts
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { 
  UPLOAD_PATHS, 
  getPublicUrl, 
  publicUrlToPath,
  ensureUploadDirectoriesExist 
} from '../config/uploadPaths.js';

// Ensure directories exist when module loads
ensureUploadDirectoriesExist();

export interface StoredDocument {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  metadata?: any;
}

  interface SessionFile {
  step: string;
  fileName: string;
  fileUrl: string;
  size: number;
}

  interface MovedFile {
  step: string;
  originalUrl: string;
  newUrl: string;
  fileName: string;
}

export class DocumentStorageService {
  private uploadsDir: string;
  private tempDir: string;
  private approvedDir: string;
  
  constructor() {
    // Use centralized paths
    this.uploadsDir = UPLOAD_PATHS.BASE;
    this.tempDir = UPLOAD_PATHS.TEMP_WIZARD;
    this.approvedDir = UPLOAD_PATHS.APPROVED;
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async storeTemporary(
    file: Express.Multer.File,
    sessionId: string,
    step: string,
    documentType: string,
    metadata?: any
  ): Promise<StoredDocument> {
    const fileId = randomBytes(16).toString('hex');
    const sessionDir = path.join(this.tempDir, sessionId, step);
    
    // Ensure session directory exists
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${fileId}${fileExtension}`;
    const filePath = path.join(sessionDir, fileName);
    
    // Public URL that matches the express static route
    const publicUrl = getPublicUrl(`temp/wizard-docs/${sessionId}/${step}/${fileName}`);

    // Save file
    await fs.promises.writeFile(filePath, file.buffer);

    return {
      id: fileId,
      file_url: publicUrl,
      file_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype,
      document_type: documentType,
      metadata
    };
  }

  async getTemporaryFile(sessionId: string, step: string, fileName: string): Promise<string> {
    const filePath = path.join(this.tempDir, sessionId, step, fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    return filePath;
  }

  async getTemporaryFileBuffer(sessionId: string, step: string, fileName: string): Promise<Buffer> {
    const filePath = await this.getTemporaryFile(sessionId, step, fileName);
    return await fs.promises.readFile(filePath);
  }

  async moveToPermanent(
    sessionId: string, 
    step: string, 
    fileName: string, 
    entityType: string,
    entityId: string
  ): Promise<{ filePath: string; publicUrl: string }> {
    const tempPath = path.join(this.tempDir, sessionId, step, fileName);
    
    if (!fs.existsSync(tempPath)) {
      throw new Error(`Temporary file not found: ${tempPath}`);
    }
    
    // Generate permanent path
    const fileId = path.parse(fileName).name;
    const fileExtension = path.extname(fileName);
    const permanentFileName = `${fileId}${fileExtension}`;
    const permanentDir = path.join(this.approvedDir, entityType, entityId);
    const permanentPath = path.join(permanentDir, permanentFileName);
    
    // Public URL for permanent file
    const publicUrl = getPublicUrl(`approved/${entityType}/${entityId}/${permanentFileName}`);
    
    // Ensure permanent directory exists
    if (!fs.existsSync(permanentDir)) {
      fs.mkdirSync(permanentDir, { recursive: true });
    }

    // Move file - copy first for safety, then delete temp
    await fs.promises.copyFile(tempPath, permanentPath);
    await fs.promises.unlink(tempPath);

    // Clean up empty directories
    await this.cleanupEmptyDirectories(path.join(this.tempDir, sessionId));

    return {
      filePath: permanentPath,
      publicUrl
    };
  }



async moveAllToPermanent(
  sessionId: string,
  entityType: string,
  entityId: string
): Promise<MovedFile[]> {
  const movedFiles: MovedFile[] = [];
  const sessionPath = path.join(this.tempDir, sessionId);
  
  if (!fs.existsSync(sessionPath)) {
    return movedFiles;
  }

  const steps = await fs.promises.readdir(sessionPath);
  
  for (const step of steps) {
    const stepPath = path.join(sessionPath, step);
    const stat = await fs.promises.stat(stepPath);
    
    if (!stat.isDirectory()) continue;
    
    const files = await fs.promises.readdir(stepPath);
    
    for (const fileName of files) {
      const filePath = path.join(stepPath, fileName);
      const fileStat = await fs.promises.stat(filePath);
      
      if (fileStat.isFile()) {
        try {
          // Generate permanent path
          const fileId = path.parse(fileName).name;
          const fileExtension = path.extname(fileName);
          const permanentFileName = `${fileId}${fileExtension}`;
          const permanentDir = path.join(this.approvedDir, entityType, entityId, step);
          const permanentPath = path.join(permanentDir, permanentFileName);
          
          // Public URL
          const publicUrl = getPublicUrl(`approved/${entityType}/${entityId}/${step}/${permanentFileName}`);
          const originalUrl = getPublicUrl(`temp/wizard-docs/${sessionId}/${step}/${fileName}`);
          
          // Ensure permanent directory exists
          if (!fs.existsSync(permanentDir)) {
            fs.mkdirSync(permanentDir, { recursive: true });
          }
          
          // Move file
          await fs.promises.copyFile(filePath, permanentPath);
          await fs.promises.unlink(filePath);
          
          movedFiles.push({
            step,
            originalUrl,
            newUrl: publicUrl,
            fileName: permanentFileName
          });
        } catch (error) {
          console.error(`Error moving file ${fileName} from step ${step}:`, error);
          throw error;
        }
      }
    }
  }

  // Clean up session directory
  await this.cleanupSession(sessionId);

  return movedFiles;
}

  async deleteTemporary(sessionId: string, step: string, fileName: string): Promise<void> {
    const filePath = path.join(this.tempDir, sessionId, step, fileName);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      
      // Clean up empty directories
      await this.cleanupEmptyDirectories(path.join(this.tempDir, sessionId));
    }
  }

  async deleteAllTemporary(sessionId: string): Promise<void> {
    const sessionPath = path.join(this.tempDir, sessionId);
    
    if (fs.existsSync(sessionPath)) {
      try {
        await fs.promises.rm(sessionPath, { recursive: true, force: true });
        console.log('Deleted all temporary documents for session:', sessionId);
      } catch (error) {
        console.error(`Error deleting temporary documents for session ${sessionId}:`, error);
      }
    }
  }

  async cleanupSession(sessionId: string): Promise<void> {
    const sessionPath = path.join(this.tempDir, sessionId);
    
    if (fs.existsSync(sessionPath)) {
      try {
        await fs.promises.rm(sessionPath, { recursive: true, force: true });
        console.log('Cleaned up session directory:', sessionPath);
      } catch (error) {
        console.error(`Error cleaning up session ${sessionId}:`, error);
      }
    }
  }

  async cleanupOldSessions(maxAgeHours: number = 24): Promise<void> {
    try {
      if (!fs.existsSync(this.tempDir)) return;
      
      const sessions = await fs.promises.readdir(this.tempDir);
      const now = Date.now();
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      
      for (const sessionId of sessions) {
        const sessionPath = path.join(this.tempDir, sessionId);
        const stat = await fs.promises.stat(sessionPath);
        
        if (stat.isDirectory() && (now - stat.mtimeMs) > maxAgeMs) {
          await fs.promises.rm(sessionPath, { recursive: true, force: true });
          console.log(`Cleaned up old session: ${sessionId}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    const sessionPath = path.join(this.tempDir, sessionId);
    return fs.existsSync(sessionPath);
  }



async listSessionFiles(sessionId: string): Promise<SessionFile[]> {
  const files: SessionFile[] = [];
  const sessionPath = path.join(this.tempDir, sessionId);
  
  if (!fs.existsSync(sessionPath)) {
    return files;
  }

  const steps = await fs.promises.readdir(sessionPath);
  
  for (const step of steps) {
    const stepPath = path.join(sessionPath, step);
    const stepStat = await fs.promises.stat(stepPath);
    
    if (!stepStat.isDirectory()) continue;
    
    const stepFiles = await fs.promises.readdir(stepPath);
    
    for (const fileName of stepFiles) {
      const filePath = path.join(stepPath, fileName);
      const fileStat = await fs.promises.stat(filePath);
      
      if (fileStat.isFile()) {
        files.push({
          step,
          fileName,
          fileUrl: getPublicUrl(`temp/wizard-docs/${sessionId}/${step}/${fileName}`),
          size: fileStat.size
        });
      }
    }
  }
  
  return files;
}

  private async cleanupEmptyDirectories(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) return;
    
    const items = await fs.promises.readdir(dirPath);
    
    if (items.length === 0) {
      await fs.promises.rmdir(dirPath);
      console.log('Removed empty directory:', dirPath);
      
      // Check parent directory
      const parentDir = path.dirname(dirPath);
      if (parentDir !== this.tempDir && parentDir !== this.uploadsDir) {
        await this.cleanupEmptyDirectories(parentDir);
      }
    } else {
      // Check subdirectories
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.promises.stat(itemPath);
        
        if (stat.isDirectory()) {
          await this.cleanupEmptyDirectories(itemPath);
        }
      }
    }
  }

  // Helper method to get file size and info
  async getFileInfo(fileUrl: string): Promise<{ exists: boolean; path?: string; size?: number; mimeType?: string }> {
    try {
      const filePath = publicUrlToPath(fileUrl);
      
      if (fs.existsSync(filePath)) {
        const stat = await fs.promises.stat(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        return {
          exists: true,
          path: filePath,
          size: stat.size,
          mimeType: this.getMimeType(ext)
        };
      }
    } catch (error) {
      console.error('Error getting file info:', error);
    }
    
    return { exists: false };
  }

  // Get storage statistics
  async getStorageStats(): Promise<{ tempSize: number; tempFiles: number; approvedSize: number; approvedFiles: number }> {
    let tempSize = 0;
    let tempFiles = 0;
    let approvedSize = 0;
    let approvedFiles = 0;
    
    const calculateDirStats = async (dirPath: string): Promise<{ size: number; files: number }> => {
      let size = 0;
      let files = 0;
      
      if (!fs.existsSync(dirPath)) return { size, files };
      
      const items = await fs.promises.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.promises.stat(itemPath);
        
        if (stat.isFile()) {
          size += stat.size;
          files++;
        } else if (stat.isDirectory()) {
          const subStats = await calculateDirStats(itemPath);
          size += subStats.size;
          files += subStats.files;
        }
      }
      
      return { size, files };
    };
    
    const tempStats = await calculateDirStats(this.tempDir);
    tempSize = tempStats.size;
    tempFiles = tempStats.files;
    
    const approvedStats = await calculateDirStats(this.approvedDir);
    approvedSize = approvedStats.size;
    approvedFiles = approvedStats.files;
    
    return { 
      tempSize, 
      tempFiles, 
      approvedSize, 
      approvedFiles 
    };
  }

  private getMimeType(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.zip': 'application/zip'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// Export singleton instance
export const documentStorage = new DocumentStorageService();