// src/controllers/authController.ts
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken'; 
import prisma from '../config/prisma.ts';
import { UserRole, AuditAction, ActionType, EntityType } from '../generated/prisma/enums.ts'; 
import { MakerCheckerService } from '../services/makerCheckerService.ts';
import { AuditService } from '../services/auditService.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN  || '7d';
const options: SignOptions = {
  expiresIn: JWT_EXPIRES_IN as any 
};

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    role: UserRole;
    sub_city_id?: string;
    username?: string;
    full_name?: string;
  };
}

// Initialize services
const auditService = new AuditService();
const makerCheckerService = new MakerCheckerService(auditService);

// Helper to generate JWT
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, options);
};

// Helper to check if role is an approver
const isApproverRole = (role: UserRole): boolean => {
  return [
    UserRole.CITY_APPROVER,
    UserRole.SUBCITY_APPROVER,
    UserRole.REVENUE_APPROVER
  ].includes(role );
};

// Helper to check if role is an admin
const isAdminRole = (role: UserRole): boolean => {
  return [
    UserRole.CITY_ADMIN,
    UserRole.SUBCITY_ADMIN,
    UserRole.REVENUE_ADMIN
  ].includes(role);
};

// Helper to get approver role for a specific admin role
const getApproverRoleForAdmin = (adminRole: UserRole): UserRole | null => {
  switch (adminRole) {
    case UserRole.CITY_ADMIN:
      return UserRole.CITY_APPROVER;
    case UserRole.SUBCITY_ADMIN:
      return UserRole.SUBCITY_APPROVER;
    case UserRole.REVENUE_ADMIN:
      return UserRole.REVENUE_APPROVER;
    default:
      return null;
  }
};

// Helper to find the approver role for a request (returns role, not ID)
const findApproverRoleForRequest = (
  adminRole: UserRole,
  targetRole?: UserRole,
  subCityId?: string | null
): UserRole | null => {
  // For City Admin creating/ managing users
  if (adminRole === UserRole.CITY_ADMIN) {
    return UserRole.CITY_APPROVER;
  }
  
  // For Sub-city Admin creating/ managing users in their sub-city
  if (adminRole === UserRole.SUBCITY_ADMIN) {
    return UserRole.SUBCITY_APPROVER;
  }
  
  // For Revenue Admin creating/ managing revenue users
  if (adminRole === UserRole.REVENUE_ADMIN) {
    return UserRole.REVENUE_APPROVER;
  }

  return null;
};

// Helper to get creatable roles based on creator's role
const getCreatableRoles = (creatorRole: UserRole): UserRole[] => {
  switch (creatorRole) {
    case UserRole.CITY_ADMIN:
      return [UserRole.SUBCITY_ADMIN, UserRole.SUBCITY_APPROVER];
    case UserRole.SUBCITY_ADMIN:
      return [UserRole.SUBCITY_NORMAL, UserRole.SUBCITY_AUDITOR, UserRole.SUBCITY_APPROVER];
    case UserRole.REVENUE_ADMIN:
      return [UserRole.REVENUE_USER];
    default:
      return [];
  }
};

// Helper to get viewable roles based on viewer's role
const getViewableRoles = (viewerRole: UserRole, subCityId?: string): any => {
  switch (viewerRole) {
    case UserRole.CITY_ADMIN:
      return { in: [UserRole.SUBCITY_ADMIN, UserRole.SUBCITY_APPROVER] };
    case UserRole.CITY_APPROVER:
      return { in: [UserRole.SUBCITY_ADMIN] };
    case UserRole.SUBCITY_ADMIN:
      return { 
        sub_city_id: subCityId, 
        role: { in: [UserRole.SUBCITY_NORMAL, UserRole.SUBCITY_AUDITOR, UserRole.SUBCITY_APPROVER] } 
      };
    case UserRole.SUBCITY_APPROVER:
      return { 
        sub_city_id: subCityId, 
        role: { in: [UserRole.SUBCITY_NORMAL, UserRole.SUBCITY_AUDITOR] } 
      };
    case UserRole.REVENUE_ADMIN:
      return { in: [UserRole.REVENUE_USER, UserRole.REVENUE_APPROVER] };
    case UserRole.REVENUE_APPROVER:
      return { in: [UserRole.REVENUE_USER] };
    default:
      return { in: [] };
  }
};

