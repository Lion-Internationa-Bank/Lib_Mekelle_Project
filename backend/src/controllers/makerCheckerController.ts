// src/controllers/makerCheckerController.ts
import type { Request, Response } from 'express';
import { MakerCheckerService } from '../services/makerCheckerService.ts';
import { WizardSessionService } from '../services/wizardSessionService.ts';
import type { AuthRequest } from '../middlewares/authMiddleware.ts';
  type Sort = "asc"| "desc";
// import { validateMakerCheckerRequest } from '../validation/makerCheckerSchemas.ts';

export class MakerCheckerController {
  private makerCheckerService: MakerCheckerService;
  private wizardSessionService: WizardSessionService;

  constructor(
    makerCheckerService: MakerCheckerService,
    wizardSessionService: WizardSessionService
  ) {
    this.makerCheckerService = makerCheckerService;
    this.wizardSessionService = wizardSessionService;
  }

  // Get pending requests for approver
async getPendingRequests(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    
    // Extract query parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string ;
    const entity_type = req.query.entity_type as string;
    const action_type = req.query.action_type as string;
    const maker_id = req.query.maker_id as string;
    const from_date = req.query.from_date as string;
    const to_date = req.query.to_date as string;
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as Sort || 'desc';

    const result = await this.makerCheckerService.getPendingRequests(
      user,
      {
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
      }
    );

    return res.status(200).json({
      success: true,
      data: result.requests,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage
      }
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests'
    });
  }
}
  // src/controllers/makerCheckerController.ts

async getMakerPendingRequests(req: AuthRequest, res: Response) {
  try {
   
       const { maker_id } = req.params;
    const user = req.user!;
    
    // Authorization: Only allow makers to view their own requests,
    // or admins to view any maker's requests
    if (user.user_id !== maker_id && !['CITY_ADMIN', 'REVENUE_ADMIN', 'SUBCITY_ADMIN'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these requests'
      });
    }

    // Extract query parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string ;
    const entity_type = req.query.entity_type as string;
    const action_type = req.query.action_type as string;
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as Sort|| 'desc';

    const result = await this.makerCheckerService.getMakerPendingRequests(
      user.user_id,
      {
        page,
        limit,
        status,
        entity_type,
        action_type,
        sortBy,
        sortOrder
      },
      user
    );

    return res.status(200).json({
      success: true,
      data: result.requests,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage
      }
    });
  } catch (error) {
    console.error('Get maker pending requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch maker pending requests'
    });
  }
}

  // Get request details
  async getRequestDetails(req: AuthRequest, res: Response) {
    try {

      console.log("get Request Details ,get request detail hitted")
      const request_id  = req.params.request_id as string;
      const user = req.user!;

      const request = await this.makerCheckerService.getRequestDetails(request_id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Approval request not found'
        });
      }
console.log("user id",user.user_id)
console.log("maker id",request.maker_id)
console.log("request id ",request.request_id)
      // Check permissions
      if (!this.canViewRequest(user, request) ) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view this request'
        });
      }

      return res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      console.error('Get request details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch request details'
      });
    }
  }

  // Approve request
  async approveRequest(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const request_id  = req.params.request_id as string;
      const { comments } = req.body;

      const result = await this.makerCheckerService.approveRequest(
        request_id,
        user.user_id,
        user.role,
        comments
      );

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Approve request error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to approve request'
      });
    }
  }

  // Reject request
  async rejectRequest(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const request_id  = req.params.request_id as string;
      const { rejection_reason } = req.body;

      if (!rejection_reason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      const result = await this.makerCheckerService.rejectRequest(
        request_id,
        user.user_id,
        user.role,
        rejection_reason
      );

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Reject request error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to reject request'
      });
    }
  }



  private canViewRequest(user: any, request: any): boolean {
    // Maker can view their own requests
    if (request.maker_id === user.user_id) {
      return true;
    }

    // Approver can view requests they can approve
    if (request.approver_role === user.role) {
      if (request.sub_city_id) {
        return request.sub_city_id === user.sub_city_id;
      }
      return true;
    }

    // City admin can view all
    if (user.role === 'CITY_ADMIN') {
      return true;
    }

    return false;
  }


}