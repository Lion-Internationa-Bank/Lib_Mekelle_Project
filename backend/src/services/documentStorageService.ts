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
  private tempDir: string;
  
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'wizard_docs');
    
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
    const publicUrl = `/temp/wizard-docs/${sessionId}/${step}/${fileName}`;

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

  async moveToPermanent(sessionId: string, step: string, fileName: string, permanentPath: string): Promise<void> {
    const tempPath = path.join(this.tempDir, sessionId, step, fileName);
    const permanentDir = path.dirname(permanentPath);
    
    // Ensure permanent directory exists
    if (!fs.existsSync(permanentDir)) {
      fs.mkdirSync(permanentDir, { recursive: true });
    }

    // Move file
    await fs.promises.rename(tempPath, permanentPath);

    // Clean up empty directories
    await this.cleanupEmptyDirectories(path.join(this.tempDir, sessionId));
  }

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
    }
  }

  private async cleanupEmptyDirectories(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) return;
    
    const items = await fs.promises.readdir(dirPath);
    if (items.length === 0) {
      await fs.promises.rmdir(dirPath);
      
      // Check parent directory
      const parentDir = path.dirname(dirPath);
      if (parentDir !== this.tempDir) {
        await this.cleanupEmptyDirectories(parentDir);
      }
    }
  }
}