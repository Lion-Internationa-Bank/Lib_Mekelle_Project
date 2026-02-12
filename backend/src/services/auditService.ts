// src/services/auditService.ts
import prisma from '../config/prisma.ts';
import { AuditAction } from '../generated/prisma/enums.ts';

export interface AuditLogParams {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes: any;
  ipAddress?: string;
}

export class AuditService {
  private prisma: typeof prisma;

  constructor() {
    this.prisma = prisma;
  }

  async log(params: AuditLogParams) {
    try {
      await this.prisma.audit_logs.create({
        data: {
          user_id: params.userId,
          action_type: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId,
          changes: params.changes,
          timestamp: new Date(),
          ip_address: params.ipAddress || 'SYSTEM'
        }
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw, as we don't want to fail the main operation
    }
  }
}