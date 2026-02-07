// src/services/actionExecutionService.ts
import prisma from '../config/prisma.ts';
import { 
  UserRole, 
  AuditAction, 
  ConfigCategory, 
  PaymentStatus, 
  EncumbranceStatus,
  LeaseStatus,
  ParcelStatus
} from '../generated/prisma/enums.ts';
import { generateLeaseBillsInTx, calculateLeasePaymentDetails } from './leaseBillingService.ts';
import { DocumentStorageService } from './documentStorageService.ts'; 

// Types for different entities
interface CreateParcelData {
  upin: string;
  file_number: string;
  sub_city_id: string;
  tabia?: string;
  ketena?: string;
  block?: string;
  total_area_m2: number;
  land_use?: string;
  land_grade?: number;
  tenure_type?: string;
  boundary_coords?: any;
  boundary_north?: string;
  boundary_south?: string;
  boundary_west?: string;
  boundary_east?: string;
}

interface UpdateParcelData {
  changes: {
    file_number?: string;
    sub_city_id?: string;
    tabia?: string;
    ketena?: string;
    block?: string;
    total_area_m2?: number;
    land_use?: string;
    land_grade?: number;
    tenure_type?: string;
    boundary_coords?: any;
    boundary_north?: string;
    boundary_south?: string;
    boundary_west?: string;
    boundary_east?: string;
    status?: ParcelStatus;
  };
}

interface DeleteParcelData {
  reason?: string;
}

interface TransferOwnershipData {
  from_owner_id?: string;
  to_owner_id: string;
  transfer_type: string;
  transfer_price?: number;
  reference_no?: string;
}

interface AddParcelOwnerData {
  owner_id: string;
  acquired_at?: string;
}

interface SubdivideParcelData {
  childParcels: Array<{
    upin: string;
    file_number: string;
    total_area_m2: number;
    land_use?: string;
    land_grade?: number;
    boundary_coords?: any;
    boundary_north?: string;
    boundary_south?: string;
    boundary_west?: string;
    boundary_east?: string;
  }>;
}

interface CreateOwnerData {
  full_name: string;
  national_id: string;
  tin_number?: string;
  phone_number: string;
  sub_city_id: string;
}

interface UpdateOwnerData {
  changes: {
    full_name?: string;
    national_id?: string;
    tin_number?: string;
    phone_number?: string;
    sub_city_id?: string;
  };
}

interface DeleteOwnerData {
  reason?: string;
}

interface CreateLeaseData {
  upin: string;
  total_lease_amount: number;
  contract_date: string | Date;
  down_payment_amount: number;
  other_payment?: number;
  lease_period_years: number;
  legal_framework: string;
  payment_term_years: number;
  price_per_m2?: number;
  start_date: string | Date;
}

interface UpdateLeaseData {
  changes: {
    annual_lease_fee?: number;
    total_lease_amount?: number;
    down_payment_amount?: number;
    other_payment?: number;
    annual_installment?: number;
    price_per_m2?: number;
    lease_period_years?: number;
    payment_term_years?: number;
    legal_framework?: string;
    start_date?: string | Date;
    expiry_date?: string | Date;
    contract_date?: string | Date;
  };
}

interface DeleteLeaseData {
  reason?: string;
}

interface CreateEncumbranceData {
  upin: string;
  type: string;
  issuing_entity: string;
  reference_number?: string;
  status?: EncumbranceStatus;
  registration_date?: string | Date;
}

interface UpdateEncumbranceData {
  changes: {
    type?: string;
    issuing_entity?: string;
    reference_number?: string;
    status?: EncumbranceStatus;
    registration_date?: string | Date;
  };
}

interface DeleteEncumbranceData {
  reason?: string;
}

interface WizardExecutionData {
  session_id: string;
  parcel: any;
  parcel_docs?: any[];
  owners: any[];
  owner_docs?: any[];
  lease?: any;
  lease_docs?: any[];
  sub_city_id: string;
  user_id: string;
  user_role: UserRole;
}






// Add to existing interfaces
interface CreateWizardData extends WizardExecutionData {}
// No need for UpdateWizardData since wizard is create-only

// ========== WIZARD EXECUTION ==========

export class ActionExecutionService {
  private documentStorageService: DocumentStorageService;

  constructor() {
    // Initialize if you have a document storage service
    this.documentStorageService = new DocumentStorageService();
  }

