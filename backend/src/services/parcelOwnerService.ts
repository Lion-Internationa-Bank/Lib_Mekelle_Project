// src/services/parcelOwnerService.ts

import prisma from '../config/prisma.ts';


interface AddOwnerInput {
  owner_id: string;
  ownership_share: number | string; // will be converted to Decimal-compatible value
  start_date: string; // ISO or yyyy-mm-dd
  end_date?: string;
}

interface UpdateOwnerInput {
  ownership_share?: number | string;
  start_date?: string;
  end_date?: string | null;
}

export class ParcelOwnerService {
  static async listOwnersForParcel(parcelId: string) {
    // parcelId maps to upin in parcel_owners. [web:61][web:62]
    const links = await prisma.parcel_owners.findMany({
      where: { upin: parcelId },
      include: {
        owners: true,
      },
      orderBy: { start_date: 'asc' },
    });

    return links;
  }

  static async addOwnerToParcel(parcelId: string, input: AddOwnerInput) {
   
    const startDate = new Date(input.start_date);
    const endDate = input.end_date ? new Date(input.end_date) : undefined;

    const result = await prisma.parcel_owners.create({
      data: {
        upin: parcelId,
        owner_id: input.owner_id,
        ownership_share: Number(input.ownership_share),
        start_date: startDate,
        end_date: endDate,
      },
      include: {
        owners: true,
      },
    });

    return result;
  }

  static async getParcelOwnerDetail(parcelId: string, ownerId: string) {
    const link = await prisma.parcel_owners.findFirst({
      where: {
        upin: parcelId,
        owner_id: ownerId,
      },
      include: {
        owners: true,
      },
    });

    return link;
  }

  static async updateParcelOwner(
    parcelId: string,
    ownerId: string,
    input: UpdateOwnerInput
  ) {
    // use the composite unique: [upin, owner_id, start_date] – but start_date may change,
    // so we first find the current row by upin+owner_id only. [web:61][web:62]
    const existing = await prisma.parcel_owners.findFirst({
      where: {
        upin: parcelId,
        owner_id: ownerId,
      },
    });

    if (!existing) {
      return null;
    }

    const data: any = {};

    if (input.ownership_share !== undefined) {
      data.ownership_share = input.ownership_share;
    }

    if (input.start_date !== undefined) {
      data.start_date = new Date(input.start_date);
    }

    if (input.end_date !== undefined) {
      data.end_date = input.end_date ? new Date(input.end_date) : null;
    }

    const updated = await prisma.parcel_owners.update({
      where: {
        // use composite unique key [upin, owner_id, start_date] from schema
        upin_owner_id_start_date: {
          upin: existing.upin!,
          owner_id: existing.owner_id!,
          start_date: existing.start_date,
        },
      },
      data,
      include: {
        owners: true,
      },
    });

    return updated;
  }
}
