// src/services/wizardSessionService.ts
import prisma from '../config/prisma.ts';
import { UserRole, SessionStatus, AuditAction } from '../generated/prisma/enums.ts';
import { AuditService } from './auditService.ts';
import { MakerCheckerService } from './makerCheckerService.ts';

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

  constructor(
    makerChecker: MakerCheckerService,
    auditService: AuditService
  ) {
    this.prisma = prisma;
    this.makerChecker = makerChecker;
    this.auditService = auditService;
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

    if (!session || session.status !== 'DRAFT') {
      throw new Error('Cannot save step: Session not found or not in draft');
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
    
    // Check owner documents (at least one required)
    if (!session.owner_docs || 
        (Array.isArray(session.owner_docs) && session.owner_docs.length === 0)) {
      missing.push('Owner Documents');
    }
    // Lease is optional

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

      if (session.status !== 'DRAFT') {
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
        // Execute immediately
        const result = await this.executeWizard(session, tx);
        
        await tx.wizard_sessions.update({
          where: { session_id: sessionId },
          data: {
            status: 'MERGED',
            submitted_at: new Date()
          }
        });

        return {
          success: true,
          requiresApproval: false,
          immediateResult: result,
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

        if (!approvalResult.requiresApproval) {
          // Execute immediately if no approval needed
          const result = await this.executeWizard(session, tx);
          
          await tx.wizard_sessions.update({
            where: { session_id: sessionId },
            data: {
              status: 'MERGED',
              submitted_at: new Date()
            }
          });

          return {
            success: true,
            requiresApproval: false,
            immediateResult: result,
            message: 'Parcel registered successfully'
          };
        }

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

  private async executeWizard(session: any, tx: any) {
    const results: any = {};

    try {
      // 1. Create parcel (using your existing createParcel logic)
      const parcelData = session.parcel_data;
      
      // Check for duplicate UPIN or file_number
      const existingParcel = await tx.land_parcels.findFirst({
        where: {
          OR: [
            { upin: parcelData.upin },
            { file_number: parcelData.file_number },
          ],
          is_deleted: false,
        },
      });

      if (existingParcel) {
        const conflictField = existingParcel.upin === parcelData.upin ? 'UPIN' : 'file_number';
        throw new Error(`${conflictField} already exists`);
      }

      // Validate required fields
      if (!parcelData.upin || !parcelData.file_number || !parcelData.total_area_m2) {
        throw new Error('Missing required parcel fields: upin, file_number, or total_area_m2');
      }

      // Create parcel
      results.parcel = await tx.land_parcels.create({
        data: {
          upin: parcelData.upin,
          file_number: parcelData.file_number,
          sub_city_id: session.sub_city_id,
          tabia: parcelData.tabia || '',
          ketena: parcelData.ketena || '',
          block: parcelData.block || '',
          total_area_m2: parcelData.total_area_m2,
          land_use: parcelData.land_use,
          land_grade: parcelData.land_grade || 1.0,
          tenure_type: parcelData.tenure_type || 'OLD_POSSESSION',
          boundary_coords: parcelData.boundary_coords,
          boundary_north: parcelData.boundary_north,
          boundary_south: parcelData.boundary_south,
          boundary_west: parcelData.boundary_west,
          boundary_east: parcelData.boundary_east,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // 2. Create owners
      const ownersData = Array.isArray(session.owner_data) ? session.owner_data : [session.owner_data];
      results.owners = [];

      for (const ownerData of ownersData) {
        // Validate owner data
        if (!ownerData.full_name || !ownerData.national_id || !ownerData.phone_number) {
          throw new Error('Missing required owner fields: full_name, national_id, or phone_number');
        }

        // Check if owner exists by national_id
        let owner = await tx.owners.findFirst({
          where: { 
            national_id: ownerData.national_id,
            is_deleted: false
          }
        });

        if (!owner) {
          // Create new owner
          owner = await tx.owners.create({
            data: {
              full_name: ownerData.full_name,
              national_id: ownerData.national_id,
              tin_number: ownerData.tin_number,
              phone_number: ownerData.phone_number,
              sub_city_id: session.sub_city_id,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        // Link owner to parcel
        const parcelOwner = await tx.parcel_owners.create({
          data: {
            upin: results.parcel.upin,
            owner_id: owner.owner_id,
            acquired_at: new Date(ownerData.acquired_at || new Date()),
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        results.owners.push({
          owner_id: owner.owner_id,
          full_name: owner.full_name,
          national_id: owner.national_id,
          parcel_owner_id: parcelOwner.parcel_owner_id
        });
      }

      // 3. Create lease if exists
      if (session.lease_data) {
        const leaseData = session.lease_data;
        
        // Check if land parcel exists and tenure is LEASE
        const landParcel = await tx.land_parcels.findUnique({
          where: { upin: results.parcel.upin },
        });

        if (!landParcel) {
          throw new Error('Land parcel not found');
        }

        if (landParcel.tenure_type !== "LEASE") {
          throw new Error('Land Tenure Type Must Be LEASE to Register Lease Agreement');
        }

        // Validate lease data
        if (!leaseData.total_lease_amount || !leaseData.lease_period_years || 
            !leaseData.payment_term_years || !leaseData.start_date || !leaseData.contract_date) {
          throw new Error('Missing required lease fields');
        }

        // Calculate expiry date
        const startDate = new Date(leaseData.start_date);
        const expiryDate = new Date(startDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + leaseData.lease_period_years);

        // Calculate principal and annual main payment
        const totalLeaseAmountNum = Number(leaseData.total_lease_amount ?? 0);
        const downPaymentNum = Number(leaseData.down_payment_amount ?? 0);
        const otherPaymentNum = Number(leaseData.other_payment ?? 0);
        const principal = totalLeaseAmountNum - (downPaymentNum + otherPaymentNum);

        if (principal <= 0) {
          throw new Error('Down payment plus other payment must be less than total lease amount');
        }

        const annualMainPayment = leaseData.payment_term_years > 0 ? principal / leaseData.payment_term_years : 0;

        // Create lease
        results.lease = await tx.lease_agreements.create({
          data: {
            upin: results.parcel.upin,
            total_lease_amount: leaseData.total_lease_amount,
            contract_date: new Date(leaseData.contract_date),
            down_payment_amount: leaseData.down_payment_amount || 0,
            other_payment: leaseData.other_payment || 0,
            lease_period_years: leaseData.lease_period_years,
            legal_framework: leaseData.legal_framework || '',
            payment_term_years: leaseData.payment_term_years,
            price_per_m2: leaseData.price_per_m2 || 0,
            start_date: startDate,
            expiry_date: expiryDate,
            annual_installment: annualMainPayment,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // 4. Move temporary documents to permanent storage
      results.documents = await this.moveDocumentsToPermanent(
        session,
        results,
        tx
      );

      // 5. Create audit logs
      await tx.audit_logs.create({
        data: {
          user_id: session.user_id,
          action_type: AuditAction.CREATE,
          entity_type: 'WIZARD_SESSION',
          entity_id: session.session_id,
          changes: {
            action: 'complete_wizard_registration',
            parcel_upin: results.parcel.upin,
            owners_count: results.owners.length,
            has_lease: !!results.lease,
            documents_count: results.documents.length
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      // Audit for parcel creation
      await tx.audit_logs.create({
        data: {
          user_id: session.user_id,
          action_type: AuditAction.CREATE,
          entity_type: 'land_parcels',
          entity_id: results.parcel.upin,
          changes: {
            action: 'create_parcel',
            upin: results.parcel.upin,
            file_number: results.parcel.file_number,
            sub_city_id: results.parcel.sub_city_id,
            actor_id: session.user_id,
            actor_role: session.user_role,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return results;
    } catch (error) {
      console.error('Execute wizard error:', error);
      throw error;
    }
  }

  private async moveDocumentsToPermanent(session: any, wizardResult: any, tx: any) {
    const permanentDocs = [];

    // Process parcel documents
    if (session.parcel_docs && Array.isArray(session.parcel_docs)) {
      for (const doc of session.parcel_docs) {
        const permanentDoc = await tx.documents.create({
          data: {
            upin: wizardResult.parcel.upin,
            file_url: doc.file_url,
            file_name: doc.file_name,
            doc_type: doc.document_type || 'PARCEL_MAP',
            is_verified: false,
            upload_date: new Date(),
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        permanentDocs.push(permanentDoc);
      }
    }

    // Process owner documents
    if (session.owner_docs && Array.isArray(session.owner_docs)) {
      for (let i = 0; i < session.owner_docs.length; i++) {
        const doc = session.owner_docs[i];
        const owner = wizardResult.owners[i];
        
        if (owner) {
          const permanentDoc = await tx.documents.create({
            data: {
              owner_id: owner.owner_id,
              file_url: doc.file_url,
              file_name: doc.file_name,
              doc_type: doc.document_type || 'OWNER_ID_COPY',
              is_verified: false,
              upload_date: new Date(),
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          permanentDocs.push(permanentDoc);
        }
      }
    }

    // Process lease documents
    if (session.lease_docs && Array.isArray(session.lease_docs) && wizardResult.lease) {
      for (const doc of session.lease_docs) {
        const permanentDoc = await tx.documents.create({
          data: {
            lease_id: wizardResult.lease.lease_id,
            file_url: doc.file_url,
            file_name: doc.file_name,
            doc_type: doc.document_type || 'LEASE_CONTRACT',
            is_verified: false,
            upload_date: new Date(),
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        permanentDocs.push(permanentDoc);
      }
    }

    // Clean up temporary documents
    await tx.wizard_documents_temp.deleteMany({
      where: { session_id: session.session_id }
    });

    return permanentDocs;
  }

  async getUserSessions(userId: string) {
    return await this.prisma.wizard_sessions.findMany({
      where: {
        user_id: userId,
        OR: [
          { status: 'PENDING_APPROVAL' },
          { status: 'APPROVED' },
          { status: 'REJECTED' },
          { status: 'MERGED' }
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