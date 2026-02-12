// src/services/documentStorageService.ts
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export interface StoredDocument {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  metadata?: any;
}

export class DocumentStorageService {
  private uploadsDir: string;
  private tempDir: string;
  
  constructor() {
    // Store everything under uploads directory
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.tempDir = path.join(this.uploadsDir, 'temp', 'wizard-docs');
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    
    console.log('Document storage initialized at:', this.tempDir);
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
    // Format: /uploads/temp/wizard-docs/{sessionId}/{step}/{fileName}
    const publicUrl = `/uploads/temp/wizard-docs/${sessionId}/${step}/${fileName}`;

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

  async moveToPermanent(
    sessionId: string, 
    step: string, 
    fileName: string, 
    entityType: string,
    entityId: string
  ): Promise<{ filePath: string; publicUrl: string }> {
    const tempPath = path.join(this.tempDir, sessionId, step, fileName);
    
    // Generate permanent path under uploads/approved/{entityType}/{entityId}/
    const fileId = path.parse(fileName).name;
    const fileExtension = path.extname(fileName);
    const permanentFileName = `${fileId}${fileExtension}`;
    const permanentDir = path.join(this.uploadsDir, 'approved', entityType, entityId);
    const permanentPath = path.join(permanentDir, permanentFileName);
    
    // Public URL for permanent file
    const publicUrl = `/uploads/approved/${entityType}/${entityId}/${permanentFileName}`;
    
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

  // async moveAllToPermanent(
  //   sessionId: string,
  //   entityType: string,
  //   entityId: string
  // ): Promise<Array<{ step: string; originalUrl: string; newUrl: string }>> {
  //   const movedFiles = [];
  //   const sessionPath = path.join(this.tempDir, sessionId);
    
  //   if (!fs.existsSync(sessionPath)) {
  //     return movedFiles;
  //   }

  //   const steps = await fs.promises.readdir(sessionPath);
    
  //   for (const step of steps) {
  //     const stepPath = path.join(sessionPath, step);
  //     const files = await fs.promises.readdir(stepPath);
      
  //     for (const fileName of files) {
  //       const filePath = path.join(stepPath, fileName);
  //       const stat = await fs.promises.stat(filePath);
        
  //       if (stat.isFile()) {
  //         // Generate permanent path
  //         const fileId = path.parse(fileName).name;
  //         const fileExtension = path.extname(fileName);
  //         const permanentFileName = `${fileId}${fileExtension}`;
  //         const permanentDir = path.join(this.uploadsDir, 'approved', entityType, entityId, step);
  //         const permanentPath = path.join(permanentDir, permanentFileName);
          
  //         // Public URL
  //         const publicUrl = `/uploads/approved/${entityType}/${entityId}/${step}/${permanentFileName}`;
  //         const originalUrl = `/uploads/temp/wizard-docs/${sessionId}/${step}/${fileName}`;
          
  //         // Ensure permanent directory exists
  //         if (!fs.existsSync(permanentDir)) {
  //           fs.mkdirSync(permanentDir, { recursive: true });
  //         }
          
  //         // Move file
  //         await fs.promises.copyFile(filePath, permanentPath);
  //         await fs.promises.unlink(filePath);
          
  //         movedFiles.push({
  //           step,
  //           originalUrl,
  //           newUrl: publicUrl
  //         });
  //       }
  //     }
  //   }

  //   // Clean up session directory
  //   await this.cleanupSession(sessionId);

  //   return movedFiles;
  // }

  async deleteTemporary(sessionId: string, step: string, fileName: string): Promise<void> {
    const filePath = path.join(this.tempDir, sessionId, step, fileName);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      
      // Clean up empty directories
      await this.cleanupEmptyDirectories(path.join(this.tempDir, sessionId));
    }
  }

  async cleanupSession(sessionId: string): Promise<void> {
    const sessionPath = path.join(this.tempDir, sessionId);
    
    if (fs.existsSync(sessionPath)) {
      await fs.promises.rm(sessionPath, { recursive: true, force: true });
      console.log('Cleaned up session directory:', sessionPath);
    }
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
    }
  }

  // Helper method to get file size and info
  async getFileInfo(fileUrl: string): Promise<{ exists: boolean; path?: string; size?: number }> {
    try {
      // Remove /uploads prefix to get relative path
      const relativePath = fileUrl.replace(/^\/uploads\//, '');
      const filePath = path.join(this.uploadsDir, relativePath);
      
      if (fs.existsSync(filePath)) {
        const stat = await fs.promises.stat(filePath);
        return {
          exists: true,
          path: filePath,
          size: stat.size
        };
      }
    } catch (error) {
      console.error('Error getting file info:', error);
    }
    
    return { exists: false };
  }

  // Get storage statistics
  async getStorageStats(): Promise<{ tempSize: number; totalFiles: number }> {
    let tempSize = 0;
    let totalFiles = 0;
    
    const calculateSize = async (dirPath: string) => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = await fs.promises.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.promises.stat(itemPath);
        
        if (stat.isFile()) {
          tempSize += stat.size;
          totalFiles++;
        } else if (stat.isDirectory()) {
          await calculateSize(itemPath);
        }
      }
    };
    
    await calculateSize(this.tempDir);
    
    return { tempSize, totalFiles };
  }
}

// Export singleton instance
export const documentStorage = new DocumentStorageService();