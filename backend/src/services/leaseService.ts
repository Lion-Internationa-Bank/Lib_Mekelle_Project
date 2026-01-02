// src/services/leaseService.ts
import prisma from '../config/prisma.ts';

interface CreateLeaseInput {
  lease_period_years: number;
  price_per_m2: number | string;
  total_lease_value?: number | string;
  down_payment_amount?: number | string;
  annual_installment?: number | string;
  payment_term_years?: number;
  contract_date: string; // yyyy-mm-dd
  legal_framework?: string;
  start_date?: string;
  end_date?: string;

  // holder info
  holder_full_name: string;
  holder_identity_type: string;
  holder_identity_number: string;
  holder_contact_phone?: string;
  holder_email?: string;
  holder_address?: string;

  // agreement document info (optional)
  document_type?: string;
  document_file_name?: string;
  document_file_path?: string;
  document_file_size_kb?: number;
  document_description?: string;
}

interface UpdateLeaseInput {
  lease_period_years?: number;
  price_per_m2?: number | string;
  total_lease_value?: number | string;
  down_payment_amount?: number | string;
  annual_installment?: number | string;
  payment_term_years?: number | null;
  contract_date?: string;
  legal_framework?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  current_holder_id?: string | null;
}

export class LeaseService {
  static async createLeaseForParcel(
    upin: string,
    input: CreateLeaseInput
  ) {
    const contractDate = new Date(input.contract_date);
    const startDate = input.start_date ? new Date(input.start_date) : undefined;
    const endDate = input.end_date ? new Date(input.end_date) : undefined;

    return prisma.$transaction(async (tx) => {
      // 1. Create or find lease holder
      let holder = await tx.lease_holders.findFirst({
        where: {
          identity_type: input.holder_identity_type,
          identity_number: input.holder_identity_number,
        },
      });

      if (!holder) {
        holder = await tx.lease_holders.create({
          data: {
            full_name: input.holder_full_name,
            identity_type: input.holder_identity_type,
            identity_number: input.holder_identity_number,
            contact_phone: input.holder_contact_phone ?? null,
            email: input.holder_email ?? null,
            address: input.holder_address ?? null,
          },
        });
      }

      // 2. Create lease agreement
      const lease = await tx.lease_agreements.create({
        data: {
          upin: upin,
          lease_period_years: Number(input.lease_period_years),
          price_per_m2: input.price_per_m2,
          total_lease_value: input.total_lease_value ?? null,
          down_payment_amount: input.down_payment_amount ?? null,
          annual_installment: input.annual_installment ?? null,
          payment_term_years: Number(input.payment_term_years) ?? null,
          contract_date: contractDate,
          legal_framework: input.legal_framework ?? null,
          start_date: startDate,
          end_date: endDate,
          current_holder_id: holder.holder_id,
        },
        include: {
          lease_holder: true,
          land_parcels: true,
        },
      });

      // 3. Optional: create agreement document if info is provided
      if (
        input.document_file_name &&
        input.document_file_path
      ) {
        await tx.documents.create({
          data: {
            upin: upin,
            lease_id: lease.lease_id,
            document_type: input.document_type || 'Lease Agreement',
            file_name: input.document_file_name,
            file_path: input.document_file_path,
            file_size_kb: input.document_file_size_kb,
            description:
              input.document_description ??
              `Lease agreement for parcel ${upin}`,
            upload_date: new Date(),
          },
        });
      }

      // 4. Insert initial lease_history record
      await tx.lease_history.create({
        data: {
          lease_id: lease.lease_id,
          action_type: 'CREATE',
          new_holder_id: holder.holder_id,
          change_date: new Date(),
          remarks: 'Lease created and holder assigned',
        },
      });

      return lease;
    });
  }

  static async getLease(upin: string, leaseId: string) {
    const lease = await prisma.lease_agreements.findFirst({
      where: {
        lease_id: leaseId,
        upin: upin,
      },
      include: {
        lease_holder: true,
        land_parcels: true,
        documents: true, // you can add this relation on lease_agreements side if needed
      },
    });

    return lease;
  }

  static async updateLease(
    upin: string,
    leaseId: string,
    input: UpdateLeaseInput
  ) {
    const existing = await prisma.lease_agreements.findFirst({
      where: {
        lease_id: leaseId,
        upin: upin,
      },
    });

    if (!existing) return null;

    const data: any = {};

    if (input.lease_period_years !== undefined) {
      data.lease_period_years = input.lease_period_years;
    }
    if (input.price_per_m2 !== undefined) {
      data.price_per_m2 = input.price_per_m2;
    }
    if (input.total_lease_value !== undefined) {
      data.total_lease_value = input.total_lease_value;
    }
    if (input.down_payment_amount !== undefined) {
      data.down_payment_amount = input.down_payment_amount;
    }
    if (input.annual_installment !== undefined) {
      data.annual_installment = input.annual_installment;
    }
    if (input.payment_term_years !== undefined) {
      data.payment_term_years = input.payment_term_years;
    }
    if (input.contract_date !== undefined) {
      data.contract_date = new Date(input.contract_date);
    }
    if (input.legal_framework !== undefined) {
      data.legal_framework = input.legal_framework;
    }
    if (input.start_date !== undefined) {
      data.start_date = input.start_date ? new Date(input.start_date) : null;
    }
    if (input.end_date !== undefined) {
      data.end_date = input.end_date ? new Date(input.end_date) : null;
    }
    if (input.current_holder_id !== undefined) {
      data.current_holder_id = input.current_holder_id;
    }

    const updated = await prisma.lease_agreements.update({
      where: { lease_id: existing.lease_id },
      data,
      include: {
        lease_holder: true,
        land_parcels: true,
      },
    });

    if (
      input.current_holder_id &&
      input.current_holder_id !== existing.current_holder_id
    ) {
      await prisma.lease_history.create({
        data: {
          lease_id: updated.lease_id,
          action_type: 'CHANGE_HOLDER',
          previous_holder_id: existing.current_holder_id,
          new_holder_id: input.current_holder_id,
          change_date: new Date(),
          remarks: 'Lease holder changed',
        },
      });
    }

    return updated;
  }

  static async getLeaseHistory(upin: string, leaseId: string) {
    const lease = await prisma.lease_agreements.findFirst({
      where: {
        lease_id: leaseId,
        upin: upin,
      },
    });

    if (!lease) return [];

    const history = await prisma.lease_history.findMany({
      where: {
        lease_id: lease.lease_id,
      },
      include: {
        new_holder: true,
        previous_holder: true,
      },
      orderBy: { change_date: 'asc' },
    });

    return history;
  }
}
