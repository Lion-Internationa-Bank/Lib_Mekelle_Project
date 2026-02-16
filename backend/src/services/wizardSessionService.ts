// src/services/wizardSessionService.ts
import prisma from '../config/prisma.ts';
import { UserRole, SessionStatus, AuditAction } from '../generated/prisma/enums.ts';
import { AuditService } from './auditService.ts';
import { MakerCheckerService } from './makerCheckerService.ts';
import { ActionExecutionService } from './actionExecutionService.ts';
import {
  generateLeaseBillsInTx,
  calculateLeasePaymentDetails,
  validateLeaseForBilling,
  type LeaseWithDetails
} from '../services/leaseBillingService.ts';

export interface SaveStepParams {
  sessionId: string;
  step: string;
  data: any;
}

export interface WizardValidationResult {
  valid: boolean;
  missing: string[];
}

export interface SubmitResult {
  success: boolean;
  requiresApproval: boolean;
  immediateResult?: any;
  approvalRequestId?: string;
  message: string;
}

export class WizardSessionService {
  private prisma: typeof prisma;
  private makerChecker: MakerCheckerService;
  private auditService: AuditService;
  private actionExecutionService:ActionExecutionService

  constructor(
    makerChecker: MakerCheckerService,
    auditService: AuditService,
    actionExecutionService: ActionExecutionService
  ) {
    this.prisma = prisma;
    this.makerChecker = makerChecker;
    this.auditService = auditService;
    this.actionExecutionService = actionExecutionService;
  }

  async createSession(userId: string, subCityId: string): Promise<string> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { role: true, username: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const session = await this.prisma.wizard_sessions.create({
      data: {
        user_id: userId,
        user_role: user.role as UserRole,
        sub_city_id: subCityId,
        status: 'DRAFT',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    await this.auditService.log({
      userId,
      action: AuditAction.CREATE,
      entityType: 'WIZARD_SESSION',
      entityId: session.session_id,
      changes: {
        user_id: userId,
        username: user.username,
        sub_city_id: subCityId,
        status: 'DRAFT'
      },
      ipAddress: 'SYSTEM'
    });

    return session.session_id;
  }

  async getSession(sessionId: string) {
    return await this.prisma.wizard_sessions.findUnique({
      where: { session_id: sessionId },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
            role: true
          }
        },
        sub_city: {
          select: {
            sub_city_id: true,
            name: true
          }
        },
        approval_request: {
          include: {
            maker: {
              select: {
                user_id: true,
                username: true,
                full_name: true
              }
            }
          }
        }
      }
    });
  }

