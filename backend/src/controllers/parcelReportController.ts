import type { Request, Response } from 'express';
import { ParcelService } from '../services/parcelReportService.ts';
import { 
type  GetEncumbrancesQuery,
 type GetLandParcelsQuery,
 type GetOwnersWithMultipleParcelsQuery,
 type GetLeaseAnnualInstallmentRange
} from '../validation/parcelReportSchemas.ts';
import {  type AuthRequest } from '../middlewares/authMiddleware.ts';
// Interface for query filters
interface BillQueryFilters {
  subcityId?: string;
  status?: 'PAID' | 'UNPAID' | 'OVERDUE';
  fromDate?: string;
  toDate?: string;
}

// Interface for the complete query object
interface BillRequestQuery {
  subcityId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: string | undefined;
}

// Extend Express Request with our query type
interface BillRequest extends Request {
  query: BillRequestQuery;
}

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


  static async getFilteredBills(req: BillRequest, res: Response): Promise<void> {
  try {
    // Extract and validate filters from query
    const filters: BillQueryFilters = {
      subcityId: req.query.subcityId,
      status: ParcelController.validateStatus(req.query.status),
      fromDate: req.query.fromDate,
      toDate: req.query.toDate
    };
    
    // Validate date range if both provided
    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      
      if (from > to) {
        res.status(400).json({
          success: false,
          message: 'fromDate cannot be greater than toDate'
        });
        return;
      }
    }
    
    // Get filtered bills
    const bills = await ParcelService.getFilteredBills(filters);
    
    // Return the data with success response
    res.status(200).json({
      success: true,
      data: bills,
      filters: filters,
      count: bills.length,
      message: bills.length > 0 
        ? 'Bills retrieved successfully' 
        : 'No bills found matching the criteria'
    });
    
  } catch (error) {
    console.error('Error fetching bills:', error);
    
    if (error instanceof Error && error.message.includes('Invalid status value')) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: error instanceof Error ? error.message : 'Unknown error'
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

  static async getOwnersWithMultipleParcels(req:AuthRequest, res: Response) {
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

static validateStatus(status?: string): 'PAID' | 'UNPAID' | 'OVERDUE' | undefined {
  if (!status) return undefined;
  
  const upperStatus = status.toUpperCase();
  if (upperStatus === 'PAID' || upperStatus === 'UNPAID' || upperStatus === 'OVERDUE') {
    return upperStatus;
  }
  
  throw new Error(`Invalid status value: ${status}. Must be PAID, UNPAID, or OVERDUE`);
};
}