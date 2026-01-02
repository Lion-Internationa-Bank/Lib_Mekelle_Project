// controllers/uploadController.ts
import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';
import fs from 'fs';
import path from 'path';

// ←←← ADD THESE IMPORTS ←←←
import {
  sanitizeFolderName,
  resolveFolderSegments,
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
    } = req.body;

    if (!file || !document_type || !upin) {
      if (file) fs.unlinkSync(file.path); // cleanup temp file
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const safeUpin = sanitizeFolderName(upin);
    const safeSubCity = sanitizeFolderName(sub_city || 'unknown');
    const segments = resolveFolderSegments(document_type);

    const finalDir = path.join(UPLOADS_BASE, safeSubCity, safeUpin, ...segments);
    const finalPath = path.join(finalDir, file.filename);

    fs.mkdirSync(finalDir, { recursive: true });
    fs.renameSync(file.path, finalPath); // Move from temp to final location

    const relativePath = finalPath
      .replace(UPLOADS_BASE, '')
      .replace(/\\/g, '/')
      .replace(/^\/+/, '');

    let docTypeEnum: any = 'MAP';
    if (document_type === 'SITE_MAP') docTypeEnum = 'MAP';
    if (document_type === 'OWNER_ID_COPY') docTypeEnum = 'ID_COPY';
    if (document_type === 'LEASE_CONTRACT') docTypeEnum = 'LEASE_CONTRACT';

    const document = await prisma.documents.create({
      data: {
        upin,
        owner_id: owner_id || null,
        lease_id: lease_id || null,
        doc_type: docTypeEnum,
        file_url: `/uploads/${relativePath}`,
        file_name: file.originalname,
      },
    });

    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) fs.unlinkSync(req.file.path); // cleanup
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
};