  // Add this method to handle wizard execution
  async executeWizard(tx: any, data: WizardExecutionData, approverId: string) {
    const results: any = {};

    try {
      // 1. Create parcel
      const parcelData = data.parcel;
      
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
          sub_city_id: data.sub_city_id,
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
          updated_at: new Date(),
        }
      });

      // 2. Create owners
      const ownersData = Array.isArray(data.owners) ? data.owners : [data.owners];
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
              sub_city_id: data.sub_city_id,
              created_at: new Date(),
              updated_at: new Date(),
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
      if (data.lease) {
        const leaseData = data.lease;
        
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

        // Calculate payment details using service function
        const totalLeaseAmountNum = Number(leaseData.total_lease_amount ?? 0);
        const downPaymentNum = Number(leaseData.down_payment_amount ?? 0);
        
        const { principal, annualInstallment } = calculateLeasePaymentDetails(
          totalLeaseAmountNum,
          downPaymentNum,
          leaseData.payment_term_years
        );

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
            annual_installment: annualInstallment,
            created_at: new Date(),
            updated_at: new Date(),
          }
        });

        // Generate lease bills using service function
        results.bills = await generateLeaseBillsInTx(tx, {
          lease_id: results.lease.lease_id,
          upin: results.parcel.upin,
          total_lease_amount: leaseData.total_lease_amount,
          down_payment_amount: leaseData.down_payment_amount || 0,
          other_payment: leaseData.other_payment || 0,
          payment_term_years: leaseData.payment_term_years,
          start_date: startDate,
          annualMainPayment: annualInstallment,
          annual_installment: annualInstallment,
        });
      }

      // 4. Create permanent documents
      results.documents = await this.createPermanentDocuments(tx, data, results, approverId);

      // 5. Create audit logs
      await this.createWizardAuditLogs(tx, data, results, approverId);

      return {
        success: true,
        action: 'WIZARD_EXECUTION',
        session_id: data.session_id,
        parcel_upin: results.parcel.upin,
        owners_created: results.owners.length,
        lease_created: !!results.lease,
        bills_created: results.bills?.length || 0,
        documents_created: results.documents.length
      };
    } catch (error) {
      console.error('Execute wizard error:', error);
      
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          sessionId: data.session_id,
          userId: data.user_id
        });
      }
      
      throw error;
    }
  }

  private async createPermanentDocuments(tx: any, wizardData: WizardExecutionData, results: any, approverId: string) {
  const permanentDocs = [];

  // Process parcel documents
  if (wizardData.parcel_docs && Array.isArray(wizardData.parcel_docs)) {
    for (const doc of wizardData.parcel_docs) {
      const permanentDoc = await tx.documents.create({
        data: {
          upin: results.parcel.upin,  // Direct foreign key
          file_url: doc.file_url,
          file_name: doc.file_name,
          doc_type: doc.document_type || 'PARCEL_MAP',
          is_verified: false,
          upload_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
          // created_by is not in your schema, remove it
          // created_by: approverId
        }
      });
      permanentDocs.push(permanentDoc);
    }
  }

  // Process owner documents
  if (wizardData.owner_docs && Array.isArray(wizardData.owner_docs)) {
    for (let i = 0; i < wizardData.owner_docs.length; i++) {
      const doc = wizardData.owner_docs[i];
      const owner = results.owners[i];
      
      if (owner) {
        const permanentDoc = await tx.documents.create({
          data: {
            owner_id: owner.owner_id,  // Direct foreign key
            file_url: doc.file_url,
            file_name: doc.file_name,
            doc_type: doc.document_type || 'OWNER_ID_COPY',
            is_verified: false,
            upload_date: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
            // created_by is not in your schema, remove it
            // created_by: approverId
          }
        });
        permanentDocs.push(permanentDoc);
      }
    }
  }

  // Process lease documents
  if (wizardData.lease_docs && Array.isArray(wizardData.lease_docs) && results.lease) {
    for (const doc of wizardData.lease_docs) {
      const permanentDoc = await tx.documents.create({
        data: {
          lease_id: results.lease.lease_id,  // Direct foreign key
          file_url: doc.file_url,
          file_name: doc.file_name,
          doc_type: doc.document_type || 'LEASE_CONTRACT',
          is_verified: false,
          upload_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
          // created_by is not in your schema, remove it
          // created_by: approverId
        }
      });
      permanentDocs.push(permanentDoc);
    }
  }

  return permanentDocs;
}

 private async createWizardAuditLogs(tx: any, wizardData: WizardExecutionData, results: any, approverId: string) {
    // Wizard session audit log
    await tx.audit_logs.create({
      data: {
        user_id: approverId,
        action_type: AuditAction.CREATE,
        entity_type: 'WIZARD_SESSION',
        entity_id: wizardData.session_id,
        changes: {
          action: 'complete_wizard_registration',
          parcel_upin: results.parcel.upin,
          owners_count: results.owners.length,
          has_lease: !!results.lease,
          lease_bills_count: results.bills?.length || 0,
          documents_count: results.documents.length,
          executed_by_approver: approverId,
          original_user: wizardData.user_id,
          original_user_role: wizardData.user_role,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: 'SYSTEM'
      }
    });

    // Parcel creation audit log
    await tx.audit_logs.create({
      data: {
        user_id: approverId,
        action_type: AuditAction.CREATE,
        entity_type: 'land_parcels',
        entity_id: results.parcel.upin,
        changes: {
          action: 'create_parcel',
          upin: results.parcel.upin,
          file_number: results.parcel.file_number,
          sub_city_id: results.parcel.sub_city_id,
          tenure_type: results.parcel.tenure_type,
          total_area_m2: results.parcel.total_area_m2,
          actor_id: approverId,
          actor_role: 'APPROVER',
          original_requester: wizardData.user_id,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        ip_address: 'SYSTEM'
      }
    });

    // Owner creation audit logs
    if (results.owners.length > 0) {
      for (const owner of results.owners) {
        await tx.audit_logs.create({
          data: {
            user_id: approverId,
            action_type: AuditAction.CREATE,
            entity_type: 'owners',
            entity_id: owner.owner_id,
            changes: {
              action: 'create_owner',
              full_name: owner.full_name,
              national_id: owner.national_id,
              parcel_upin: results.parcel.upin,
              actor_id: approverId,
              actor_role: 'APPROVER',
              original_requester: wizardData.user_id,
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date(),
            ip_address: 'SYSTEM'
          }
        });
      }
    }

    // Lease creation audit log if exists
    if (results.lease) {
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.CREATE,
          entity_type: 'lease_agreements',
          entity_id: results.lease.lease_id,
          changes: {
            action: 'create_lease',
            upin: results.lease.upin,
            total_lease_amount: results.lease.total_lease_amount,
            down_payment_amount: results.lease.down_payment_amount,
            other_payment: results.lease.other_payment,
            lease_period_years: results.lease.lease_period_years,
            payment_term_years: results.lease.payment_term_years,
            price_per_m2: results.lease.price_per_m2,
            start_date: results.lease.start_date,
            expiry_date: results.lease.expiry_date,
            contract_date: results.lease.contract_date,
            annual_installment: results.lease.annual_installment,
            bills_created: results.bills?.length || 0,
            actor_id: approverId,
            actor_role: 'APPROVER',
            original_requester: wizardData.user_id,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      // Bill creation audit log if bills exist
      if (results.bills && results.bills.length > 0) {
        await tx.audit_logs.create({
          data: {
            user_id: approverId,
            action_type: AuditAction.CREATE,
            entity_type: 'billing_records',
            entity_id: results.bills[0].bill_id,  // Changed from billing_record_id to bill_id
            changes: {
              action: 'generate_lease_bills',
              upin: results.lease.upin,
              lease_id: results.lease.lease_id,
              bills_count: results.bills.length,
              total_amount_due: results.bills.reduce((sum: number, bill: any) => sum + bill.amount_due, 0),
              first_due_date: results.bills[0]?.due_date,
              last_due_date: results.bills[results.bills.length - 1]?.due_date,
              actor_id: approverId,
              actor_role: 'APPROVER',
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date(),
            ip_address: 'SYSTEM'
          }
        });
      }
    }

    // Document creation audit log if documents exist
    if (results.documents && results.documents.length > 0) {
      // Filter out undefined document types and get unique document types
      const documentTypes = [...new Set(
        results.documents
          .map((doc: any) => doc.doc_type)  // Use doc_type field (not document_type)
          .filter((type: string | undefined) => type !== undefined && type !== null)
      )];

      // Get the first document's doc_id (not document_id)
      const firstDocId = results.documents[0]?.doc_id;

      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.CREATE,
          entity_type: 'documents',
          entity_id: firstDocId || `batch_${results.parcel.upin}`,
          changes: {
            action: 'upload_documents',
            parcel_upin: results.parcel.upin,
            documents_count: results.documents.length,
            document_types: documentTypes,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });
    }
  }
  // ========== PARCEL ACTIONS ==========

  async executeCreateParcel(tx: any, data: CreateParcelData, approverId: string) {
    try {
      // Validate parcel doesn't already exist
      const existingParcel = await tx.land_parcels.findFirst({
        where: {
          OR: [
            { upin: data.upin },
            { file_number: data.file_number },
          ],
          is_deleted: false,
        },
      });

      if (existingParcel) {
        const conflictField = existingParcel.upin === data.upin ? 'UPIN' : 'file_number';
        throw new Error(`${conflictField} already exists`);
      }

      // Create parcel
      const parcel = await tx.land_parcels.create({
        data: {
          upin: data.upin,
          file_number: data.file_number,
          sub_city_id: data.sub_city_id,
          tabia: data.tabia || '',
          ketena: data.ketena || '',
          block: data.block || '',
          total_area_m2: data.total_area_m2,
          land_use: data.land_use,
          land_grade: data.land_grade || 1.0,
          tenure_type: data.tenure_type || 'OLD_POSSESSION',
          boundary_coords: data.boundary_coords,
          boundary_north: data.boundary_north,
          boundary_south: data.boundary_south,
          boundary_west: data.boundary_west,
          boundary_east: data.boundary_east,
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date(),
          last_modified_by: approverId
        }
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.CREATE,
          entity_type: 'land_parcels',
          entity_id: parcel.upin,
          changes: {
            action: 'create_parcel',
            upin: parcel.upin,
            file_number: parcel.file_number,
            sub_city_id: parcel.sub_city_id,
            total_area_m2: parcel.total_area_m2,
            land_use: parcel.land_use,
            tenure_type: parcel.tenure_type,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'PARCEL_CREATE',
        parcel_upin: parcel.upin,
        file_number: parcel.file_number
      };
    } catch (error) {
      console.error('Execute create parcel error:', error);
      throw error;
    }
  }

  async executeUpdateParcel(tx: any, upin: string, data: UpdateParcelData, approverId: string) {
    try {
      // Get current parcel for audit
      const currentParcel = await tx.land_parcels.findUnique({
        where: { upin, is_deleted: false }
      });

      if (!currentParcel) {
        throw new Error('Parcel not found');
      }

      const updates: any = {};
      const changesForAudit: any = {};

      // Apply validated changes
      for (const [key, value] of Object.entries(data.changes)) {
        if (value !== undefined) {
          updates[key] = value;
          
          // Track changes for audit
          const currentValue = currentParcel[key as keyof typeof currentParcel];
          if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
            changesForAudit[key] = {
              from: currentValue,
              to: value
            };
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('No valid changes to apply');
      }

      // Update parcel
      const updatedParcel = await tx.land_parcels.update({
        where: { upin },
        data: {
          ...updates,
          updated_at: new Date(),
          last_modified_by: approverId
        }
      });

      // Create audit log if there were changes
      if (Object.keys(changesForAudit).length > 0) {
        await tx.audit_logs.create({
          data: {
            user_id: approverId,
            action_type: AuditAction.UPDATE,
            entity_type: 'land_parcels',
            entity_id: upin,
            changes: {
              action: 'update_parcel',
              changed_fields: changesForAudit,
              actor_id: approverId,
              actor_role: 'APPROVER',
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date(),
            ip_address: 'SYSTEM'
          }
        });
      }

      return {
        success: true,
        action: 'PARCEL_UPDATE',
        parcel_upin: upin,
        changes_applied: Object.keys(changesForAudit)
      };
    } catch (error) {
      console.error('Execute update parcel error:', error);
      throw error;
    }
  }

  async executeDeleteParcel(tx: any, upin: string, data: DeleteParcelData, approverId: string) {
    try {
      // Get current parcel for audit
      const currentParcel = await tx.land_parcels.findUnique({
        where: { upin, is_deleted: false },
        include: {
          owners: {
            where: { is_active: true, is_deleted: false },
            include: { owner: true }
          }
        }
      });

      if (!currentParcel) {
        throw new Error('Parcel not found');
      }

      // Validate deletion constraints
      const activeOwners = currentParcel.owners.length;
      if (activeOwners > 0) {
        throw new Error(`Cannot delete parcel with ${activeOwners} active owners`);
      }

      const activeBilling = await tx.billing_records.count({
        where: { 
          upin, 
          is_deleted: false,
          payment_status: { in: [PaymentStatus.UNPAID, PaymentStatus.OVERDUE] }
        },
      });

      if (activeBilling > 0) {
        throw new Error(`Cannot delete parcel with ${activeBilling} unpaid bills`);
      }

      const childParcels = await tx.land_parcels.count({
        where: { 
          parent_upin: upin,
          is_deleted: false
        }
      });

      if (childParcels > 0) {
        throw new Error(`Cannot delete parcel with ${childParcels} child parcels`);
      }

      const activeLease = await tx.lease_agreements.count({
        where: { 
          upin,
          is_deleted: false,
          status: 'ACTIVE'
        }
      });

      if (activeLease > 0) {
        throw new Error(`Cannot delete parcel with ${activeLease} active lease`);
      }

      const activeEncumbrances = await tx.encumbrances.count({
        where: { 
          upin,
          is_deleted: false,
          status: 'ACTIVE'
        }
      });

      if (activeEncumbrances > 0) {
        throw new Error(`Cannot delete parcel with ${activeEncumbrances} active encumbrances`);
      }

      // Soft delete parcel
      const deletedParcel = await tx.land_parcels.update({
        where: { upin },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: approverId,
          updated_at: new Date(),
          status: 'RETIRED',
          file_number: `${currentParcel.file_number}_deleted_${Date.now()}`,
        }
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.DELETE,
          entity_type: 'land_parcels',
          entity_id: upin,
          changes: {
            action: 'soft_delete_parcel',
            original_file_number: currentParcel.file_number,
            new_file_number: deletedParcel.file_number,
            reason: data.reason,
            sub_city_id: currentParcel.sub_city_id,
            total_area_m2: currentParcel.total_area_m2,
            active_owners_at_deletion: activeOwners,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'PARCEL_DELETE',
        parcel_upin: upin,
        original_file_number: currentParcel.file_number,
        new_file_number: deletedParcel.file_number,
        deleted_at: deletedParcel.deleted_at
      };
    } catch (error) {
      console.error('Execute delete parcel error:', error);
      throw error;
    }
  }

async executeTransferOwnership(tx: any, upin: string, data: TransferOwnershipData, approverId: string) {
    try {
      const { from_owner_id, to_owner_id, transfer_type, transfer_price, reference_no } = data;

      // Basic validations
      if (!to_owner_id || !transfer_type) {
        throw new Error('to_owner_id and transfer_type are required');
      }

      if (from_owner_id && from_owner_id === to_owner_id) {
        throw new Error('Self-transfer is not allowed');
      }

      // Define interface for parcel owner with owner relation
      interface ParcelOwnerWithOwner {
        parcel_owner_id: string;
        upin: string;
        owner_id: string;
        is_active: boolean;
        acquired_at: Date | null;
        retired_at: Date | null;
        is_deleted: boolean;
        created_at: Date;
        updated_at: Date;
        owner: {
          owner_id: string;
          full_name: string;
        };
      }

      // Get current active owners
      const activeOwners: ParcelOwnerWithOwner[] = await tx.parcel_owners.findMany({
        where: {
          upin,
          is_active: true,
          is_deleted: false,
        },
        include: {
          owner: {
            select: { owner_id: true, full_name: true },
          },
        },
      });

      if (activeOwners.length === 0) {
        throw new Error('NO_ACTIVE_OWNERS');
      }

      // Validate FROM owner
      let fromOwnerRecord: ParcelOwnerWithOwner | undefined;
      if (from_owner_id) {
        fromOwnerRecord = activeOwners.find((po: ParcelOwnerWithOwner) => po.owner_id === from_owner_id);
        if (!fromOwnerRecord) {
          throw new Error('FROM_OWNER_NOT_ACTIVE');
        }
      }

      // Check if TO owner exists in system
      const toOwner = await tx.owners.findUnique({
        where: { owner_id: to_owner_id, is_deleted: false },
      });

      if (!toOwner) {
        throw new Error('TO_OWNER_NOT_FOUND');
      }

      // Check if TO owner is already active on parcel
      const existingToOwnerRecord = activeOwners.find((po: ParcelOwnerWithOwner) => po.owner_id === to_owner_id);

      // Create event snapshot
      const snapshot = {
        timestamp: new Date().toISOString(),
        owners_before: activeOwners.map((po: ParcelOwnerWithOwner) => ({
          id: po.owner_id,
          name: po.owner.full_name,
        })),
        transfer_type,
        transfer_price,
        reference_no,
      };

      // Perform updates
      const updates: Promise<any>[] = [];

      // Update tenure to LEASE unless it's heredity
      if (transfer_type !== "HEREDITY") {
        const leaseTenure = await tx.configurations.findFirst({
          where: {
            category: ConfigCategory.LAND_TENURE,
            key: "LEASE",
            is_active: true,
            is_deleted: false,
          },
        });

        if (leaseTenure) {
          updates.push(
            tx.land_parcels.update({
              where: { upin },
              data: { 
                tenure_type: "LEASE",
                updated_at: new Date()
              },
            })
          );
        }
      }

      // Handle FROM owner
      if (from_owner_id && fromOwnerRecord) {
        updates.push(
          tx.parcel_owners.update({
            where: { parcel_owner_id: fromOwnerRecord.parcel_owner_id },
            data: {
              is_active: false,
              retired_at: new Date(),
              updated_at: new Date(),
            },
          })
        );
      }

      // Handle TO owner
      if (existingToOwnerRecord) {
        updates.push(
          tx.parcel_owners.update({
            where: { parcel_owner_id: existingToOwnerRecord.parcel_owner_id },
            data: {
              acquired_at: new Date(),
              updated_at: new Date(),
            },
          })
        );
      } else {
        updates.push(
          tx.parcel_owners.create({
            data: {
              upin,
              owner_id: to_owner_id,
              acquired_at: new Date(),
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
          })
        );
      }

      await Promise.all(updates);

      // Record transfer in history
      const historyEntry = await tx.ownership_history.create({
        data: {
          upin,
          transfer_type,
          transfer_date: new Date(),
          transfer_price: transfer_price ? Number(transfer_price) : null,
          reference_no: reference_no || null,
          from_owner_id: from_owner_id || null,
          to_owner_id: to_owner_id,
          event_snapshot: snapshot as any,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Get final active owners
      const finalOwners = await tx.parcel_owners.findMany({
        where: { upin, is_active: true, is_deleted: false },
        include: { owner: true }
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.UPDATE,
          entity_type: 'parcel_owners',
          entity_id: `${upin}_${to_owner_id}`,
          changes: {
            action: 'transfer_ownership',
            upin,
            from_owner_id,
            to_owner_id,
            transfer_type,
            transfer_price,
            reference_no,
            parcel_tenure_updated: transfer_type !== "HEREDITY",
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'OWNERSHIP_TRANSFER',
        parcel_upin: upin,
        from_owner_id,
        to_owner_id,
        history_id: historyEntry.history_id,
        final_owners_count: finalOwners.length
      };
    } catch (error) {
      console.error('Execute transfer ownership error:', error);
      throw error;
    }
  }

  async executeAddParcelOwner(tx: any, upin: string, data: AddParcelOwnerData, approverId: string) {

         interface ParcelOwnerRecord {
        parcel_owner_id: string;
        upin: string;
        owner_id: string;
        acquired_at: Date | null;
        is_active: boolean;
        retired_at: Date | null;
        is_deleted: boolean;
        created_at: Date;
        updated_at: Date;
      } 
    try {
      const { owner_id, acquired_at } = data;

      // Validate required fields
      if (!owner_id) {
        throw new Error('owner_id is required');
      }

      // Check if parcel exists
      const parcel = await tx.land_parcels.findUnique({
        where: { upin, is_deleted: false }
      });

      if (!parcel) {
        throw new Error('Parcel not found');
      }

      // Check if owner exists
      const owner = await tx.owners.findUnique({
        where: { owner_id, is_deleted: false }
      });

      if (!owner) {
        throw new Error('Owner not found');
      }

      // Check existing active owners
      const existingParcelOwners = await tx.parcel_owners.findMany({
        where: {
          upin,
          is_deleted: false,
          is_active: true,
          retired_at: null,
        },
      });

      const isFirstOwner = existingParcelOwners.length === 0;

      // Determine acquired_at date
      const acquiredDate = acquired_at ? new Date(acquired_at) : new Date();
      
      if (acquiredDate > new Date()) {
        throw new Error('Acquisition date cannot be in the future');
      }

      if (isFirstOwner && acquiredDate < new Date('1900-01-01')) {
        throw new Error('Invalid acquisition date for first owner');
      }

      // Create parcel-owner link
      const parcelOwner = await tx.parcel_owners.create({
        data: {
          upin,
          owner_id,
          acquired_at: acquiredDate,
          is_active: true,
          retired_at: null,
          created_at: new Date(),
          updated_at: new Date()
        },
      });

      // Create ownership history record
      const historyEntry = await tx.ownership_history.create({
        data: {
          upin,
          to_owner_id: owner_id,
          transfer_type: isFirstOwner ? "FIRST_OWNER" : "CO_OWNER_ADDITION",
          event_snapshot: {
            parcel: parcel.upin,
            owner: owner.full_name,
            owner_id,
            acquired_at: acquiredDate,
            is_first_owner: isFirstOwner,
            existing_owners_before: existingParcelOwners.map((po : ParcelOwnerRecord) => ({
              owner_id: po.owner_id,
            })),
          } as any,
          reference_no: `${isFirstOwner ? 'FIRST_OWNER' : 'CO_OWNER'}-${Date.now()}`,
          transfer_date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.CREATE,
          entity_type: 'parcel_owners',
          entity_id: parcelOwner.parcel_owner_id,
          changes: {
            action: isFirstOwner ? 'add_first_owner' : 'add_co_owner',
            upin,
            owner_id,
            owner_name: owner.full_name,
            acquired_at: parcelOwner.acquired_at,
            is_first_owner: isFirstOwner,
            existing_owners_count: existingParcelOwners.length,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: isFirstOwner ? 'ADD_FIRST_OWNER' : 'ADD_CO_OWNER',
        parcel_upin: upin,
        owner_id,
        parcel_owner_id: parcelOwner.parcel_owner_id,
        history_id: historyEntry.history_id
      };
    } catch (error) {
      console.error('Execute add parcel owner error:', error);
      throw error;
    }
  }

async executeSubdivideParcel(tx: any, upin: string, data: SubdivideParcelData, approverId: string) {
    try {
      const { childParcels } = data;

      // Validate child parcels
      if (!Array.isArray(childParcels) || childParcels.length < 2) {
        throw new Error('At least two child parcels are required');
      }

      // Define types for parent with owners
      interface ParcelOwnerWithOwner {
        owner_id: string;
        owner: {
          full_name: string;
        };
      }

      interface ParentParcel {
        upin: string;
        file_number: string;
        sub_city_id: string;
        tabia: string;
        ketena: string;
        block: string;
        total_area_m2: number | string | bigint;
        land_use: string | null;
        land_grade: number;
        tenure_type: string;
        status: string;
        boundary_coords: any;
        boundary_north: string | null;
        boundary_east: string | null;
        boundary_south: string | null;
        boundary_west: string | null;
        owners: ParcelOwnerWithOwner[];
      }

      // Get parent with active owners
      const parent: ParentParcel | null = await tx.land_parcels.findUnique({
        where: { upin, is_deleted: false },
        include: {
          owners: {
            where: { 
              is_active: true, 
              is_deleted: false 
            },
            include: { 
              owner: true 
            },
          },
        },
      });

      if (!parent) throw new Error('PARENT_NOT_FOUND');
      if (parent.status !== 'ACTIVE') throw new Error('PARENT_NOT_ACTIVE');

      // Validate child parcels
      for (const childData of childParcels) {
        if (!childData.upin?.trim()) {
          throw new Error('CHILD_UPIN_REQUIRED');
        }
        if (!childData.file_number?.trim()) {
          throw new Error('CHILD_FILE_NUMBER_REQUIRED');
        }
        if (!childData.total_area_m2 || Number(childData.total_area_m2) <= 0) {
          throw new Error('INVALID_CHILD_AREA');
        }
        
        // Check for duplicate UPIN
        const existingParcel = await tx.land_parcels.findUnique({
          where: { upin: childData.upin },
        });
        
        if (existingParcel) {
          throw new Error(`DUPLICATE_UPIN: ${childData.upin}`);
        }
      }

      // Area validation
      const totalChildArea = childParcels.reduce(
        (sum: number, c: any) => sum + Number(c.total_area_m2), 
        0
      );
      const parentArea = Number(parent.total_area_m2);
      
      if (Math.abs(totalChildArea - parentArea) > 0.1) {
        throw new Error('CHILD_AREAS_MUST_MATCH_PARENT');
      }

      // Retire parent
      await tx.land_parcels.update({
        where: { upin },
        data: { 
          status: 'RETIRED',
          updated_at: new Date(),
        },
      });

      const createdChildren: any[] = [];
      const createdOwnerships: any[] = [];

      // Create children and copy owners
      for (const childData of childParcels) {
        const child = await tx.land_parcels.create({
          data: {
            upin: childData.upin,
            file_number: childData.file_number,
            sub_city_id: parent.sub_city_id,
            tabia: parent.tabia,
            ketena: parent.ketena,
            block: parent.block,
            total_area_m2: childData.total_area_m2,
            land_use: childData.land_use || parent.land_use,
            land_grade: childData.land_grade || parent.land_grade,
            tenure_type: parent.tenure_type,
            parent_upin: upin,
            status: 'ACTIVE',
            boundary_coords: childData.boundary_coords || parent.boundary_coords,
            boundary_north: childData.boundary_north || parent.boundary_north,
            boundary_east: childData.boundary_east || parent.boundary_east,
            boundary_south: childData.boundary_south || parent.boundary_south,
            boundary_west: childData.boundary_west || parent.boundary_west,
            created_at: new Date(),
            updated_at: new Date()
          },
        });

        // Copy all active owners from parent
        for (const parcelOwner of parent.owners) {
          const newOwner = await tx.parcel_owners.create({
            data: {
              upin: child.upin,
              owner_id: parcelOwner.owner_id,
              acquired_at: new Date(),
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
          });
          createdOwnerships.push(newOwner);
        }

        createdChildren.push(child);
      }

      // Create ownership history for subdivision
      await tx.ownership_history.create({
        data: {
          upin,
          transfer_type: "SUBDIVISION",
          event_snapshot: {
            parent_parcel: {
              upin: parent.upin,
              area_m2: parentArea,
              owners: parent.owners.map((po: ParcelOwnerWithOwner) => ({
                owner_id: po.owner_id,
                owner_name: po.owner.full_name,
              })),
            },
            child_parcels: createdChildren.map((c: any) => ({
              upin: c.upin,
              file_number: c.file_number,
              area_m2: c.total_area_m2,
            })),
          } as any,
          reference_no: `SUBDIVISION-${Date.now()}`,
          transfer_date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.UPDATE,
          entity_type: 'land_parcels',
          entity_id: upin,
          changes: {
            action: 'subdivide_parcel',
            parent_upin: upin,
            parent_area: parentArea,
            parent_status_after: 'RETIRED',
            child_count: childParcels.length,
            children: childParcels.map((c: any) => ({
              upin: c.upin,
              file_number: c.file_number,
              area_m2: c.total_area_m2,
            })),
            total_child_area: totalChildArea,
            owners_copied: parent.owners.length,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'SUBDIVIDE_PARCEL',
        parent_upin: upin,
        parent_status: 'RETIRED',
        child_count: createdChildren.length,
        children: createdChildren.map((c: any) => ({
          upin: c.upin,
          file_number: c.file_number,
          total_area_m2: Number(c.total_area_m2)
        }))
      };
    } catch (error) {
      console.error('Execute subdivide parcel error:', error);
      throw error;
    }
  }

  // ========== OWNER ACTIONS ==========

  async executeCreateOwner(tx: any, data: CreateOwnerData, approverId: string) {
    try {
      // Check if owner already exists
      const existingOwner = await tx.owners.findFirst({
        where: { 
          national_id: data.national_id,
          is_deleted: false
        }
      });

      if (existingOwner) {
        throw new Error('Owner with this national ID already exists');
      }

      // Create owner
      const owner = await tx.owners.create({
        data: {
          full_name: data.full_name,
          national_id: data.national_id,
          tin_number: data.tin_number,
          phone_number: data.phone_number,
          sub_city_id: data.sub_city_id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: approverId
        }
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.CREATE,
          entity_type: 'owners',
          entity_id: owner.owner_id,
          changes: {
            action: 'create_owner',
            owner_id: owner.owner_id,
            full_name: owner.full_name,
            national_id: owner.national_id,
            sub_city_id: owner.sub_city_id,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'OWNER_CREATE',
        owner_id: owner.owner_id,
        full_name: owner.full_name,
        national_id: owner.national_id
      };
    } catch (error) {
      console.error('Execute create owner error:', error);
      throw error;
    }
  }

  async executeUpdateOwner(tx: any, owner_id: string, data: UpdateOwnerData, approverId: string) {
    try {
      // Get current owner for audit
      const currentOwner = await tx.owners.findUnique({
        where: { owner_id, is_deleted: false }
      });

      if (!currentOwner) {
        throw new Error('Owner not found');
      }

      const updates: any = {};
      const changesForAudit: any = {};

      // Apply validated changes
      for (const [key, value] of Object.entries(data.changes)) {
        if (value !== undefined) {
          // Special validation for national_id - check uniqueness
          if (key === 'national_id' && value !== currentOwner.national_id) {
            const existingWithNationalId = await tx.owners.findFirst({
              where: { 
                national_id: value,
                owner_id: { not: owner_id },
                is_deleted: false 
              }
            });
            
            if (existingWithNationalId) {
              throw new Error('National ID already exists for another owner');
            }
          }

          updates[key] = value;
          
          // Track changes for audit
          const currentValue = currentOwner[key as keyof typeof currentOwner];
          if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
            changesForAudit[key] = {
              from: currentValue,
              to: value
            };
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('No valid changes to apply');
      }

      // Update owner
      const updatedOwner = await tx.owners.update({
        where: { owner_id },
        data: {
          ...updates,
          updated_at: new Date(),
          last_modified_by: approverId
        }
      });

      // Create audit log if there were changes
      if (Object.keys(changesForAudit).length > 0) {
        await tx.audit_logs.create({
          data: {
            user_id: approverId,
            action_type: AuditAction.UPDATE,
            entity_type: 'owners',
            entity_id: owner_id,
            changes: {
              action: 'update_owner',
              changed_fields: changesForAudit,
              actor_id: approverId,
              actor_role: 'APPROVER',
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date(),
            ip_address: 'SYSTEM'
          }
        });
      }

      return {
        success: true,
        action: 'OWNER_UPDATE',
        owner_id,
        changes_applied: Object.keys(changesForAudit)
      };
    } catch (error) {
      console.error('Execute update owner error:', error);
      throw error;
    }
  }

  async executeDeleteOwner(tx: any, owner_id: string, data: DeleteOwnerData, approverId: string) {
    try {
      // Get current owner for audit
      const currentOwner = await tx.owners.findUnique({
        where: { owner_id, is_deleted: false },
        include: {
          parcels: {
            where: { is_active: true, is_deleted: false },
            include: { parcel: true }
          }
        }
      });

      if (!currentOwner) {
        throw new Error('Owner not found');
      }

      // Check if owner has active parcels
      if (currentOwner.parcels.length > 0) {
        const parcelList = currentOwner.parcels.map((p: any) => p.parcel.upin).join(', ');
        throw new Error(`Owner has active parcels: ${parcelList}. Unlink parcels before deletion.`);
      }

      // Soft delete owner
      const deletedOwner = await tx.owners.update({
        where: { owner_id },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: approverId,
          updated_at: new Date()
        }
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.DELETE,
          entity_type: 'owners',
          entity_id: owner_id,
          changes: {
            action: 'soft_delete_owner',
            owner_id,
            full_name: currentOwner.full_name,
            national_id: currentOwner.national_id,
            reason: data.reason,
            active_parcels_at_deletion: currentOwner.parcels.length,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'OWNER_DELETE',
        owner_id,
        deleted_at: deletedOwner.deleted_at
      };
    } catch (error) {
      console.error('Execute delete owner error:', error);
      throw error;
    }
  }

  // ========== LEASE ACTIONS ==========

  async executeCreateLease(tx: any, data: CreateLeaseData, approverId: string) {
    try {
      // Validate parcel exists and is LEASE tenure
      const landParcel = await tx.land_parcels.findUnique({
        where: { upin: data.upin, is_deleted: false }
      });

      if (!landParcel) {
        throw new Error('Land parcel not found');
      }

      if (landParcel.tenure_type !== "LEASE") {
        throw new Error('Land tenure type must be LEASE to register lease agreement');
      }

      // Check if lease already exists for this parcel
      const existingLease = await tx.lease_agreements.findFirst({
        where: { upin: data.upin, is_deleted: false }
      });

      if (existingLease) {
        throw new Error('Lease already exists for this parcel');
      }

      // Calculate expiry date
      const startDate = new Date(data.start_date);
      const expiryDate = new Date(startDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + data.lease_period_years);

      // Calculate payment details
      const totalLeaseAmountNum = Number(data.total_lease_amount ?? 0);
      const downPaymentNum = Number(data.down_payment_amount ?? 0);
      
      const { principal, annualInstallment } = calculateLeasePaymentDetails(
        totalLeaseAmountNum,
        downPaymentNum,
        data.payment_term_years
      );

      // Create lease
      const lease = await tx.lease_agreements.create({
        data: {
          upin: data.upin,
          total_lease_amount: data.total_lease_amount,
          contract_date: new Date(data.contract_date),
          down_payment_amount: data.down_payment_amount,
          other_payment: data.other_payment || 0,
          lease_period_years: data.lease_period_years,
          legal_framework: data.legal_framework || '',
          payment_term_years: data.payment_term_years,
          price_per_m2: data.price_per_m2 || 0,
          start_date: startDate,
          expiry_date: expiryDate,
          annual_installment: annualInstallment,
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: approverId
        }
      });

      // Generate bills
      const bills = await generateLeaseBillsInTx(tx, {
        ...lease,
        annualMainPayment: annualInstallment,
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.CREATE,
          entity_type: 'lease_agreements',
          entity_id: lease.lease_id,
          changes: {
            action: 'create_lease',
            upin: lease.upin,
            total_lease_amount: lease.total_lease_amount,
            down_payment_amount: lease.down_payment_amount,
            lease_period_years: lease.lease_period_years,
            payment_term_years: lease.payment_term_years,
            start_date: lease.start_date,
            expiry_date: lease.expiry_date,
            annual_installment: lease.annual_installment,
            bills_created: bills.length,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'LEASE_CREATE',
        lease_id: lease.lease_id,
        upin: lease.upin,
        bills_created: bills.length
      };
    } catch (error) {
      console.error('Execute create lease error:', error);
      throw error;
    }
  }

  async executeUpdateLease(tx: any, lease_id: string, data: UpdateLeaseData, approverId: string) {
    try {
      // Get current lease for audit
      const existingLease = await tx.lease_agreements.findUnique({
        where: { lease_id, is_deleted: false }
      });

      if (!existingLease) {
        throw new Error('Lease not found');
      }

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

      // Process updates
      Object.keys(data.changes).forEach((key) => {
        if (allowedUpdates[key as keyof typeof allowedUpdates]) {
          let value = data.changes[key as keyof typeof data.changes];

          // Handle date conversions
          if (["start_date", "expiry_date", "contract_date"].includes(key)) {
            if (typeof value === "string") {
              const parsedDate = new Date(value);
              if (isNaN(parsedDate.getTime())) {
                throw new Error(`Invalid date format for ${key}`);
              }
              value = parsedDate;
            }
          }

          // Handle number conversions
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
              throw new Error(`Invalid number for ${key}`);
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
        throw new Error('No valid fields provided for update');
      }

      // Handle lease term updates that require bill regeneration
      const requiresBillRegeneration = 
        updates.total_lease_amount !== undefined ||
        updates.down_payment_amount !== undefined ||
        updates.other_payment !== undefined ||
        updates.payment_term_years !== undefined ||
        updates.start_date !== undefined;

      // Calculate derived values
      const totalLeaseAmount = updates.total_lease_amount ?? existingLease.total_lease_amount;
      const downPaymentAmount = updates.down_payment_amount ?? existingLease.down_payment_amount;
      const otherPaymentAmount = updates.other_payment ?? existingLease.other_payment;
      const paymentTermYears = updates.payment_term_years ?? existingLease.payment_term_years;
      const leasePeriodYears = updates.lease_period_years ?? existingLease.lease_period_years;
      const startDateVal = updates.start_date ?? existingLease.start_date;

      // Update expiry date if start date or lease period changed
      if (updates.start_date || updates.lease_period_years) {
        const startDate = new Date(startDateVal);
        const expiryDate = new Date(startDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + leasePeriodYears);
        updates.expiry_date = expiryDate;
        
        if (existingLease.expiry_date?.getTime() !== expiryDate.getTime()) {
          changesForAudit.expiry_date = {
            from: existingLease.expiry_date,
            to: expiryDate
          };
        }
      }

      // Calculate new annual installment if needed
      const principal = Number(totalLeaseAmount ?? 0) - (Number(downPaymentAmount ?? 0) + Number(otherPaymentAmount ?? 0));
      if (principal <= 0) {
        throw new Error('Down payment plus other payment must be less than total lease amount');
      }

      const annualMainPayment = paymentTermYears > 0 ? principal / paymentTermYears : 0;
      updates.annual_installment = annualMainPayment;
      
      if (Number(existingLease.annual_installment) !== annualMainPayment) {
        changesForAudit.annual_installment = {
          from: existingLease.annual_installment,
          to: annualMainPayment
        };
      }

      // Update lease
      const updatedLease = await tx.lease_agreements.update({
        where: { lease_id },
        data: {
          ...updates,
          updated_at: new Date(),
          last_modified_by: approverId
        },
      });

      let billRegenerationResult = null;
      if (requiresBillRegeneration) {
        // Delete existing bills
        const deletedBills = await tx.billing_records.deleteMany({
          where: { lease_id },
        });

        // Generate new bills
        const newBills = await generateLeaseBillsInTx(tx, {
          ...updatedLease,
          annualMainPayment,
        });

        billRegenerationResult = {
          bills_deleted: deletedBills.count,
          bills_created: newBills.length
        };
      }

      // Create audit log
      if (Object.keys(changesForAudit).length > 0) {
        await tx.audit_logs.create({
          data: {
            user_id: approverId,
            action_type: AuditAction.UPDATE,
            entity_type: 'lease_agreements',
            entity_id: lease_id,
            changes: {
              action: 'update_lease',
              changed_fields: changesForAudit,
              bill_regeneration: billRegenerationResult,
              actor_id: approverId,
              actor_role: 'APPROVER',
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date(),
            ip_address: 'SYSTEM'
          }
        });
      }

      return {
        success: true,
        action: 'LEASE_UPDATE',
        lease_id,
        changes_applied: Object.keys(changesForAudit),
        bill_regeneration: billRegenerationResult
      };
    } catch (error) {
      console.error('Execute update lease error:', error);
      throw error;
    }
  }

  async executeDeleteLease(tx: any, lease_id: string, data: DeleteLeaseData, approverId: string) {
    try {
      // Get current lease for audit
      const existingLease = await tx.lease_agreements.findUnique({
        where: { lease_id, is_deleted: false }
      });

      if (!existingLease) {
        throw new Error('Lease not found');
      }

      // Check for active unpaid bills
      const activeBills = await tx.billing_records.count({
        where: {
          lease_id,
          is_deleted: false,
          payment_status: {
            in: ['UNPAID', 'OVERDUE']
          }
        }
      });

      if (activeBills > 0) {
        throw new Error(`Cannot delete lease with ${activeBills} unpaid or overdue bill(s)`);
      }

      // Soft delete lease
      const deletedLease = await tx.lease_agreements.update({
        where: { lease_id },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: approverId,
          updated_at: new Date(),
          status: 'EXPIRED'
        }
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.DELETE,
          entity_type: 'lease_agreements',
          entity_id: lease_id,
          changes: {
            action: 'soft_delete_lease',
            upin: existingLease.upin,
            lease_period_years: existingLease.lease_period_years,
            total_lease_amount: existingLease.total_lease_amount,
            active_bills_at_deletion: activeBills,
            reason: data.reason,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'LEASE_DELETE',
        lease_id,
        deleted_at: deletedLease.deleted_at
      };
    } catch (error) {
      console.error('Execute delete lease error:', error);
      throw error;
    }
  }

  // ========== ENCUMBRANCE ACTIONS ==========

  async executeCreateEncumbrance(tx: any, data: CreateEncumbranceData, approverId: string) {
    try {
      // Validate parcel exists
      const parcel = await tx.land_parcels.findFirst({
        where: { upin: data.upin, is_deleted: false },
      });

      if (!parcel) {
        throw new Error('Parcel not found');
      }

      // Check reference number uniqueness
      if (data.reference_number) {
        const existingRef = await tx.encumbrances.findFirst({
          where: { reference_number: data.reference_number, is_deleted: false },
        });
        if (existingRef) {
          throw new Error('Reference number already exists');
        }
      }

      const encumbrance = await tx.encumbrances.create({
        data: {
          upin: data.upin,
          type: data.type,
          issuing_entity: data.issuing_entity,
          reference_number: data.reference_number,
          status: data.status || EncumbranceStatus.ACTIVE,
          registration_date: data.registration_date ? new Date(data.registration_date) : new Date(),
          created_at: new Date(),
          updated_at: new Date(),
          created_by: approverId
        }
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.CREATE,
          entity_type: 'encumbrances',
          entity_id: encumbrance.encumbrance_id,
          changes: {
            action: 'create_encumbrance',
            upin: encumbrance.upin,
            type: encumbrance.type,
            issuing_entity: encumbrance.issuing_entity,
            reference_number: encumbrance.reference_number,
            status: encumbrance.status,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'ENCUMBRANCE_CREATE',
        encumbrance_id: encumbrance.encumbrance_id,
        upin: encumbrance.upin,
        type: encumbrance.type
      };
    } catch (error) {
      console.error('Execute create encumbrance error:', error);
      throw error;
    }
  }

  async executeUpdateEncumbrance(tx: any, encumbrance_id: string, data: UpdateEncumbranceData, approverId: string) {
    try {
      // Get current encumbrance for audit
      const currentEncumbrance = await tx.encumbrances.findUnique({
        where: { encumbrance_id, is_deleted: false }
      });

      if (!currentEncumbrance) {
        throw new Error('Encumbrance not found');
      }

      const updates: any = {};
      const changesForAudit: any = {};

      // Process updates
      for (const [key, value] of Object.entries(data.changes)) {
        if (value !== undefined) {
          // Check reference number uniqueness if changing
          if (key === 'reference_number' && value !== currentEncumbrance.reference_number) {
            const existing = await tx.encumbrances.findFirst({
              where: { 
                reference_number: value, 
                encumbrance_id: { not: encumbrance_id },
                is_deleted: false 
              },
            });
            if (existing) {
              throw new Error('Reference number already exists on another encumbrance');
            }
          }

          // Handle date conversion
          let finalValue = value;
          if (key === 'registration_date' && typeof value === 'string') {
            finalValue = new Date(value);
          }

          updates[key] = finalValue;
          
          // Track changes for audit
          const currentValue = currentEncumbrance[key as keyof typeof currentEncumbrance];
          if (JSON.stringify(currentValue) !== JSON.stringify(finalValue)) {
            changesForAudit[key] = {
              from: currentValue,
              to: finalValue
            };
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('No changes to apply');
      }

      const updatedEncumbrance = await tx.encumbrances.update({
        where: { encumbrance_id },
        data: {
          ...updates,
          updated_at: new Date(),
          last_modified_by: approverId
        }
      });

      // Create audit log if there were changes
      if (Object.keys(changesForAudit).length > 0) {
        await tx.audit_logs.create({
          data: {
            user_id: approverId,
            action_type: AuditAction.UPDATE,
            entity_type: 'encumbrances',
            entity_id: encumbrance_id,
            changes: {
              action: 'update_encumbrance',
              upin: currentEncumbrance.upin,
              changed_fields: changesForAudit,
              actor_id: approverId,
              actor_role: 'APPROVER',
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date(),
            ip_address: 'SYSTEM'
          }
        });
      }

      return {
        success: true,
        action: 'ENCUMBRANCE_UPDATE',
        encumbrance_id,
        changes_applied: Object.keys(changesForAudit)
      };
    } catch (error) {
      console.error('Execute update encumbrance error:', error);
      throw error;
    }
  }

  async executeDeleteEncumbrance(tx: any, encumbrance_id: string, data: DeleteEncumbranceData, approverId: string) {
    try {
      // Get current encumbrance for audit
      const currentEncumbrance = await tx.encumbrances.findUnique({
        where: { encumbrance_id }
      });

      if (!currentEncumbrance) {
        throw new Error('Encumbrance not found');
      }

      if (currentEncumbrance.is_deleted) {
        throw new Error('Encumbrance is already deleted');
      }

      const deletedEncumbrance = await tx.encumbrances.update({
        where: { encumbrance_id },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: approverId,
          updated_at: new Date(),
          status: 'RELEASED'
        }
      });

      // Create audit log
      await tx.audit_logs.create({
        data: {
          user_id: approverId,
          action_type: AuditAction.DELETE,
          entity_type: 'encumbrances',
          entity_id: encumbrance_id,
          changes: {
            action: 'soft_delete_encumbrance',
            upin: currentEncumbrance.upin,
            type: currentEncumbrance.type,
            previous_status: currentEncumbrance.status,
            new_status: deletedEncumbrance.status,
            reason: data.reason,
            actor_id: approverId,
            actor_role: 'APPROVER',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: 'SYSTEM'
        }
      });

      return {
        success: true,
        action: 'ENCUMBRANCE_DELETE',
        encumbrance_id,
        deleted_at: deletedEncumbrance.deleted_at
      };
    } catch (error) {
      console.error('Execute delete encumbrance error:', error);
      throw error;
    }
  }

  // ========== MAIN EXECUTOR (Updated to include Wizard) ==========

  async executeAction(
    entityType: string,
    actionType: string,
    entityId: string,
    requestData: any,
    approverId: string
  ) {
    return await prisma.$transaction(async (tx) => {
      switch (entityType) {
        case 'WIZARD_SESSION':
          // For wizard, actionType is always 'CREATE' (execution)
          if (actionType !== 'CREATE') {
            throw new Error(`Unsupported action for WIZARD_SESSION: ${actionType}`);
          }
          return await this.executeWizard(tx, requestData, approverId);

        case 'LAND_PARCELS':
          switch (actionType) {
            case 'CREATE':
              return await this.executeCreateParcel(tx, requestData, approverId);
            case 'UPDATE':
              return await this.executeUpdateParcel(tx, entityId, requestData, approverId);
            case 'DELETE':
              return await this.executeDeleteParcel(tx, entityId, requestData, approverId);
            case 'TRANSFER':
              return await this.executeTransferOwnership(tx, entityId, requestData, approverId);
            case 'ADD_OWNER':
              return await this.executeAddParcelOwner(tx, entityId, requestData, approverId);
            case 'SUBDIVIDE':
              return await this.executeSubdivideParcel(tx, entityId, requestData, approverId);
            default:
              throw new Error(`Unsupported action for LAND_PARCELS: ${actionType}`);
          }

        case 'OWNERS':
          switch (actionType) {
            case 'CREATE':
              return await this.executeCreateOwner(tx, requestData, approverId);
            case 'UPDATE':
              return await this.executeUpdateOwner(tx, entityId, requestData, approverId);
            case 'DELETE':
              return await this.executeDeleteOwner(tx, entityId, requestData, approverId);
            default:
              throw new Error(`Unsupported action for OWNERS: ${actionType}`);
          }

        case 'LEASE_AGREEMENTS':
          switch (actionType) {
            case 'CREATE':
              return await this.executeCreateLease(tx, requestData, approverId);
            case 'UPDATE':
              return await this.executeUpdateLease(tx, entityId, requestData, approverId);
            case 'DELETE':
              return await this.executeDeleteLease(tx, entityId, requestData, approverId);
            default:
              throw new Error(`Unsupported action for LEASE_AGREEMENTS: ${actionType}`);
          }

        case 'ENCUMBRANCES':
          switch (actionType) {
            case 'CREATE':
              return await this.executeCreateEncumbrance(tx, requestData, approverId);
            case 'UPDATE':
              return await this.executeUpdateEncumbrance(tx, entityId, requestData, approverId);
            case 'DELETE':
              return await this.executeDeleteEncumbrance(tx, entityId, requestData, approverId);
            default:
              throw new Error(`Unsupported action for ENCUMBRANCES: ${actionType}`);
          }

        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    });
  }

  // ========== HELPER METHOD FOR WIZARD SESSION UPDATE ==========
  
  async updateWizardSessionAfterExecution(tx: any, sessionId: string, approverId: string, success: boolean) {
    if (success) {
      // Update wizard session to MERGED after successful execution
      await tx.wizard_sessions.update({
        where: { session_id: sessionId },
        data: {
          status: 'MERGED',
          completed_at: new Date(),
          updated_at: new Date()
        }
      });

      // Clean up temporary documents
      await tx.wizard_documents_temp.deleteMany({
        where: { session_id: sessionId }
      });
    } else {
      // Mark as failed
      await tx.wizard_sessions.update({
        where: { session_id: sessionId },
        data: {
          status: 'FAILED',
          updated_at: new Date()
        }
      });
    }
  }
}