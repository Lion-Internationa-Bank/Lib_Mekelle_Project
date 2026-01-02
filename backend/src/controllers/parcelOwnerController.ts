// src/controllers/parcelOwnerController.ts
import type { Request, Response } from 'express';
import prisma from '../config/prisma.ts';















// import { ParcelOwnerService } from '../services/parcelOwnerService.ts';
  
// export class ParcelOwnerController {
//   static async listOwnersForParcel(
//     req: express.Request,
//     res: express.Response
//   ) {
//     try {
//       const parcelId = req.params.parcel_id;
//       if (!parcelId) {
//         return res.status(400).json({
//           success: false,
//           message: 'parcel_id is required',
//         });
//       }

//       const owners = await ParcelOwnerService.listOwnersForParcel(parcelId);

//       return res.status(200).json({
//         success: true,
//         message: 'Owners fetched successfully',
//         data: owners,
//       });
//     } catch (error: any) {
//       console.error('List owners error:', error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error',
//       });
//     }
//   }

//   static async addOwnerToParcel(
//     req: express.Request,
//     res: express.Response
//   ) {
//     try {
//       const parcelId = req.params.parcel_id;
//       if (!parcelId) {
//         return res.status(400).json({
//           success: false,
//           message: 'parcel_id is required',
//         });
//       }

//       const { owner_id, ownership_share, start_date, end_date } = req.body;

//       const result = await ParcelOwnerService.addOwnerToParcel(parcelId, {
//         owner_id,
//         ownership_share,
//         start_date,
//         end_date,
//       });

//       return res.status(201).json({
//         success: true,
//         message: 'Owner added to parcel successfully',
//         data: result,
//       });
//     } catch (error: any) {
//       console.error('Add owner to parcel error:', error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error',
//       });
//     }
//   }

//   static async getParcelOwnerDetail(
//     req: express.Request,
//     res: express.Response
//   ) {
//     try {
//       const parcelId = req.params.parcel_id;
//       const ownerId = req.params.owner_id;

//       if (!parcelId || !ownerId) {
//         return res.status(400).json({
//           success: false,
//           message: 'parcel_id and owner_id are required',
//         });
//       }

//       const detail = await ParcelOwnerService.getParcelOwnerDetail(
//         parcelId,
//         ownerId
//       );

//       if (!detail) {
//         return res.status(404).json({
//           success: false,
//           message: 'Parcel-owner link not found',
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: 'Parcel owner detail fetched successfully',
//         data: detail,
//       });
//     } catch (error: any) {
//       console.error('Get parcel owner detail error:', error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error',
//       });
//     }
//   }

//   static async updateParcelOwner(
//     req: express.Request,
//     res: express.Response
//   ) {
//     try {
//       const parcelId = req.params.parcel_id;
//       const ownerId = req.params.owner_id;

//       if (!parcelId || !ownerId) {
//         return res.status(400).json({
//           success: false,
//           message: 'parcel_id and owner_id are required',
//         });
//       }

//       const { ownership_share, start_date, end_date } = req.body;

//       const updated = await ParcelOwnerService.updateParcelOwner(
//         parcelId,
//         ownerId,
//         {
//           ownership_share,
//           start_date,
//           end_date,
//         }
//       );

//       if (!updated) {
//         return res.status(404).json({
//           success: false,
//           message: 'Parcel-owner link not found',
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: 'Parcel owner updated successfully',
//         data: updated,
//       });
//     } catch (error: any) {
//       console.error('Update parcel owner error:', error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error',
//       });
//     }
//   }
// }
