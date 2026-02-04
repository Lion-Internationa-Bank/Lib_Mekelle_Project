// src/controllers/makerCheckerController.ts
import type { Request, Response } from 'express';
import { MakerCheckerService } from '../services/makerCheckerService.ts';
import { WizardSessionService } from '../services/wizardSessionService.ts';
import type { AuthRequest } from '../middlewares/authMiddleware.ts';
// import { validateMakerCheckerRequest } from '../validation/makerCheckerSchemas.ts';

export class MakerCheckerController {
  constructor(
    private makerCheckerService: MakerCheckerService,
    private wizardSessionService: WizardSessionService
  ) {}

  // Get pending requests for approver
  async getPendingRequests(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const requests = await this.makerCheckerService.getPendingRequests(user);

      return res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      console.error('Get pending requests error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch pending requests'
      });
    }
  }

  // Get request details
  async getRequestDetails(req: AuthRequest, res: Response) {
    try {
      const request_id  = req.params as string;
      const user = req.user!;

      const request = await this.makerCheckerService.getRequestDetails(request_id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Approval request not found'
        });
      }

      // Check permissions
      if (!this.canViewRequest(user, request)) {
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

  // Get user's wizard sessions
  async getUserSessions(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const sessions = await this.wizardSessionService.getUserSessions(user.user_id);

      return res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Get user sessions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user sessions'
      });
    }
  }

  // Get session details
  async getSessionDetails(req: AuthRequest, res: Response) {
    try {
     
       const session_id = req.params.session_id as string;
      const user = req.user!;

      const session = await this.wizardSessionService.getSession(session_id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check permissions
      if (session.user_id !== user.user_id && !this.canViewSessionAsApprover(user, session)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view this session'
        });
      }

      return res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Get session details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch session details'
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

  private canViewSessionAsApprover(user: any, session: any): boolean {
    // Approver can view sessions they can approve
    if (user.role === 'SUBCITY_ADMIN' && session.sub_city_id === user.sub_city_id) {
      return true;
    }

    // City admin can view all
    if (user.role === 'CITY_ADMIN') {
      return true;
    }

    return false;
  }
}