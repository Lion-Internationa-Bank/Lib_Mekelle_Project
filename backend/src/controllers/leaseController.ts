// src/controllers/leaseController.ts - Updated for Maker-Checker System
import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';
import { AuditAction } from '../generated/prisma/enums.ts';
import { MakerCheckerService } from '../services/makerCheckerService.ts';
import { AuditService } from '../services/auditService.ts';
import { type AuthRequest } from '../middlewares/authMiddleware.ts';


// Initialize services
const auditService = new AuditService();
const makerCheckerService = new MakerCheckerService(auditService);

// ---- CREATE LEASE ----

export const createLease = async (req: Request, res: Response) => {
  const {
    upin,
    total_lease_amount,
    contract_date,
    down_payment_amount,
    lease_period_years,
    legal_framework,
    payment_term_years,
    price_per_m2,
    start_date,
    other_payment,
  } = req.body;

  const actor = (req as any).user;

  try {
    // 1. Check if land parcel exists
    const landParcel = await prisma.land_parcels.findUnique({
      where: { upin, is_deleted: false },
    });

    if (!landParcel) {
      return res.status(404).json({
        success: false,
        message: "Land parcel not found",
      });
    }

    if (landParcel.tenure_type !== "LEASE") {
      return res.status(403).json({
        success: false,
        message: "Land Tenure Type Must Be LEASE to Register Lease Agreement"
      });
    }

    // 2. Check if lease already exists for this parcel
    const existingLease = await prisma.lease_agreements.findFirst({
      where: {
        upin,
        is_deleted: false,
        status: 'ACTIVE'
      }
    });

    if (existingLease) {
      return res.status(409).json({
        success: false,
        message: "Active lease already exists for this land parcel"
      });
    }

    // 3. Calculate expiry date for validation
    const startDate = new Date(start_date);
    const expiryDate = new Date(startDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + lease_period_years);

    // 4. Calculate principal for validation
    const totalLeaseAmountNum = Number(total_lease_amount ?? 0);
    const downPaymentNum = Number(down_payment_amount ?? 0);
    const otherPaymentNum = Number(other_payment ?? 0);
    const principal = totalLeaseAmountNum - (downPaymentNum + otherPaymentNum);

    if (principal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Down payment plus Other payment must be less than total lease amount",
      });
    }

    // 5. Create approval request instead of executing immediately
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'LEASE_AGREEMENTS',
      entityId: 'NEW', // Will be generated after approval
      actionType: 'CREATE',
      requestData: {
        upin,
        total_lease_amount,
        contract_date,
        down_payment_amount,
        other_payment,
        lease_period_years,
        legal_framework,
        payment_term_years,
        price_per_m2,
        start_date,
        expiry_date: expiryDate,
        principal, // Include for validation
        annual_installment: payment_term_years > 0 ? principal / payment_term_years : 0
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id,
      comments: req.body.comments || `Request to create lease agreement for parcel ${upin}`
    });

    // 6. Create initial audit log for request creation
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.CREATE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest.request_id,
        changes: {
          action: 'create_lease_request',
          upin,
          total_lease_amount,
          down_payment_amount,
          other_payment,
          lease_period_years,
          payment_term_years,
          start_date: startDate,
          expiry_date: expiryDate,
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          actor_username: actor.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Lease creation request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        parcel_upin: upin,
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        estimated_processing: 'Within 24-48 hours'
      }
    });
  } catch (error: any) {
    console.error("Create lease request error:", error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A pending approval request already exists for this lease"
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Invalid land parcel reference"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to create lease approval request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ---- UPDATE LEASE ----

export const updateLease = async (
  req: AuthRequest,
  res: Response
) => {
  const  lease_id  = req.params.lease_id as string;

  const data = req.body;
  const actor = (req as any).user;

  try {
    console.log("Lease update request started");

    // 1. Get existing lease for validation
    const existingLease = await prisma.lease_agreements.findUnique({
      where: { lease_id, is_deleted: false },
      include: {
        land_parcel: {
          select: {
            upin: true,
            tenure_type: true
          }
        }
      }
    });

    if (!existingLease) {
      return res.status(404).json({
        success: false,
        message: "Lease agreement not found",
      });
    }

    // 2. Validate allowed updates
    const allowedUpdates = {
      annual_lease_fee: true,
      total_lease_amount: true,
      down_payment_amount: true,
      other_payment: true,
      annual_installment: true,
      price_per_m2: true,
      lease_period_years: true,
      payment_term_years: true,
      legal_framework: true,
      start_date: true,
      expiry_date: true,
      contract_date: true,
    } as const;

    const updates: any = {};
    const changesForAudit: any = {};

    // Process and validate update fields
    Object.keys(data).forEach((key) => {
      if (allowedUpdates[key as keyof typeof allowedUpdates]) {
        let value = data[key];

        // Validate date fields
        if (["start_date", "expiry_date", "contract_date"].includes(key)) {
          if (typeof value === "string") {
            const parsedDate = new Date(value);
            if (isNaN(parsedDate.getTime())) {
              throw new Error(`Invalid date format for ${key}: ${value}`);
            }
            value = parsedDate;
          }
        }

        // Validate numeric fields
        if (
          [
            "annual_lease_fee",
            "total_lease_amount",
            "down_payment_amount",
            "other_payment",
            "annual_installment",
            "price_per_m2",
            "lease_period_years",
            "payment_term_years",
          ].includes(key) &&
          typeof value === "string"
        ) {
          const num = parseFloat(value);
          if (isNaN(num)) {
            throw new Error(`Invalid number for ${key}: ${value}`);
          }
          value = num;
        }

        updates[key] = value;
        
        // Track changes for audit
        const existingValue = existingLease[key as keyof typeof existingLease];
        if (JSON.stringify(existingValue) !== JSON.stringify(value)) {
          changesForAudit[key] = {
            from: existingValue,
            to: value
          };
        }
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // 3. Validate financial calculations if relevant fields are being updated
    const totalLeaseAmount = updates.total_lease_amount ?? existingLease.total_lease_amount;
    const downPaymentAmount = updates.down_payment_amount ?? existingLease.down_payment_amount;
    const otherPaymentAmount = updates.other_payment ?? existingLease.other_payment;
    const paymentTermYears = updates.payment_term_years ?? existingLease.payment_term_years;

    const principal = Number(totalLeaseAmount) - (Number(downPaymentAmount) + Number(otherPaymentAmount));
    if (principal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Down payment plus Other payment must be less than total lease amount",
      });
    }

    // 4. Create approval request
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'LEASE_AGREEMENTS',
      entityId: lease_id,
      actionType: 'UPDATE',
      requestData: {
        changes: updates,
        original_lease: {
          upin: existingLease.upin,
          total_lease_amount: existingLease.total_lease_amount,
          down_payment_amount: existingLease.down_payment_amount,
          other_payment: existingLease.other_payment,
          lease_period_years: existingLease.lease_period_years,
          payment_term_years: existingLease.payment_term_years,
          start_date: existingLease.start_date,
          expiry_date: existingLease.expiry_date
        },
        calculated_values: {
          principal,
          annual_installment: paymentTermYears > 0 ? principal / paymentTermYears : 0
        }
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id,
      comments: req.body.comments || `Request to update lease agreement ${lease_id}`
    });

    // 5. Create audit log for update request
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.UPDATE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest.request_id,
        changes: {
          action: 'update_lease_request',
          lease_id,
          parcel_upin: existingLease.upin,
          changed_fields: Object.keys(changesForAudit),
          changes_detail: changesForAudit,
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          actor_username: actor.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Lease update request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        lease_id,
        parcel_upin: existingLease.upin,
        changes_requested: Object.keys(changesForAudit),
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        estimated_processing: 'Within 24-48 hours'
      }
    });
  } catch (error: any) {
    console.error("Update lease request error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Lease agreement not found",
      });
    }

    if (error.message?.includes("Invalid date") || error.message?.includes("Invalid number")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A pending approval request already exists for this lease update"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create lease update request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ---- DELETE LEASE ----

export const deleteLease = async (req: AuthRequest, res: Response) => {
  const lease_id  = req.params.lease_id as string;
  const actor = (req as any).user;

  try {
    // 1. Get current lease data for validation
    const existingLease = await prisma.lease_agreements.findUnique({
      where: { 
        lease_id,
        is_deleted: false 
      },
      include: {
        land_parcel: {
          select: {
            upin: true
          }
        }
      }
    });

    if (!existingLease) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lease not found' 
      });
    }

    // 2. Check if there are active bills (for validation purposes)
    const activeBills = await prisma.billing_records.count({
      where: {
        lease_id,
        is_deleted: false,
        payment_status: {
          in: ['UNPAID', 'OVERDUE']
        }
      }
    });

    if (activeBills > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete lease with ${activeBills} unpaid or overdue bill(s)`
      });
    }

    // 3. Create approval request
    const approvalRequest = await makerCheckerService.createApprovalRequest({
      entityType: 'LEASE_AGREEMENTS',
      entityId: lease_id,
      actionType: 'DELETE',
      requestData: {
        reason: req.body.reason,
        lease_details: {
          upin: existingLease.upin,
          total_lease_amount: existingLease.total_lease_amount,
          lease_period_years: existingLease.lease_period_years,
          start_date: existingLease.start_date,
          expiry_date: existingLease.expiry_date,
          status: existingLease.status
        },
        validation: {
          active_bills: activeBills,
          can_delete: activeBills === 0
        }
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      subCityId: actor.sub_city_id,
      comments: req.body.comments || `Request to delete lease agreement ${lease_id}`
    });

    // 4. Create audit log for delete request
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.DELETE,
        entity_type: 'APPROVAL_REQUEST',
        entity_id: approvalRequest.approvalRequest.request_id,
        changes: {
          action: 'delete_lease_request',
          lease_id,
          parcel_upin: existingLease.upin,
          total_lease_amount: existingLease.total_lease_amount,
          lease_period_years: existingLease.lease_period_years,
          active_bills_at_request: activeBills,
          reason: req.body.reason,
          request_status: 'PENDING',
          approver_role: approvalRequest.approvalRequest.approver_role,
          actor_id: actor.user_id,
          actor_role: actor.role,
          actor_username: actor.username,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: (req as any).ip || req.socket.remoteAddress,
      },
    });

    return res.status(202).json({
      success: true,
      message: 'Lease deletion request submitted for approval',
      data: {
        approval_request_id: approvalRequest.approvalRequest.request_id,
        lease_id,
        parcel_upin: existingLease.upin,
        status: 'PENDING',
        approver_role: approvalRequest.approvalRequest.approver_role,
        estimated_processing: 'Within 24-48 hours',
        notes: activeBills === 0 ? 'No active bills found' : 'Requires bill resolution before deletion'
      }
    });
  } catch (error: any) {
    console.error('Delete lease request error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Lease not found' 
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A pending approval request already exists for this lease deletion"
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create lease deletion request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ---- GET LEASE DETAILS (No approval needed) ----

export const getLeaseDetails = async (req: Request<{ lease_id: string }>, res: Response) => {
  const { lease_id } = req.params;

  try {
    const lease = await prisma.lease_agreements.findUnique({
      where: { lease_id, is_deleted: false },
      include: {
        land_parcel: {
          select: {
            upin: true,
            file_number: true,
            total_area_m2: true,
            tenure_type: true,
            sub_city: {
              select: {
                name: true
              }
            }
          }
        },
        billing_records: {
          where: { is_deleted: false },
          orderBy: { due_date: 'asc' },
          select: {
            bill_id: true,
            fiscal_year: true,
            amount_due: true,
            amount_paid: true,
            payment_status: true,
            due_date: true,
            installment_number: true
          }
        },
        documents: {
          where: { is_deleted: false },
          select: {
            doc_id: true,
            file_name: true,
            doc_type: true,
            is_verified: true,
            upload_date: true
          }
        }
      }
    });

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Lease not found'
      });
    }

    return res.json({
      success: true,
      data: lease
    });
  } catch (error: any) {
    console.error('Get lease details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lease details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ---- GET LEASES BY PARCEL (No approval needed) ----

export const getLeasesByParcel = async (req: Request, res: Response) => {
  const  upin  = req.params.upin  as string;

  try {
    const leases = await prisma.lease_agreements.findMany({
      where: {
        upin,
        is_deleted: false
      },
      include: {
        billing_records: {
          where: { is_deleted: false },
          select: {
            bill_id: true,
            fiscal_year: true,
            amount_due: true,
            amount_paid: true,
            payment_status: true,
            due_date: true
          }
        }
      },
      orderBy: { start_date: 'desc' }
    });

    return res.json({
      success: true,
      data: leases
    });
  } catch (error: any) {
    console.error('Get leases by parcel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leases',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ---- GET LEASE STATUS (No approval needed) ----

export const getLeaseStatus = async (req: Request<{ lease_id: string }>, res: Response) => {
  const { lease_id } = req.params;

  try {
    const lease = await prisma.lease_agreements.findUnique({
      where: { lease_id, is_deleted: false },
      select: {
        lease_id: true,
        upin: true,
        status: true,
        total_lease_amount: true,
        down_payment_amount: true,
        other_payment: true,
        start_date: true,
        expiry_date: true,
        lease_period_years: true,
        payment_term_years: true,
        annual_installment: true,
        billing_records: {
          where: { is_deleted: false },
          select: {
            payment_status: true,
            amount_due: true,
            amount_paid: true,
            due_date: true
          }
        }
      }
    });

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Lease not found'
      });
    }

    // Calculate summary statistics
    const bills = lease.billing_records;
    const totalDue = bills.reduce((sum, bill) => sum + Number(bill.amount_due), 0);
    const totalPaid = bills.reduce((sum, bill) => sum + Number(bill.amount_paid), 0);
    const outstanding = totalDue - totalPaid;
    const paidBills = bills.filter(bill => bill.payment_status === 'PAID').length;
    const unpaidBills = bills.filter(bill => bill.payment_status === 'UNPAID').length;
    const overdueBills = bills.filter(bill => bill.payment_status === 'OVERDUE').length;

    const status = {
      ...lease,
      financial_summary: {
        total_due: totalDue,
        total_paid: totalPaid,
        outstanding: outstanding,
        payment_progress: totalDue > 0 ? (totalPaid / totalDue) * 100 : 0
      },
      bill_summary: {
        total_bills: bills.length,
        paid: paidBills,
        unpaid: unpaidBills,
        overdue: overdueBills
      }
    };

    return res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('Get lease status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lease status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};