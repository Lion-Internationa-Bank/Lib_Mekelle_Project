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

    // Basic required fields validation
    if (!file || !document_type) {
      if (file?.path) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: file and document_type are required.',
      });
    }

    // Sanitize inputs safely
    const rawUpin = typeof upin === 'string' ? upin.trim() : '';
    const rawSubCity = typeof sub_city === 'string' ? sub_city.trim() : 'unknown';

    const safeUpin = rawUpin ? sanitizeFolderName(rawUpin) : null;
    const safeSubCity = sanitizeFolderName(rawSubCity);

    // Resolve document type config (folders + Prisma enum value)
    const config = resolveDocumentConfig(document_type);
    if (!config) {
      if (file.path) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      return res.status(400).json({
        success: false,
        message: `Invalid document_type: ${document_type}`,
      });
    }
    const { folders, prismaEnum: docTypeString } = config;

    // Build final directory and file path
    const finalDir = path.join(UPLOADS_BASE, safeSubCity, ...(safeUpin ? [safeUpin] : []), ...folders);
    const finalPath = path.join(finalDir, file.filename);

    // Ensure directory exists and move file
    fs.mkdirSync(finalDir, { recursive: true });
    fs.renameSync(file.path, finalPath);

    // Generate relative URL for DB storage
    const relativeUrl = path.relative(UPLOADS_BASE, finalPath).replace(/\\/g, '/');

    // Validate UPIN exists if provided
    let validatedUpin: string | null = null;
    if (safeUpin) {
      const parcelExists = await prisma.land_parcels.findUnique({
        where: { upin: safeUpin },
        select: { upin: true }, // Minimal select for performance
      });

      if (!parcelExists) {
        // Clean up uploaded file since UPIN is invalid
        try { fs.unlinkSync(finalPath); } catch {}
        return res.status(400).json({
          success: false,
          message: `Parcel with UPIN "${rawUpin}" does not exist. Cannot attach document to non-existent parcel.`,
        });
      }
      validatedUpin = safeUpin;
    }

    // Create document record in database
    const document = await prisma.documents.create({
      data: {
        upin: validatedUpin,
        doc_type: docTypeString as any,
        file_url: `/uploads/${relativeUrl}`,
        file_name: file.originalname,
        is_verified: false,
        upload_date: new Date(),

        // Optional foreign keys — only set if valid UUIDs are provided
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

    // Cleanup temp file if still present
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (err) {
        console.error('Failed to cleanup temp file:', err);
      }
    }

    // Handle Prisma-specific errors more gracefully
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A document with this reference already exists.',
      });
    }

    if (error.code === 'P2025') {
      return res.status(400).json({
        success: false,
        message: 'Referenced record not found (e.g., invalid owner_id, lease_id, etc.)',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document',
    });
  }
};