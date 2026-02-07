// src/services/makerCheckerService.ts
import prisma from '../config/prisma.ts';
import { UserRole, RequestStatus, ApprovalAction, AuditAction,ActionType, EntityType } from '../generated/prisma/enums.ts';
import { AuditService } from './auditService.ts';
import { ActionExecutionService } from './actionExecutionService.ts';

export interface CreateApprovalRequestParams {
  entityType: EntityType;
  entityId: string;
  actionType: ActionType;
  requestData: any;
  makerId: string;
  makerRole: UserRole;
  subCityId?: string;
  comments?: string;
}

export interface ApprovalResult {
  success: boolean;
  requiresApproval: boolean;
  immediateResult?: any;
  approvalRequest?: any;
}

export class MakerCheckerService {
  private prisma: typeof prisma;
  private auditService: AuditService;
  private actionExecutionService: ActionExecutionService;

  constructor(auditService: AuditService) {
    this.prisma = prisma;
    this.auditService = auditService;
    this.actionExecutionService = new ActionExecutionService();
  }

  async createApprovalRequest(params: CreateApprovalRequestParams): Promise<ApprovalResult> {
    return await this.prisma.$transaction(async (tx) => {
      // Determine approver role based on entity type
      const approverRole = this.getApproverRole(params.entityType, params.makerRole);
      
      // If maker is approver themselves, execute immediately
      if (params.makerRole === approverRole) {
        const result = await this.executeImmediately(params, tx);
        return {
          success: true,
          requiresApproval: false,
          immediateResult: result
        };
      }

      // Check for duplicate pending request
      const existing = await tx.approval_requests.findFirst({
        where: {
          entity_type: params.entityType,
          entity_id: params.entityId,
          action_type: params.actionType,
          status: 'PENDING',
          is_deleted: false
        }
      });

      if (existing) {
        throw new Error('A pending approval request already exists for this entity');
      }

      // Create approval request
      const approvalRequest = await tx.approval_requests.create({
        data: {
          entity_type: params.entityType ,
          entity_id: params.entityId,
          action_type: params.actionType,
          request_data: params.requestData,
          status: 'PENDING',
          maker_id: params.makerId,
          maker_role: params.makerRole,
          approver_role: approverRole,
          sub_city_id: params.subCityId,
          created_at: new Date()
        }
      });

      // Create initial approval log
      await tx.approval_logs.create({
        data: {
          request_id: approvalRequest.request_id,
          action: 'CREATE',
          performed_by: params.makerId,
          performed_by_role: params.makerRole,
          previous_status: null,
          new_status: 'PENDING',
          created_at: new Date()
        }
      });

      // Audit the request creation
      await this.auditService.log({
        userId: params.makerId,
        action: AuditAction.CREATE,
        entityType: 'APPROVAL_REQUEST',
        entityId: approvalRequest.request_id,
        changes: {
          entity_type: params.entityType,
          entity_id: params.entityId,
          action_type: params.actionType,
          maker_id: params.makerId,
          maker_role: params.makerRole,
          approver_role: approverRole
        },
        ipAddress: 'SYSTEM'
      });

      return {
        success: true,
        requiresApproval: true,
        approvalRequest
      };
    });
  }

  private getApproverRole(entityType: string, makerRole: UserRole): UserRole {
    // Define approval hierarchy
    const approvalRules = {
      'WIZARD_SESSION': {
        'SUBCITY_NORMAL': 'SUBCITY_ADMIN',
        'SUBCITY_AUDITOR': 'SUBCITY_ADMIN',
        'SUBCITY_ADMIN': 'SUBCITY_ADMIN' // Self-approval
      },
      'LAND_PARCEL': {
        'SUBCITY_NORMAL': 'SUBCITY_ADMIN',
        'SUBCITY_AUDITOR': 'SUBCITY_ADMIN',
        'SUBCITY_ADMIN': 'SUBCITY_ADMIN'
      },
      'LEASE': {
        'SUBCITY_NORMAL': 'REVENUE_ADMIN',
        'SUBCITY_ADMIN': 'REVENUE_ADMIN'
      }
    };

    return (approvalRules as any)[entityType]?.[makerRole] || 'SUBCITY_ADMIN';
  }