  async getUserDraftSession(userId: string) {
    return await this.prisma.wizard_sessions.findFirst({
      where: {
        user_id: userId,
        status: 'DRAFT',
        expires_at: { gt: new Date() }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async saveStep(params: SaveStepParams) {
    const session = await this.prisma.wizard_sessions.findUnique({
      where: { session_id: params.sessionId }
    });

 if (!session || (session.status !== 'DRAFT' && session.status !== 'REJECTED')) {
  throw new Error('Cannot save step: Session not found or not in draft or rejected');
}


    const updateData: any = {
      updated_at: new Date(),
      current_step: params.step
    };

    // Map step to correct field
    const stepMap: Record<string, string> = {
      'parcel': 'parcel_data',
      'parcel-docs': 'parcel_docs',
      'owner': 'owner_data',
      'owner-docs': 'owner_docs',
      'lease': 'lease_data',
      'lease-docs': 'lease_docs'
    };

    const field = stepMap[params.step];
    if (field) {
      updateData[field] = params.data;
    }

    const updated = await this.prisma.wizard_sessions.update({
      where: { session_id: params.sessionId },
      data: updateData
    });

    return updated;
  }

 async validateSession(sessionId: string): Promise<WizardValidationResult> {
  const session = await this.getSession(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const missing: string[] = [];

  // Check required steps
  if (!session.parcel_data) missing.push('Parcel Information');
  
  // Check parcel documents (at least one required)
  if (!session.parcel_docs || 
      (Array.isArray(session.parcel_docs) && session.parcel_docs.length === 0)) {
    missing.push('Parcel Documents');
  }
  
  if (!session.owner_data) missing.push('Owner Information');
  
  // Check owner documents - conditional based on whether it's an existing owner
  const ownerData = Array.isArray(session.owner_data) 
    ? session.owner_data[0] 
    : session.owner_data;
  
  const isExistingOwner = ownerData?.owner_id  ? true : false;
  
  if (!isExistingOwner) {
    // Only require owner documents for NEW owners
    if (!session.owner_docs || 
        (Array.isArray(session.owner_docs) && session.owner_docs.length === 0)) {
      missing.push('Owner Documents');
    }
  }
  // For existing owners, owner documents are NOT required

  // Check lease steps - conditional based on tenure type
  const parcelData = Array.isArray(session.parcel_data) 
    ? session.parcel_data[0] 
    : session.parcel_data;
  
  const isLeaseTenure = parcelData?.tenure_type === "LEASE" || 
                        parcelData?.tenure_type === "lease" ||
                        parcelData?.tenure_type === "Lease";
  
  if (isLeaseTenure) {
    // For LEASE tenure, lease information is required
    if (!session.lease_data) {
      missing.push('Lease Information');
    }
    
    // Check lease documents (at least one required for LEASE tenure)
    if (!session.lease_docs || 
        (Array.isArray(session.lease_docs) && session.lease_docs.length === 0)) {
      missing.push('Lease Documents');
    }
  }
  // For non-LEASE tenure, lease steps are NOT required

  return {
    valid: missing.length === 0,
    missing
  };
}

async submitForApproval(sessionId: string): Promise<SubmitResult> {
  return await this.prisma.$transaction(async (tx) => {
    const session = await tx.wizard_sessions.findUnique({
      where: { session_id: sessionId },
      include: { user: true }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'DRAFT' && session.status !== 'REJECTED') {
      throw new Error(`Session already ${session.status.toLowerCase()}`);
    }

    // Validate completeness
    const validation = await this.validateSession(sessionId);
    if (!validation.valid) {
      throw new Error(`Missing steps: ${validation.missing.join(', ')}`);
    }

    // Check if user can approve themselves (SUBCITY_ADMIN)
    const canSelfApprove = session.user_role === 'SUBCITY_ADMIN';

    if (canSelfApprove) {
      // Execute immediately using ActionExecutionService
      const executionResult = await this.actionExecutionService.executeWizard(
        tx,
        {
          session_id: sessionId,
          parcel: session.parcel_data,
          parcel_docs: session.parcel_docs as any,
          owners: Array.isArray(session.owner_data) ? session.owner_data : [session.owner_data],
          owner_docs: session.owner_docs  as any ,
          lease: session.lease_data,
          lease_docs: session.lease_docs as any ,
          sub_city_id: session.sub_city_id || '',
          user_id: session.user_id,
          user_role: session.user_role
        },
        session.user_id // Self-approval, so user is also approver
      );
      
      // Update wizard session
      await this.actionExecutionService.updateWizardSessionAfterExecution(
        tx,
        sessionId,
        session.user_id,
        true
      );

      return {
        success: true,
        requiresApproval: false,
        immediateResult: executionResult,
        message: 'Parcel registered successfully (admin self-approval)'
      };
    } else {
      // Create approval request
      const approvalResult = await this.makerChecker.createApprovalRequest({
        entityType: 'WIZARD_SESSION',
        entityId: sessionId,
        actionType: 'CREATE',
        requestData: {
          parcel: session.parcel_data,
          parcel_docs: session.parcel_docs,
          owners: Array.isArray(session.owner_data) ? session.owner_data : [session.owner_data],
          owner_docs: session.owner_docs,
          lease: session.lease_data,
          lease_docs: session.lease_docs
        },
        makerId: session.user_id,
        makerRole: session.user_role,
        subCityId: session.sub_city_id || undefined,
        comments: 'Complete parcel registration wizard'
      });

      // Link approval request to session
      await tx.wizard_sessions.update({
        where: { session_id: sessionId },
        data: {
          status: 'PENDING_APPROVAL',
          approval_request_id: approvalResult.approvalRequest?.request_id,
          submitted_at: new Date()
        }
      });

      return {
        success: true,
        requiresApproval: true,
        approvalRequestId: approvalResult.approvalRequest?.request_id,
        message: 'Submitted for approval'
      };
    }
  });
}

  async getUserSessions(userId: string) {
    console.log("user id",userId)
    return await this.prisma.wizard_sessions.findMany({
      where: {
        user_id: userId,
        OR: [
          { status: 'PENDING_APPROVAL' },
          { status: 'APPROVED' },
          { status: 'REJECTED' },
          { status: 'MERGED' },
       
        ]
      },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        approval_request: {
          include: {
            maker: {
              select: {
                user_id: true,
                username: true,
                full_name: true
              }
            }
          }
        }
      }
    });
  }

  async cleanupExpiredSessions() {
    const expired = await this.prisma.wizard_sessions.findMany({
      where: {
        status: 'DRAFT',
        expires_at: { lt: new Date() }
      }
    });

    for (const session of expired) {
      await this.prisma.$transaction(async (tx) => {
        // Delete temporary documents
        await tx.wizard_documents_temp.deleteMany({
          where: { session_id: session.session_id }
        });
        
        // Delete session
        await tx.wizard_sessions.delete({
          where: { session_id: session.session_id }
        });
      });
    }

    return expired.length;
  }
}