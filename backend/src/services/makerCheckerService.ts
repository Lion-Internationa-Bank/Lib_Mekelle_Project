// src/services/makerCheckerService.ts
import prisma from '../config/prisma.ts';
import { UserRole, RequestStatus, ApprovalAction, AuditAction } from '../generated/prisma/enums.ts';
import { AuditService } from './auditService.ts';

export interface CreateApprovalRequestParams {
  entityType: string;
  entityId: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK';
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

  constructor(
    auditService: AuditService
  ) {
    this.prisma = prisma;
    this.auditService = auditService;
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
          entity_type: params.entityType,
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
          wizard_session: true
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

      // Update approval request
      const updatedRequest = await tx.approval_requests.update({
        where: { request_id: requestId },
        data: {
          status: 'APPROVED',
          approved_at: new Date(),
          updated_at: new Date()
        }
      });

      // Create approval log
      await tx.approval_logs.create({
        data: {
          request_id: requestId,
          action: 'APPROVE',
          performed_by: approverId,
          performed_by_role: userRole,
          comments,
          previous_status: 'PENDING',
          new_status: 'APPROVED',
          created_at: new Date()
        }
      });

      // Audit the approval
      await this.auditService.log({
        userId: approverId,
        action: AuditAction.UPDATE,
        entityType: 'APPROVAL_REQUEST',
        entityId: requestId,
        changes: {
          entity_type: approvalRequest.entity_type,
          entity_id: approvalRequest.entity_id,
          action_type: approvalRequest.action_type,
          approver_id: approverId,
          approver_role: userRole,
          comments,
          status: 'APPROVED'
        },
        ipAddress: 'SYSTEM'
      });

      return {
        success: true,
        message: 'Request approved successfully',
        data: updatedRequest
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
          action: 'REJECT',
          performed_by: approverId,
          performed_by_role: userRole,
          comments: rejectionReason,
          previous_status: 'PENDING',
          new_status: 'REJECTED',
          created_at: new Date()
        }
      });

      // Audit the rejection
      await this.auditService.log({
        userId: approverId,
        action: AuditAction.UPDATE,
        entityType: 'APPROVAL_REQUEST',
        entityId: requestId,
        changes: {
          entity_type: approvalRequest.entity_type,
          entity_id: approvalRequest.entity_id,
          action_type: approvalRequest.action_type,
          approver_id: approverId,
          approver_role: userRole,
          rejection_reason: rejectionReason,
          status: 'REJECTED'
        },
        ipAddress: 'SYSTEM'
      });

      return {
        success: true,
        message: 'Request rejected',
        data: updatedRequest
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
        approval_logs: {
          orderBy: { created_at: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                user_id: true,
                username: true,
                full_name: true,
                role: true
              }
            }
          }
        },
        wizard_session: {
          include: {
            user: {
              select: {
                user_id: true,
                username: true,
                full_name: true
              }
            },
            sub_city: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
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
        approval_logs: {
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: {
                user_id: true,
                username: true,
                full_name: true,
                role: true
              }
            }
          }
        },
        wizard_session: {
          include: {
            user: {
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
}