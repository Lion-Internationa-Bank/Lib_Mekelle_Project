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

interface ApproverPaginationOptions {
  page: number;
  limit: number;
  status?: string;
  entity_type?: string;
  action_type?: string;
  maker_id?: string;
  from_date?: string;
  to_date?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ApprovalResult {
  success: boolean;
  requiresApproval: boolean;
  immediateResult?: any;
  approvalRequest?: any;
}



// Add this interface for pagination options
interface PaginationOptions {
  page: number;
  limit: number;
  status?: string;
  entity_type?: string;
  action_type?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Add this interface for paginated result
interface PaginatedResult<T> {
  requests: T[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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

      // Prepare request data with documents array
      const requestDataWithDocs = {
        ...params.requestData,
        documents: [], // Initialize empty documents array
        // metadata: {
        //   created_by: params.makerId,
        //   created_by_role: params.makerRole,
        //   sub_city_id: params.subCityId,
        //   created_at: new Date().toISOString(),
        //   requires_approval: true,
        //   approver_role: approverRole
        // }
      };

      // Create approval request
      const approvalRequest = await tx.approval_requests.create({
        data: {
          entity_type: params.entityType,
          entity_id: params.entityId,
          action_type: params.actionType,
          request_data: requestDataWithDocs,
          status: 'PENDING',
          maker_id: params.makerId,
          maker_role: params.makerRole,
          approver_role: approverRole,
          sub_city_id: params.subCityId,
          comments: params.comments,
          created_at: new Date(),
          updated_at: new Date()
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
          comments: params.comments,
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
          approver_role: approverRole,
          has_documents: false // Initially no documents
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

   private async executeImmediately(params: CreateApprovalRequestParams, tx: any): Promise<any> {
    // Prepare data for immediate execution
    const executionData = {
      ...params.requestData,
      approval_request_id: null, // No approval request ID for immediate execution
      request_data: {
        ...params.requestData,
        metadata: {
          created_by: params.makerId,
          created_by_role: params.makerRole,
          sub_city_id: params.subCityId,
          created_at: new Date().toISOString(),
          requires_approval: false,
          executed_immediately: true
        }
      }
    };

    // Execute based on entity type
    switch (params.entityType) {
      case EntityType.OWNERS:
        if (params.actionType === ActionType.CREATE) {
          return await this.actionExecutionService.executeCreateOwner(
            tx, 
            executionData, 
            params.makerId
          );
        }
        break;
      
      case EntityType.LAND_PARCELS:
        switch (params.actionType) {
          case ActionType.TRANSFER:
            return await this.actionExecutionService.executeTransferOwnership(
              tx,
              params.entityId,
              executionData,
              params.makerId
            );
          
          case ActionType.ADD_OWNER:
            return await this.actionExecutionService.executeAddParcelOwner(
              tx,
              params.entityId,
              executionData,
              params.makerId
            );
          
          case ActionType.SUBDIVIDE:
            return await this.actionExecutionService.executeSubdivideParcel(
              tx,
              params.entityId,
              executionData,
              params.makerId
            );
        }
        break;
      
      case EntityType.ENCUMBRANCES:
        if (params.actionType === ActionType.CREATE) {
          return await this.actionExecutionService.executeCreateEncumbrance(
            tx,
            executionData,
            params.makerId
          );
        }
        break;
    }

    throw new Error(`Immediate execution not supported for ${params.entityType} ${params.actionType}`);
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


 async updateApprovalRequestDocuments(requestId: string, documents: any[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const approvalRequest = await tx.approval_requests.findUnique({
        where: { request_id: requestId }
      });

      if (!approvalRequest) {
        throw new Error('Approval request not found');
      }

      if (approvalRequest.status !== RequestStatus.PENDING) {
        throw new Error('Cannot update documents for a processed request');
      }

      // Update request_data with new documents
      const requestData = approvalRequest.request_data as any;
      const updatedRequestData = {
        ...requestData,
        documents: documents,
        last_document_update: new Date().toISOString()
      };

      await tx.approval_requests.update({
        where: { request_id: requestId },
        data: {
          request_data: updatedRequestData,
          updated_at: new Date()
        }
      });
    });
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
          approvalRequest.request_id,
          approverId,
        
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
          approvalRequest.request_id,
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

// src/services/makerCheckerService.ts

// Add/update the interface for approver pagination options


// Update the getPendingRequests method in the service
async getPendingRequests(
  user: any,
  options: ApproverPaginationOptions
): Promise<PaginatedResult<any>> {
  try {
    const { 
      page, 
      limit, 
      status, 
      entity_type, 
      action_type, 
      maker_id,
      from_date,
      to_date,
      sortBy, 
      sortOrder 
    } = options;

    // Calculate offset for pagination
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: any = {
      is_deleted: false
    };

    // Apply status filter (default to PENDING)
    if (status) {
      where.status = status;
    }

    // Filter by subcity for subcity admins
    if (user.role === 'SUBCITY_ADMIN' && user.sub_city_id) {
      where.sub_city_id = user.sub_city_id;
    }

    // Revenue admins see revenue-related requests
    if (user.role === 'REVENUE_ADMIN') {
      where.entity_type = 'REVENUE';
    }

    // Apply entity type filter if provided
    if (entity_type) {
      where.entity_type = entity_type;
    }

    // Apply action type filter if provided
    if (action_type) {
      where.action_type = action_type;
    }

    // Filter by maker if provided
    if (maker_id) {
      where.maker_id = maker_id;
    }

    // Apply date range filter
    if (from_date || to_date) {
      where.created_at = {};
      
      if (from_date) {
        where.created_at.gte = new Date(from_date);
      }
      
      if (to_date) {
        // Set to end of the day
        const toDateObj = new Date(to_date);
        toDateObj.setHours(23, 59, 59, 999);
        where.created_at.lte = toDateObj;
      }
    }

    // Check if user is an approver for any entity type
    const userCanApprove = ['SUBCITY_ADMIN', 'REVENUE_ADMIN', 'CITY_ADMIN'].includes(user.role);
    
    if (!userCanApprove) {
      return {
        requests: [],
        page,
        limit,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }

    // Get total count for pagination
    const totalCount = await this.prisma.approval_requests.count({ where });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Validate sortBy field
    const validSortFields = [
      'created_at', 
      'updated_at', 
      'status', 
      'entity_type', 
      'action_type',
      'submitted_at',
      'approved_at',
      'rejected_at'
    ];
    
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    // Fetch requests with pagination
    const requests = await this.prisma.approval_requests.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [orderByField]: orderDirection
      },
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

    return {
      requests,
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw new Error('Failed to fetch pending requests');
  }
}

  // src/services/makerCheckerService.ts


// Add this method to the MakerCheckerService class
async getMakerPendingRequests(
  makerId: string,
  options: PaginationOptions,
  requestingUser: any
): Promise<PaginatedResult<any>> {
  try {
    const { 
      page, 
      limit, 
      status, 
      entity_type, 
      action_type, 
      sortBy, 
      sortOrder 
    } = options;

    // Calculate offset for pagination
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: any = {
      maker_id: makerId,
      is_deleted: false
    };

    // Apply status filter (default to PENDING if not specified)
    if (status) {
      where.status = status;
    }

    // Apply entity type filter if provided
    if (entity_type) {
      where.entity_type = entity_type;
    }

    // Apply action type filter if provided
    if (action_type) {
      where.action_type = action_type;
    }

    // Apply role-based filtering for non-admin requesters
    if (requestingUser.role === 'SUBCITY_ADMIN' && requestingUser.sub_city_id) {
      where.sub_city_id = requestingUser.sub_city_id;
    }

    if (requestingUser.role === 'REVENUE_ADMIN') {
      where.entity_type = 'REVENUE';
    }

    // Get total count for pagination
    const totalCount = await this.prisma.approval_requests.count({ where });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Validate sortBy field to prevent SQL injection
    const validSortFields = [
      'created_at', 
      'updated_at', 
      'status', 
      'entity_type', 
      'action_type',
      'submitted_at'
    ];
    
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    // Fetch requests with pagination
    const requests = await this.prisma.approval_requests.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [orderByField]: orderDirection
      },
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

    return {
      requests,
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  } catch (error) {
    console.error('Error fetching maker pending requests:', error);
    throw new Error('Failed to fetch maker pending requests');
  }
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

  // src/services/makerCheckerService.ts








}













