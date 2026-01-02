// src/services/ParcelService.ts
import prisma from '../config/prisma.ts';
import type { CreateParcelInput } from './types/parcelTypes.ts';
import path from 'path';
import { fileURLToPath } from 'url';

type MulterFile = Express.Multer.File;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '../../');

interface ListParcelsOptions {
  page: number;
  limit: number;
  upin?: string;
}

export class ParcelService {
  static async createParcel(
    input: CreateParcelInput,
    file?: MulterFile
  ): Promise<{ parcel: any; document: any | null }> {
    return prisma.$transaction(async (tx) => {
      const parcel = await tx.land_parcels.create({
        data: {
          upin: input.upin,
          file_number: input.file_number ?? null,
          sub_city: input.sub_city ?? null,
          tabia: input.tabia ?? null,
          block: input.block ?? null,
          ketena: input.ketena ?? null,
          total_area_m2: Number(input.total_area_m2),
          land_use: input.land_use ?? null,
          sub_land_use_code: input.sub_land_use_code ?? null,
          tenure_type: input.tenure_type,
          land_grade: input.land_grade ?? null,
          permitted_height: input.permitted_height ?? null,
          boundary_north: input.boundary_north ?? null,
          boundary_east: input.boundary_east ?? null,
          boundary_south: input.boundary_south ?? null,
          boundary_west: input.boundary_west ?? null,
        },
      });

      let document: any | null = null;

      if (file) {
        const relativeFolder = path.relative(
          PROJECT_ROOT,
          path.dirname(file.path)
        );
        const fileName = path.basename(file.path);

        document = await tx.documents.create({
          data: {
            upin: parcel.upin,
            document_type: input.document_type || 'Cadastral Map',
            file_name: fileName,
            file_path: relativeFolder,
            file_size_kb: Math.round(file.size / 1024),
            description:
              input.description ?? `Cadastral Map for parcel ${parcel.upin}`,
            upload_date: new Date(),
          },
        });
      }

      return { parcel, document };
    });
  }

  static async getParcels(options: ListParcelsOptions) {
    const { page, limit, upin } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (upin) {
      // simple exact match filter; extend if you want LIKE search. [web:26][web:29]
      where.upin = upin;
    }

    const [items, total] = await Promise.all([
      prisma.land_parcels.findMany({
        where,
        skip,
        take: limit,
        orderBy: { upin: 'asc' },
      }),
      prisma.land_parcels.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getParcel(upin: string) {
    // Include documents if you want: adjust relation name as per your schema.
    const parcel = await prisma.land_parcels.findUnique({
      where: { upin },
      include: {
        documents: true, // assumes relation `documents` exists on land_parcels
      },
    });

    return parcel;
  }

  static async updateParcel(upin: string, data: Partial<CreateParcelInput>) {
    try {
      const updated = await prisma.land_parcels.update({
        where: { upin },
        data: {
         
          file_number: data.file_number ?? null,
          sub_city: data.sub_city ?? null,
          tabia: data.tabia ?? null,
          block: data.block ?? null,
          ketena: data.ketena ?? null,
          total_area_m2:Number(data.total_area_m2),
    
          land_use: data.land_use ?? null,
          sub_land_use_code: data.sub_land_use_code ?? null,
          tenure_type: data.tenure_type ,
          land_grade: data.land_grade ?? null,
          permitted_height: data.permitted_height ?? null,
          boundary_north: data.boundary_north ?? null,
          boundary_east: data.boundary_east ?? null,
          boundary_south: data.boundary_south ?? null,
          boundary_west: data.boundary_west ?? null,
        },
      });

      return updated;
    } catch (err: any) {
      // Prisma throws if record not found; treat that as "not found"
      if (err.code === 'P2025') {
        return null;
      }
      throw err;
    }
  }

  static getDocumentAbsolutePath(filePath: string, fileName: string): string {
    return path.join(PROJECT_ROOT, filePath, fileName);
  }
}
