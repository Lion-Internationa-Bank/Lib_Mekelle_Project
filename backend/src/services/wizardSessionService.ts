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


interface PaginationOptions {
  page: number;
  limit: number;
  status?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Add interface for paginated result
interface PaginatedResult<T> {
  sessions: T[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

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

 async getUserSessions(
    userId: string, 
    options: PaginationOptions
  ): Promise<PaginatedResult<any>> {
    console.log("user id", userId);
    console.log("pagination options", options);

    const { page, limit, status, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

   
        const where: any = {
      user_id:userId,

    };

    // Add status filter if provided
    if (status) {
      if (status === 'COMPLETED') {
        // COMPLETED is a meta-status that includes APPROVED and MERGED
        where.status = {
          in: ['APPROVED', 'MERGED']
        };
      } else if (status === 'ALL') {
        // Include all statuses except maybe some exclusions
        where.status = {
          in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'MERGED']
        };
      } else {
        // Single status filter
        where.status = status as any;
      }
    } else {
      // Default: exclude nothing, but you might want to exclude something
      where.status = {
        in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'MERGED']
      };
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await this.prisma.wizard_sessions.count({ where });

    // Get paginated sessions
    const sessions = await this.prisma.wizard_sessions.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        approval_request: {
          include: {
            maker: {
              select: {
                user_id: true,
                username: true,
                full_name: true
              }
            },
           
          }
        },
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
        }
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      sessions,
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage
    };
  }

  // Delete session (only if in DRAFT or REJECTED status)
async deleteSession(sessionId: string, userId: string): Promise<{ message: string }> {
  // Use transaction to ensure all related data is deleted
  return await this.prisma.$transaction(async (tx) => {
    // Get session with user info to verify permissions
    const session = await tx.wizard_sessions.findUnique({
      where: { session_id: sessionId },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            full_name: true
          }
        }
      }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Verify session belongs to user
    if (session.user_id !== userId) {
      throw new Error('Access denied: You do not have permission to delete this session');
    }

    // Check if session can be deleted (only DRAFT or REJECTED)
    if (session.status !== 'DRAFT' && session.status !== 'REJECTED') {
      throw new Error(`Cannot delete session with status '${session.status}'. Only DRAFT or REJECTED sessions can be deleted.`);
    }

    // Check if DRAFT session is expired
    if (session.status === 'DRAFT' && session.expires_at && new Date(session.expires_at) < new Date()) {
      // Allow deletion of expired drafts
      console.log('Deleting expired draft session');
    }

    // Delete temporary documents first
    // Note: You'll need to implement this based on your document storage
    try {
      await this.deleteSessionDocuments(sessionId);
    } catch (docError) {
      console.error('Error deleting session documents:', docError);
      // Continue with session deletion even if document deletion fails
      // You might want to handle this differently based on your requirements
    }

    // If there's an associated approval request, handle it
    if (session.approval_request_id) {
      // For REJECTED sessions, we might want to keep the approval request for audit
      // or delete it based on your business logic
      if (session.status === 'REJECTED') {
        // Option 1: Keep the approval request for audit purposes
        // Just unlink it from the session
        await tx.wizard_sessions.update({
          where: { session_id: sessionId },
          data: { approval_request_id: null }
        });
      } else {
        // Option 2: Delete the approval request (for DRAFT sessions that never went to approval)
        await tx.approval_requests.deleteMany({
          where: { request_id: session.approval_request_id }
        }).catch(err => {
          console.error('Error deleting approval request:', err);
          // Continue with session deletion
        });
      }
    }

    // Delete the wizard session
    await tx.wizard_sessions.delete({
      where: { session_id: sessionId }
    });

    // Log the deletion for audit
    await this.auditService.log({
      userId,
      action: 'DELETE',
      entityType: 'WIZARD_SESSION',
      entityId: sessionId,
      changes: {
        session_id: sessionId,
        status: session.status,
        deleted_at: new Date().toISOString()
      },
      ipAddress: 'SYSTEM'
    });

    return {
      message: session.status === 'DRAFT' 
        ? 'Draft session deleted successfully' 
        : 'Rejected session deleted successfully'
    };
  });
}

// Helper method to delete session documents
private async deleteSessionDocuments(sessionId: string): Promise<void> {
  try {
    // Get the session to access document references
    const session = await this.prisma.wizard_sessions.findUnique({
      where: { session_id: sessionId },
      select: {
        parcel_docs: true,
        owner_docs: true,
        lease_docs: true
      }
    });

    if (!session) return;

    // Collect all document references
    const allDocs = [
      ...(Array.isArray(session.parcel_docs) ? session.parcel_docs : []),
      ...(Array.isArray(session.owner_docs) ? session.owner_docs : []),
      ...(Array.isArray(session.lease_docs) ? session.lease_docs : [])
    ];

    // Delete each document from storage
    for (const doc of allDocs) {
      if (doc.file_url) {
        try {
          // Extract filename from URL
          const urlParts = doc.file_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          
          // Determine step from document type or URL
          let step = 'parcel-docs';
          if (doc.file_url.includes('owner-docs')) step = 'owner-docs';
          if (doc.file_url.includes('lease-docs')) step = 'lease-docs';
          
          // Delete from temporary storage
          // You'll need to inject DocumentStorageService or have access to it
          // await this.documentStorage.deleteTemporary(sessionId, step, fileName);
        } catch (docError) {
          console.error(`Error deleting document ${doc.id}:`, docError);
          // Continue with other documents
        }
      }
    }

    // Also delete any records from wizard_documents_temp table if it exists
    await this.prisma.$executeRaw`
      DELETE FROM wizard_documents_temp 
      WHERE session_id = ${sessionId}
    `.catch(err => {
      console.error('Error deleting from wizard_documents_temp:', err);
    });

  } catch (error) {
    console.error('Error in deleteSessionDocuments:', error);
    throw error;
  }
}

// Optional: Add a method to check if session can be deleted
async canDeleteSession(sessionId: string, userId: string): Promise<{
  canDelete: boolean;
  reason?: string;
}> {
  const session = await this.prisma.wizard_sessions.findUnique({
    where: { session_id: sessionId }
  });

  if (!session) {
    return { canDelete: false, reason: 'Session not found' };
  }

  if (session.user_id !== userId) {
    return { canDelete: false, reason: 'Access denied' };
  }

  if (session.status !== 'DRAFT' && session.status !== 'REJECTED') {
    return { 
      canDelete: false, 
      reason: `Cannot delete session with status '${session.status}'. Only DRAFT or REJECTED sessions can be deleted.` 
    };
  }

  return { canDelete: true };
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