  private async executeImmediately(params: CreateApprovalRequestParams, tx: any) {
    // This would execute the action immediately (for self-approving users)
    // Implementation depends on your specific needs
    return { message: 'Executed immediately' };
  }

async approveRequest(requestId: string, approverId: string, userRole: UserRole, comments?: string) {
  return await this.prisma.$transaction(async (tx) => {
    const approvalRequest = await tx.approval_requests.findUnique({
      where: { request_id: requestId },
      include: {
        wizard_session: true // Important: Include wizard session
      }
    });

    if (!approvalRequest) {
      throw new Error('Approval request not found');
    }

    if (approvalRequest.status !== 'PENDING') {
      throw new Error(`Request is already ${approvalRequest.status.toLowerCase()}`);
    }

    // Verify approver has correct role
    if (userRole !== approvalRequest.approver_role) {
      throw new Error('Insufficient permissions to approve this request');
    }

    let executionResult: any = null;
    
    // Execute the actual business logic using ActionExecutionService
    try {
      // For wizard sessions, we need to pass the session data
      let requestData = approvalRequest.request_data as Record<string, any> || {};
      
      if (approvalRequest.entity_type === 'WIZARD_SESSION') {
        // Create a new object with session info
        const enhancedData = {
          ...requestData,
          session_id: approvalRequest.entity_id,
          sub_city_id: approvalRequest.sub_city_id,
          user_id: approvalRequest.maker_id,
          user_role: approvalRequest.maker_role
        };
        
        executionResult = await this.actionExecutionService.executeAction(
          approvalRequest.entity_type,
          approvalRequest.action_type,
          approvalRequest.entity_id,
          enhancedData,
          approverId
        );
        
        await this.actionExecutionService.updateWizardSessionAfterExecution(
          tx,
          approvalRequest.entity_id,
          approverId,
          true
        );
      } else {
        // For non-wizard requests, use the original request data
        executionResult = await this.actionExecutionService.executeAction(
          approvalRequest.entity_type,
          approvalRequest.action_type,
          approvalRequest.entity_id,
          requestData,
          approverId
        );
      }
      
    } catch (error: any) {
      console.error('Action execution failed:', error);
      
      // Update wizard session if execution failed
      if (approvalRequest.entity_type === 'WIZARD_SESSION') {
        await tx.wizard_sessions.update({
          where: { session_id: approvalRequest.entity_id },
          data: {
            status: RequestStatus.FAILED,
            updated_at: new Date()
          }
        });
      }
      
      throw new Error(`Failed to execute approved action: ${error.message}`);
    }

    // Update approval request
    const updatedRequest = await tx.approval_requests.update({
      where: { request_id: requestId },
      data: {
        status: RequestStatus.APPROVED,
        approved_at: new Date(),
        updated_at: new Date(),
      }
    });

    // Create approval log
    await tx.approval_logs.create({
      data: {
        request_id: requestId,
        action: ApprovalAction.APPROVE,
        performed_by: approverId,
        performed_by_role: userRole,
        comments,
        previous_status: RequestStatus.PENDING,
        new_status: RequestStatus.APPROVED, // Fixed: This should be APPROVED
        created_at: new Date()
      }
    });

    // Audit the approval and execution
    await this.auditService.log({
      userId: approverId,
      action: AuditAction.UPDATE,
      entityType: EntityType.APPROVAL_REQUEST,
      entityId: requestId,
      changes: {
        entity_type: approvalRequest.entity_type,
        entity_id: approvalRequest.entity_id,
        action_type: approvalRequest.action_type,
        approver_id: approverId,
        approver_role: userRole,
        comments,
        status: RequestStatus.APPROVED,
        execution_result: executionResult
      },
      ipAddress: 'SYSTEM'
    });

    return {
      success: true,
      message: 'Request approved and executed successfully',
      data: {
        approval: updatedRequest,
        execution: executionResult
      }
    };
  });
}


async rejectRequest(requestId: string, approverId: string, userRole: UserRole, rejectionReason: string) {
  return await this.prisma.$transaction(async (tx) => {
    const approvalRequest = await tx.approval_requests.findUnique({
      where: { request_id: requestId }
    });

    if (!approvalRequest) {
      throw new Error('Approval request not found');
    }

    if (approvalRequest.status !== 'PENDING') {
      throw new Error(`Request is already ${approvalRequest.status.toLowerCase()}`);
    }

    // Verify approver has correct role
    if (userRole !== approvalRequest.approver_role) {
      throw new Error('Insufficient permissions to reject this request');
    }

    // Update approval request
    const updatedRequest = await tx.approval_requests.update({
      where: { request_id: requestId },
      data: {
        status: 'REJECTED',
        rejection_reason: rejectionReason,
        rejected_at: new Date(),
        updated_at: new Date()
      }
    });

    // Create approval log
    await tx.approval_logs.create({
      data: {
        request_id: requestId,
        action: ApprovalAction.REJECT,
        performed_by: approverId,
        performed_by_role: userRole,
        comments: rejectionReason,
        previous_status: RequestStatus.PENDING,
        new_status: RequestStatus.REJECTED,
        created_at: new Date()
      }
    });

    // If the request is for a WIZARD_SESSION, update the wizard session status
    if (approvalRequest.entity_type === 'WIZARD_SESSION') {
      await tx.wizard_sessions.update({
        where: { 
          session_id: approvalRequest.entity_id 
        },
        data: {
          status: 'REJECTED',
          updated_at: new Date()
        }
      });

      // Optional: Create a specific audit log for wizard session rejection
      await this.auditService.log({
        userId: approverId,
        action: AuditAction.UPDATE,
        entityType: EntityType.WIZARD_SESSION,
        entityId: approvalRequest.entity_id,
        changes: {
          request_id: requestId,
          rejection_reason: rejectionReason,
          approver_id: approverId,
          approver_role: userRole,
          previous_status: 'PENDING_APPROVAL',
          new_status: 'REJECTED',
          timestamp: new Date().toISOString()
        },
        ipAddress: 'SYSTEM'
      });
    }

    // Audit the rejection
    await this.auditService.log({
      userId: approverId,
      action: AuditAction.UPDATE,
      entityType: EntityType.APPROVAL_REQUEST,
      entityId: requestId,
      changes: {
        entity_type: approvalRequest.entity_type,
        entity_id: approvalRequest.entity_id,
        action_type: approvalRequest.action_type,
        approver_id: approverId,
        approver_role: userRole,
        rejection_reason: rejectionReason,
        status: RequestStatus.REJECTED,
      },
      ipAddress: 'SYSTEM'
    });

    return {
      success: true,
      message: 'Request rejected',
      data: updatedRequest,
      wizard_session_updated: approvalRequest.entity_type === 'WIZARD_SESSION'
    };
  });
}

  async getPendingRequests(user: any) {
    const where: any = {
      status: 'PENDING',
      is_deleted: false
    };

    // Filter by subcity for subcity admins
    if (user.role === 'SUBCITY_ADMIN' && user.sub_city_id) {
      where.sub_city_id = user.sub_city_id;
    }

    // Revenue admins see revenue-related requests
    if (user.role === 'REVENUE_ADMIN') {
      where.entity_type = 'REVENUE';
    }

    // Check if user is an approver for any entity type
    const userCanApprove = ['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'CITY_ADMIN'].includes(user.role);
    
    if (!userCanApprove) {
      return [];
    }

    const requests = await this.prisma.approval_requests.findMany({
      where,
      orderBy: { created_at: 'desc' },
      select:{
        request_id:true,
        entity_type: true,
        action_type: true,
        status: true,
        created_at: true,
        maker:{
          select :{
            user_id: true,
            username: true,
            full_name: true,
            role: true
          }
        }
      },
    
    });

    return requests;
  }

  async getRequestDetails(requestId: string) {
    return await this.prisma.approval_requests.findUnique({
      where: { request_id: requestId },
      include: {
        maker: {
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
      }
    });
  }


}










