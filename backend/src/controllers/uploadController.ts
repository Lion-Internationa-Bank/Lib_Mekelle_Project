// src/controllers/uploadController.ts
import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';
import fs from 'fs';
import path from 'path';
import {
  sanitizeFolderName,
  resolveDocumentConfig,
  UPLOADS_BASE,
} from '../middlewares/upload.ts';

export const handleUpload = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const {
      document_type,
      upin,
      sub_city,
      owner_id,
      lease_id,
      history_id,
      encumbrance_id,
    } = req.body;

    // Validation
    if (!file || !document_type || !upin) {
      if (file) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: file, document_type, or upin',
      });
    }

    const safeUpin = sanitizeFolderName(upin.trim());
    const safeSubCity = sanitizeFolderName((sub_city || 'unknown').trim());

    // Get config from middleware (returns plain string for enum)
    const { folders, prismaEnum: docTypeString } = resolveDocumentConfig(document_type);

    // Build final path
    const finalDir = path.join(UPLOADS_BASE, safeSubCity, safeUpin, ...folders);
    const finalPath = path.join(finalDir, file.filename);

    // Move file from temp to final location
    fs.mkdirSync(finalDir, { recursive: true });
    fs.renameSync(file.path, finalPath);

    const relativeUrl = path.relative(UPLOADS_BASE, finalPath).replace(/\\/g, '/');

    // Create document in DB
    // Type assertion: safe because strings in middleware exactly match Prisma enum values
    const document = await prisma.documents.create({
      data: {
        upin: safeUpin,
 
        doc_type: docTypeString as any, // ← Safe cast — avoids import
        file_url: `/uploads/${relativeUrl}`,
        file_name: file.originalname,
        is_verified: false,
        upload_date: new Date(),

        owner_id: owner_id || null,
        lease_id: lease_id || null,
        history_id: history_id || null,
        encumbrance_id: encumbrance_id || null,
      },
    });

    return res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error: any) {
    console.error('Upload error:', error);

    // Cleanup temp file
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document',
    });
  }
};