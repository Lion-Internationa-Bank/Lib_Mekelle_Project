import prisma from '../config/prisma.ts';
import { 
  type GetEncumbrancesQuery,
  type GetLandParcelsQuery,
  type GetOwnersWithMultipleParcelsQuery,
  type GetLeaseAnnualInstallmentRange
} from '../validation/parcelReportSchemas.ts';
import { Prisma } from '../generated/prisma/client.ts';



export class ParcelService {
  static async getEncumbrances(
    query: GetEncumbrancesQuery
  ): Promise<any> {
    const { from_date, to_date, status, type } = query;

    // Build where clause
    const where: any = {
      is_deleted: false
    };

    // Date range filter
    if (from_date || to_date) {
      where.registration_date = {};
      if (from_date) where.registration_date.gte = from_date;
      if (to_date) where.registration_date.lte = to_date;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Type filter
    if (type) {
      where.type = type;
    }

    // Fetch encumbrances with related data
    const encumbrances = await prisma.encumbrances.findMany({
      where,
      select: {
        encumbrance_id:true,
        issuing_entity:true,
        type:true,
        status:true,
        reference_number:true,
        registration_date:true,
         land_parcel: {
          select: {
            upin: true,
            file_number: true,
            tabia: true,
            ketena: true,
            block: true,
            total_area_m2: true,
            land_use: true,
            tenure_type: true,
            sub_city: {
              select: {
                name: true
              }
            },
           owners:{
            select:{
             owner :{
                select:{
                    full_name:true,
                    phone_number:true,
                    national_id:true,
                    tin_number:true,
                }
             }
            }
           }
          }
        },
       
      },
      orderBy: {
        registration_date: 'desc'
      },
      
    });

    return {
      data: encumbrances,
    };
  }

  static async getLandParcels(
    query: GetLandParcelsQuery,
    user: any
  ): Promise<any> {
    const {
      landUse,
      tenureType,
      tabia,
      ketena,
      block,
      minArea,
      maxArea,
      landGrade,
      status,
      tender,
      subCityId
    } = query;
    


    // Build where clause
    const where: any = {
      is_deleted: false
    };

    // Apply filters
    if (landUse) where.land_use = landUse;
    if (tenureType) where.tenure_type = tenureType;
    if (tabia) where.tabia = tabia;
    if (ketena) where.ketena = ketena;
    if (block) where.block = block;
    if (landGrade) where.land_grade = landGrade;
    if (tender) where.tender = tender;
    if (status) where.status = status;
    
    // Area range filter
    if (minArea || maxArea) {
      where.total_area_m2 = {};
      if (minArea) where.total_area_m2.gte = minArea;
      if (maxArea) where.total_area_m2.lte = maxArea;
    }

    // Sub-city filter based on user role and permissions
    if (user.role === 'CITY_ADMIN' && subCityId) {
      where.sub_city_id = subCityId;
    } else if (user.role !== 'CITY_ADMIN' && user.sub_city_id) {
      where.sub_city_id = user.sub_city_id;
    } else if (subCityId) {
      where.sub_city_id = subCityId;
    }


    // Fetch parcels with related data
    const parcels = await prisma.land_parcels.findMany({
      where,
      select: {
        upin:true,
        file_number:true,
        tabia:true,
        ketena:true,
        block:true,
        total_area_m2:true,
        land_use:true,
        land_grade:true,
        tender:true,
        boundary_east:true,
        boundary_north:true,
        boundary_south:true,
        boundary_west:true,
        sub_city: {
          select: {
            name: true
          }
        },
        owners: {
          where: { is_deleted: false, is_active: true },
         select: {
            acquired_at:true,
            owner: {
              select: {
                owner_id: true,
                full_name: true,
                national_id: true,
                tin_number: true,
                phone_number: true
              }
            }
          }
        },
      },
      orderBy: {
        updated_at: 'desc'
      },

    });

    return {
      data: parcels,

    };
  }



static async getOwnersWithMultipleParcels(
  query: GetOwnersWithMultipleParcelsQuery,
  user: any
): Promise<any> {
  const { minParcels = 2, subCityId } = query;

  try {
    // Build the query using Prisma.sql template
    const conditions = Prisma.sql`o.is_deleted = false`;
    
    let subCityCondition = Prisma.empty;
    if (user.role === 'CITY_ADMIN' && subCityId) {
      subCityCondition = Prisma.sql`AND o.sub_city_id = ${subCityId}::uuid`;
    } else if (user.role !== 'CITY_ADMIN' && user.sub_city_id) {
      subCityCondition = Prisma.sql`AND o.sub_city_id = ${user.sub_city_id}::uuid`;
    } else if (subCityId) {
      subCityCondition = Prisma.sql`AND o.sub_city_id = ${subCityId}::uuid`;
    }

    const owners = await prisma.$queryRaw`
      SELECT 
        o.owner_id,
        o.full_name,
        o.national_id,
        o.tin_number,
        o.phone_number,
        o.sub_city_id,
        sc.name as sub_city_name,
        COUNT(po.upin) as parcel_count,
        COALESCE(
          json_agg(
            json_build_object(
              'upin', lp.upin,
              'file_number', lp.file_number,
              'tabia', lp.tabia,
              'ketena', lp.ketena,
              'block', lp.block,
              'total_area_m2', lp.total_area_m2,
              'land_use', lp.land_use,
              'tenure_type', lp.tenure_type,
              'status', lp.status,
              'sub_city', json_build_object(
                'name', sc_sub.name,
                'sub_city_id', sc_sub.sub_city_id
              )
            ) ORDER BY lp.created_at DESC
          ) FILTER (WHERE lp.upin IS NOT NULL), 
          '[]'::json
        ) as parcels
      FROM owners o
      INNER JOIN sub_cities sc ON o.sub_city_id = sc.sub_city_id
      LEFT JOIN parcel_owners po ON o.owner_id = po.owner_id 
        AND po.is_deleted = false 
        AND po.is_active = true
      LEFT JOIN land_parcels lp ON po.upin = lp.upin 
        AND lp.is_deleted = false
      LEFT JOIN sub_cities sc_sub ON lp.sub_city_id = sc_sub.sub_city_id
      WHERE ${conditions}
        ${subCityCondition}
      GROUP BY o.owner_id, sc.name
      HAVING COUNT(po.upin) >= ${minParcels}
      ORDER BY parcel_count DESC
    `;

    // Format the results
    const formattedOwners = Array.isArray(owners) 
      ? owners.map((owner: any) => {
          // Parse parcels if it's a string, otherwise use as is
          let parcels = owner.parcels;
          if (typeof parcels === 'string') {
            try {
              parcels = JSON.parse(parcels);
            } catch (e) {
              parcels = [];
            }
          }
          
          return {
            owner_id: owner.owner_id,
            full_name: owner.full_name,
            national_id: owner.national_id,
            tin_number: owner.tin_number,
            phone_number: owner.phone_number,
            sub_city_id: owner.sub_city_id,
            sub_city_name: owner.sub_city_name,
            created_at: owner.created_at,
            updated_at: owner.updated_at,
            parcel_count: parseInt(owner.parcel_count) || 0,
            parcels: parcels || []
          };
        })
      : [];

    return {
      success: true,
      data: formattedOwners
    };
  } catch (error) {
    console.error('Error in getOwnersWithMultipleParcels:', error);
    throw error;
  }
}

static async getLeaseAnnualInstallmentRange(
  query: GetLeaseAnnualInstallmentRange,
  user: any
): Promise<any> {
  const { min, max, subCityId } = query;

  try {
    // Build sub-city filter based on user role
    let subCityCondition = Prisma.empty;
    if (user.role === 'CITY_ADMIN' && subCityId) {
      subCityCondition = Prisma.sql`AND lp.sub_city_id = ${subCityId}::uuid`;
    } else if (user.role !== 'CITY_ADMIN' && user.sub_city_id) {
      subCityCondition = Prisma.sql`AND lp.sub_city_id = ${user.sub_city_id}::uuid`;
    } else if (subCityId) {
      subCityCondition = Prisma.sql`AND lp.sub_city_id = ${subCityId}::uuid`;
    }

    // Execute query to get land parcels with lease agreements within the installment range
    const parcels = await prisma.$queryRaw`
      SELECT 
        -- Parcel information
        lp.upin,
        lp.file_number,
        lp.tabia,
        lp.ketena,
        lp.block,
        lp.total_area_m2,
        lp.land_use,
        lp.tenure_type,
        lp.status as parcel_status,
        
        -- Sub-city information
        sc.name as sub_city_name,
        
        -- Lease information (including annual installment)
        la.annual_installment,
        la.status as lease_status,
        
        -- Owner information (all owners)
        COALESCE(
          json_agg(
            json_build_object(
              'owner_id', o.owner_id,
              'full_name', o.full_name,
              'national_id', o.national_id,
              'tin_number', o.tin_number,
              'phone_number', o.phone_number,
              'acquired_at', po.acquired_at
            ) ORDER BY po.acquired_at
          ) FILTER (WHERE o.owner_id IS NOT NULL),
          '[]'::json
        ) as owners

      FROM land_parcels lp
      INNER JOIN sub_cities sc ON lp.sub_city_id = sc.sub_city_id
      INNER JOIN lease_agreements la ON lp.upin = la.upin
      LEFT JOIN parcel_owners po ON lp.upin = po.upin AND po.is_deleted = false AND po.is_active = true
      LEFT JOIN owners o ON po.owner_id = o.owner_id AND o.is_deleted = false
      
      WHERE lp.is_deleted = false
        AND la.is_deleted = false
        AND la.annual_installment BETWEEN ${min} AND ${max}
        ${subCityCondition}
      
      GROUP BY lp.upin, lp.file_number, lp.tabia, lp.ketena, lp.block, 
               lp.total_area_m2, lp.land_use, lp.tenure_type, lp.status,
               sc.name, la.annual_installment, la.lease_id, la.status, 
               la.start_date, la.expiry_date
      
      ORDER BY la.annual_installment ASC
    `;

    // Format the results
    const formattedParcels = Array.isArray(parcels) 
      ? parcels.map((parcel: any) => {
          // Parse owners JSON
          let owners = parcel.owners;
          if (typeof owners === 'string') {
            try {
              owners = JSON.parse(owners);
            } catch (e) {
              owners = [];
            }
          }

          return {
            parcel: {
              upin: parcel.upin,
              file_number: parcel.file_number,
              tabia: parcel.tabia,
              ketena: parcel.ketena,
              block: parcel.block,
              total_area_m2: parcel.total_area_m2 ? parseFloat(parcel.total_area_m2) : null,
              land_use: parcel.land_use,
              tenure_type: parcel.tenure_type,
              status: parcel.parcel_status,
              sub_city_name: parcel.sub_city_name
            },
            lease: {
              lease_id: parcel.lease_id,
              annual_installment: parseFloat(parcel.annual_installment),
              status: parcel.lease_status,
              start_date: parcel.start_date,
              expiry_date: parcel.expiry_date
            },
            owners: owners
          };
        })
      : [];

    return {
      success: true,
      data: formattedParcels,
      count: formattedParcels.length,
      range: {
        min,
        max
      }
    };
  } catch (error) {
    console.error('Error in getLeaseAnnualInstallmentRange:', error);
    throw error;
  }
}
}