// src/controllers/billController.ts
import type { Request, Response } from 'express';
// import { BillService } from '../services/billService.ts';
import { BillService } from '../services/reportService.ts';
import prisma from '../config/prisma.ts';

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

const billService = new BillService();

/**
 * Validate and parse status parameter
 */
function validateStatus(status?: string): 'PAID' | 'UNPAID' | 'OVERDUE' | undefined {
  if (!status) return undefined;
  
  const upperStatus = status.toUpperCase();
  if (upperStatus === 'PAID' || upperStatus === 'UNPAID' || upperStatus === 'OVERDUE') {
    return upperStatus;
  }
  
  throw new Error(`Invalid status value: ${status}. Must be PAID, UNPAID, or OVERDUE`);
}

export class BillController {
  static async downloadBills(req: BillRequest, res: Response): Promise<void> {
    try {
      // Extract and validate filters from query
      const filters: BillQueryFilters = {
        subcityId: req.query.subcityId,
        status: validateStatus(req.query.status),
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
      const bills = await billService.getFilteredBills(filters);
      
      if (bills.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No bills found matching the criteria',
          filters: filters
        });
        return;
      }
      
      // Generate Excel file with filters
      const excelBuffer = await billService.generateExcel(bills, filters);
      
      // Generate filename with timestamp and filters
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let filename = `bills_${timestamp}`;
      
      if (filters.subcityId) {
        // Get subcity name for filename if possible
        const subcity = await prisma?.sub_cities?.findUnique({
          where: { sub_city_id: filters.subcityId }
        });
        const subcityDisplay = subcity?.name || filters.subcityId.slice(0,8);
        filename += `_subcity-${subcityDisplay.replace(/\s+/g, '_')}`;
      }
      
      if (filters.status) filename += `_${filters.status.toLowerCase()}`;
      if (filters.fromDate) filename += `_from-${filters.fromDate.split('T')[0]}`;
      if (filters.toDate) filename += `_to-${filters.toDate.split('T')[0]}`;
      
      filename += '.xlsx';
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', excelBuffer.length);
      
      // Send file
      res.send(excelBuffer);
      
    } catch (error) {
      console.error('Error generating bills report:', error);
      
      if (error instanceof Error && error.message.includes('Invalid status value')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate bills report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}