// Helper to get manageable roles based on manager's role
const getManageableRoles = (managerRole: UserRole, subCityId?: string): any => {
  switch (managerRole) {
    case UserRole.CITY_ADMIN:
      return { role: UserRole.SUBCITY_ADMIN };
    case UserRole.SUBCITY_ADMIN:
      return { 
        sub_city_id: subCityId, 
        role: { in: [UserRole.SUBCITY_NORMAL, UserRole.SUBCITY_AUDITOR, UserRole.SUBCITY_APPROVER] } 
      };
    case UserRole.REVENUE_ADMIN:
      return { role: UserRole.REVENUE_USER };
    default:
      return null;
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Username and password are required' 
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user || user.is_deleted || !user.is_active) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user.user_id);

    // Log login activity
    await auditService.log({
      userId: user.user_id,
      action: AuditAction.LOGIN,
      entityType: EntityType.USERS,
      entityId: user.user_id,
      changes: {
        action: 'user_login',
        username: user.username,
        role: user.role,
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip || req.socket.remoteAddress
    });

    // Add role type information for frontend
    const userResponse = {
      user_id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      role_type: isApproverRole(user.role) ? 'approver' : isAdminRole(user.role) ? 'admin' : 'user',
      sub_city_id: user.sub_city_id,
    };

    res.json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// POST /auth/users - Create user with maker-checker
export const createUser = async (req: AuthRequest, res: Response) => {
  console.log("Create user endpoint hit");
  const { username, password, full_name, role } = req.body;
  let { sub_city_id } = req.body;
  const creator = req.user!;

  if (!username || !password || !full_name || !role) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields' 
    });
  }

  if (role === 'REVENUE_USER' || role === 'REVENUE_APPROVER') {
    sub_city_id = null;
  }

  try {
    // Role-based creation rules validation
    const creatableRoles = getCreatableRoles(creator.role);
    
    if (!creatableRoles.includes(role as UserRole)) {
      return res.status(403).json({ 
        success: false,
        message: `You can only create: ${creatableRoles.map(r => r.replace('_', ' ')).join(', ')}` 
      });
    }

    // Approvers cannot create users
    if (isApproverRole(creator.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Approvers do not have permission to create users' 
      });
    }

    // Sub-city restriction for sub-city roles
    if (['SUBCITY_ADMIN', 'SUBCITY_NORMAL', 'SUBCITY_AUDITOR', 'SUBCITY_APPROVER'].includes(role) && !sub_city_id) {
      return res.status(400).json({ 
        success: false,
        message: 'sub_city_id required for sub-city roles' 
      });
    }

    // Enforce same sub-city for sub-city creator
    if (creator.role === 'SUBCITY_ADMIN' && sub_city_id !== creator.sub_city_id) {
      return res.status(403).json({ 
        success: false,
        message: 'Can only create users in your own sub-city' 
      });
    }

    // Check if username already exists
    const existingUser = await prisma.users.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }

    // Determine the approver role for this request (returns role, not ID)
    const approverRole = findApproverRoleForRequest(creator.role, role as UserRole, sub_city_id || creator.sub_city_id);
    
    if (!approverRole) {
      return res.status(500).json({
        success: false,
        message: 'Could not determine approver role for this request'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data
    const userData = {
      username,
      password_hash: hashedPassword,
      full_name,
      role: role as UserRole,
      sub_city_id: sub_city_id || null,
      is_active: true,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Create approval request through maker-checker with approverRole
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.USERS,
      entityId: 'pending', // Will be set after approval
      actionType: ActionType.CREATE,
      requestData: userData,
      makerId: creator.user_id,
      makerRole: creator.role,
      approver_role: approverRole, // Pass the approver role
      subCityId: sub_city_id || creator.sub_city_id,
      comments: `Create new ${role} user: ${username}`
    });

    return res.status(202).json({
      success: true,
      message: 'User creation request submitted for approval',
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.USERS,
        action: ActionType.CREATE,
        approver_role: approverRole
      }
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ 
        success: false,
        message: error.message 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// PATCH /auth/users/:id/suspend - with maker-checker
export const suspendUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { suspend } = req.body as { suspend: boolean };
  const { reason } = req.body;
  const actor = req.user!;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      success: false,
      message: 'User ID is required' 
    });
  }

  try {
    const targetUser = await prisma.users.findUnique({ 
      where: { 
        user_id: id,
        is_deleted: false 
      } 
    });
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Authorization check
    if (!canManageUser(actor, targetUser)) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to manage this user' 
      });
    }

    // Prevent self-suspension
    if (targetUser.user_id === actor.user_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend your own account'
      });
    }

    // Determine the approver role for this request (returns role, not ID)
    const approverRole = findApproverRoleForRequest(actor.role, targetUser.role, targetUser.sub_city_id || actor.sub_city_id);
    
    if (!approverRole) {
      return res.status(500).json({
        success: false,
        message: 'Could not determine approver role for this request'
      });
    }

    // Create approval request for suspension with approverRole
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.USERS,
      entityId: targetUser.user_id,
      actionType: suspend ? ActionType.SUSPEND : ActionType.ACTIVATE,
      requestData: {
        user_id: targetUser.user_id,
        username: targetUser.username,
        full_name: targetUser.full_name,
        role: targetUser.role,
        current_status: targetUser.is_active,
        new_status: !suspend,
        reason: reason || `User ${suspend ? 'suspension' : 'activation'} requested`
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      approver_role: approverRole, // Pass the approver role
      subCityId: targetUser.sub_city_id || actor.sub_city_id,
      comments: reason || `Request to ${suspend ? 'suspend' : 'activate'} user ${targetUser.username}`
    });

    return res.status(202).json({
      success: true,
      message: `User ${suspend ? 'suspension' : 'activation'} request submitted for approval`,
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.USERS,
        action: suspend ? ActionType.SUSPEND : ActionType.ACTIVATE,
        approver_role: approverRole
      }
    });
  } catch (error: any) {
    console.error('Suspend user error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE /auth/users/:id - with maker-checker
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const actor = req.user!;
  const { reason } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      success: false,
      message: 'User ID is required' 
    });
  }

  try {
    const targetUser = await prisma.users.findUnique({ 
      where: { 
        user_id: id,
        is_deleted: false 
      } 
    });
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Authorization check
    if (!canManageUser(actor, targetUser)) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this user' 
      });
    }

    // Prevent self-deletion
    if (targetUser.user_id === actor.user_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Determine the approver role for this request (returns role, not ID)
    const approverRole = findApproverRoleForRequest(actor.role, targetUser.role, targetUser.sub_city_id || actor.sub_city_id);
    
    if (!approverRole) {
      return res.status(500).json({
        success: false,
        message: 'Could not determine approver role for this request'
      });
    }

    // Create approval request for deletion with approverRole
    const result = await makerCheckerService.createApprovalRequest({
      entityType: EntityType.USERS,
      entityId: targetUser.user_id,
      actionType: ActionType.DELETE,
      requestData: {
        user_id: targetUser.user_id,
        username: targetUser.username,
        full_name: targetUser.full_name,
        role: targetUser.role,
        sub_city_id: targetUser.sub_city_id,
        reason: reason || 'User deletion requested'
      },
      makerId: actor.user_id,
      makerRole: actor.role,
      approver_role: approverRole, // Pass the approver role
      subCityId: targetUser.sub_city_id || actor.sub_city_id,
      comments: reason || `Request to delete user ${targetUser.username}`
    });

    return res.status(202).json({
      success: true,
      message: 'User deletion request submitted for approval',
      data: {
        request_id: result.approvalRequest?.request_id,
        status: result.approvalRequest?.status,
        entity_type: EntityType.USERS,
        action: ActionType.DELETE,
        approver_role: approverRole
      }
    });
  } catch (error: any) {
    console.error('Delete user error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// PATCH /auth/change-password
export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      success: false,
      message: 'Both passwords are required' 
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { user_id: req.user!.user_id },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Current password incorrect' 
      });
    }

    const hashedNew = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { password_hash: hashedNew },
    });

    // Audit password change
    await auditService.log({
      userId: user.user_id,
      action: AuditAction.UPDATE,
      entityType: EntityType.USERS,
      entityId: user.user_id,
      changes: {
        action: 'change_password',
        username: user.username,
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip || req.socket.remoteAddress
    });

    res.json({ 
      success: true,
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// GET /auth/users - List users (filtered by creator's scope)
export const getUsers = async (req: AuthRequest, res: Response) => {
  const creator = req.user!;

  let where: any = { is_deleted: false };

  // Role-based filtering using helper
  const viewableRoles = getViewableRoles(creator.role, creator.sub_city_id);
  
  if (viewableRoles.sub_city_id) {
    where.sub_city_id = viewableRoles.sub_city_id;
  }
  
  if (viewableRoles.role) {
    where.role = viewableRoles.role;
  }

  try {
    const users = await prisma.users.findMany({
      where,
      select: {
        user_id: true,
        username: true,
        full_name: true,
        role: true,
        sub_city_id: true,
        is_active: true,
        created_at: true,
        sub_city: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const adjustedUsers = users.map(user => ({
      user_id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      role_type: isApproverRole(user.role) ? 'approver' : isAdminRole(user.role) ? 'admin' : 'user',
      sub_city_id: user.sub_city_id,
      sub_city_name: user.sub_city?.name,
      is_active: user.is_active,
      created_at: user.created_at
    }));

    res.json({ 
      users: adjustedUsers 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// GET /auth/users/:id - Get single user
export const getUserById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const actor = req.user!;

  try {
    const user = await prisma.users.findUnique({
      where: { 
        user_id: id,
        is_deleted: false 
      },
      select: {
        user_id: true,
        username: true,
        full_name: true,
        role: true,
        sub_city_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        sub_city: {
          select: {
            name: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if actor has permission to view this user
    if (!canViewUser(actor, user)) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this user' 
      });
    }

    res.json({
      success: true,
      data: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        role_type: isApproverRole(user.role) ? 'approver' : isAdminRole(user.role) ? 'admin' : 'user',
        sub_city_id: user.sub_city_id,
        sub_city_name: user.sub_city?.name,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// GET /auth/users/me - Get current user
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: req.user!.user_id },
      select: {
        user_id: true,
        username: true,
        full_name: true,
        role: true,
        sub_city_id: true,
        is_active: true,
        created_at: true,
        sub_city: {
          select: {
            name: true,
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      data: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        role_type: isApproverRole(user.role) ? 'approver' : isAdminRole(user.role) ? 'admin' : 'user',
        sub_city_id: user.sub_city_id,
        sub_city_name: user.sub_city?.name,
        is_active: user.is_active,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};






// Helper: Check if actor can view target user
function canViewUser(
  actor: { role: UserRole; sub_city_id?: string; user_id?: string },
  target: { role: UserRole; sub_city_id: string | null; user_id: string }
): boolean {
  // Users can view themselves
  if (actor.user_id === target.user_id) {
    return true;
  }

  // City admin can view all users
  if (actor.role === UserRole.CITY_ADMIN) {
    return true;
  }

  // City approver can view sub-city admins (for approval oversight)
  if (actor.role === UserRole.CITY_APPROVER && target.role === UserRole.SUBCITY_ADMIN) {
    return true;
  }

  // Sub-city admin can view all users in their sub-city (normal, auditor, approver)
  if (actor.role === UserRole.SUBCITY_ADMIN && 
      target.sub_city_id === actor.sub_city_id &&
      [UserRole.SUBCITY_NORMAL, UserRole.SUBCITY_AUDITOR, UserRole.SUBCITY_APPROVER].includes(target.role)) {
    return true;
  }

  // Sub-city approver can view normal users and auditors in their sub-city (for approval)
  if (actor.role === UserRole.SUBCITY_APPROVER && 
      target.sub_city_id === actor.sub_city_id &&
      [UserRole.SUBCITY_NORMAL, UserRole.SUBCITY_AUDITOR].includes(target.role)) {
    return true;
  }

  // Revenue admin can view revenue users and revenue approvers
  if (actor.role === UserRole.REVENUE_ADMIN && 
      [UserRole.REVENUE_USER, UserRole.REVENUE_APPROVER].includes(target.role)) {
    return true;
  }

  // Revenue approver can view revenue users (for approval)
  if (actor.role === UserRole.REVENUE_APPROVER && target.role === UserRole.REVENUE_USER) {
    return true;
  }

  return false;
}

// Helper: Check if actor can manage target user (suspend/delete)
function canManageUser(
  actor: { role: UserRole; sub_city_id?: string; user_id?: string },
  target: { role: UserRole; sub_city_id: string | null; user_id: string }
): boolean {
  // Users cannot manage themselves (prevent self-suspension/deletion)
  if (actor.user_id === target.user_id) {
    return false;
  }

  // Approvers cannot manage users (they only approve/reject requests)
  if (isApproverRole(actor.role)) {
    return false;
  }

  // City Admin can manage Sub-city Admin only (not Sub-city Approver)
  if (actor.role === UserRole.CITY_ADMIN && target.role === UserRole.SUBCITY_ADMIN) {
    return true;
  }

  // Sub-city Admin can manage all users in their sub-city (normal, auditor, approver)
  if (
    actor.role === UserRole.SUBCITY_ADMIN &&
    [UserRole.SUBCITY_NORMAL, UserRole.SUBCITY_AUDITOR, UserRole.SUBCITY_APPROVER].includes(target.role) &&
    target.sub_city_id !== null &&
    actor.sub_city_id !== undefined &&
    target.sub_city_id === actor.sub_city_id
  ) {
    return true;
  }

  // Revenue Admin can manage Revenue users only (not Revenue Approver)
  if (actor.role === UserRole.REVENUE_ADMIN && target.role === UserRole.REVENUE_USER) {
    return true;
  }

  return false;
}

export default {
  login,
  createUser,
  suspendUser,
  deleteUser,
  changePassword,
  getUsers,
  getUserById,
  getMe,
 
 
};