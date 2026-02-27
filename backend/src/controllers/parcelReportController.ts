import type { Request, Response } from 'express';
import { ParcelService } from '../services/parcelReportService.ts';
import { 
type  GetEncumbrancesQuery,
 type GetLandParcelsQuery,
 type GetOwnersWithMultipleParcelsQuery,
 type GetLeaseAnnualInstallmentRange
} from '../validation/parcelReportSchemas.ts';
import {  type AuthRequest } from '../middlewares/authMiddleware.ts';

export class ParcelController {
  static async getEncumbrances(req:  Request, res: Response) {
    try {
      const query:GetEncumbrancesQuery = req.query;
      const result = await ParcelService.getEncumbrances(query);
      
      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve encumbrances'
      });
    }
  }

  static async getLandParcels(req: Request, res: Response) {
    try {
      const query: GetLandParcelsQuery = req.query;
      const user = (req as any).user; // Assuming user is attached by auth middleware
      
      const result = await ParcelService.getLandParcels(query, user);
      
      res.status(200).json({
        success: true,
        data: result.data,
  
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve land parcels'
      });
    }
  }

  static async getOwnersWithMultipleParcels(req: Request, res: Response) {
    try {
      const query: GetOwnersWithMultipleParcelsQuery = req.query;
      const user = (req as any).user;
      
      const result = await ParcelService.getOwnersWithMultipleParcels(query, user);
      
      res.status(200).json({
        success: true,
        data: result.data,
      
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve owners with multiple parcels'
      });
    }
  }

// src/controllers/parcelController.ts
static async getLeaseAnnualInstallmentRange(req: Request, res: Response) {
  try {
    const query: GetLeaseAnnualInstallmentRange = req.query;
    const user = (req as any).user;
    
    // Validate that min <= max
    console.log("min",query.min, "max",query.max)
    if (Number(query.min) > Number(query.max)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum value cannot be greater than maximum value'
      });
    }
    
    const result = await ParcelService.getLeaseAnnualInstallmentRange(query, user);
    
    res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
      range: result.range,
      message: `Found ${result.count} parcels with annual installment between ${query.min} and ${query.max}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve parcels by lease installment range'
    });
  }
}
}