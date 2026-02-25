// src/controllers/authController.ts
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken'; 
import prisma from '../config/prisma.ts';
import { UserRole,AuditAction } from '../generated/prisma/enums.ts'; 

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN =process.env.JWT_EXPIRES_IN  || '7d';
const options: SignOptions = {
  expiresIn: JWT_EXPIRES_IN as any 
};

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    role: UserRole;
    sub_city_id?: string;
  };
}

// Helper to generate JWT
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, options);
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
 
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { username },
    });
   

    if (!user || user.is_deleted || !user.is_active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.user_id);

    // Return minimal user info + token
    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        sub_city_id: user.sub_city_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /auth/users - Create user (role-restricted)
export const createUser = async (req: AuthRequest, res: Response) => {
  console.log("create user endpoint hitted")
  const { username, password, full_name, role } = req.body;
  let {sub_city_id} = req.body
  const creator = req.user!;

  if (!username || !password || !full_name || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if( role === 'REVENUE_USER'){
    sub_city_id = null;
  }

  try {
    // Role-based creation rules
    if (creator.role === 'CITY_ADMIN' && role !== 'SUBCITY_ADMIN') {
      return res.status(403).json({ message: 'CITY_ADMIN can only create SUBCITY_ADMIN' });
    }

    if (creator.role === 'SUBCITY_ADMIN' && !['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'].includes(role)) {
      return res.status(403).json({ message: 'SUBCITY_ADMIN can only create NORMAL or AUDITOR' });
    }

    if (creator.role === 'REVENUE_ADMIN' && role !== 'REVENUE_USER') {
      return res.status(403).json({ message: 'REVENUE_ADMIN can only create REVENUE_USER' });
    }

    // Sub-city restriction for sub-city roles
    if (['SUBCITY_ADMIN', 'SUBCITY_NORMAL', 'SUBCITY_AUDITOR'].includes(role) && !sub_city_id) {
      return res.status(400).json({ message: 'sub_city_id required for sub-city roles' });
    }

    // Enforce same sub-city for sub-city creator
    if (creator.role === 'SUBCITY_ADMIN' && sub_city_id !== creator.sub_city_id) {
      return res.status(403).json({ message: 'Can only create users in your own sub-city' });
    }
    

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.users.create({
      data: {
        username,
        password_hash: hashedPassword,
        full_name,
        role: role as UserRole,
        sub_city_id: sub_city_id || null,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        full_name: newUser.full_name,
        role: newUser.role,
        sub_city_id: newUser.sub_city_id,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /auth/me
// export const getMe = async (req: AuthRequest, res: Response) => {
//   const user = await prisma.users.findUnique({
//     where: { user_id: req.user!.user_id },
//     select: {
//       user_id: true,
//       username: true,
//       full_name: true,
//       role: true,
//       sub_city_id: true,
//       is_active: true,
//     },
//   });

//   res.json({ user });
// };

// PATCH /auth/change-password
export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both passwords are required' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { user_id: req.user!.user_id },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) return res.status(401).json({ message: 'Current password incorrect' });

    const hashedNew = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { password_hash: hashedNew },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /auth/users - List users (filtered by creator's scope)
export const getUsers = async (req: AuthRequest, res: Response) => {
  const creator = req.user!;

  let where: any = { is_deleted: false };

  if (creator.role === 'CITY_ADMIN') {
    where.role = 'SUBCITY_ADMIN';
  } else if (creator.role === 'SUBCITY_ADMIN') {
    where = { ...where, sub_city_id: creator.sub_city_id, role: { in: ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'] } };
  } else if (creator.role === 'REVENUE_ADMIN') {
    where.role = 'REVENUE_USER';
  }

  const users = await prisma.users.findMany({
    where,
    select: {
      user_id: true,
      username: true,
      full_name: true,
      role: true,
      sub_city_id: true,
      is_active: true,
      sub_city:{
        select:{
          name:true,
        }
      }
    },
  });
  const adjustedUsers = users.map(user=> ({
    user_id:user.user_id,
    username:user.username,
    full_name:user.full_name,
    role:user.role,
    sub_city_id:user.sub_city_id,
    sub_city_name:user.sub_city?.name,
    is_active:user.is_active

  }))
              
  res.json( {"users":adjustedUsers} );
};

// PATCH /auth/users/:id/suspend
export const suspendUser = async (req: AuthRequest, res: Response) => {
  // Type cast the params
  const { id } = req.params as { id: string };
  const { suspend } = req.body as { suspend: boolean };
  const actor = req.user!;

  // Validate ID parameter
  if (Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'User ID is required' });
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

    const updatedUser = await prisma.users.update({
      where: { user_id: id },
      data: { 
        is_active: !suspend,
        updated_at: new Date()
      },
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.UPDATE,
        entity_type: 'users',
        entity_id: targetUser.user_id,
        changes: {
          action: suspend ? 'suspend_user' : 'activate_user',
          previous_status: targetUser.is_active,
          new_status: !suspend,
          actor: actor.user_id,
          actor_role: actor.role,
        },
        timestamp: new Date(),
        ip_address: req.ip,
      },
    });

    return res.json({ 
      success: true,
      message: `User ${suspend ? 'suspended' : 'activated'} successfully`,
      data: {
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        is_active: updatedUser.is_active,
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

// DELETE /auth/users/:id
export const deleteUser = async (req: AuthRequest, res: Response) => {
  // Type cast the params
  const { id } = req.params as { id: string };
  const actor = req.user!;

  // Validate ID parameter
  if (Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'User ID is required' });
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

    const deletedUser = await prisma.users.update({
      where: { user_id: id },
      data: { 
        is_deleted: true, 
        deleted_at: new Date(),
        is_active: false, // Also deactivate when deleting
        updated_at: new Date()
      },
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        user_id: actor.user_id,
        action_type: AuditAction.DELETE,
        entity_type: 'users',
        entity_id: targetUser.user_id,
        changes: {
          action: 'soft_delete_user',
          username: targetUser.username,
          role: targetUser.role,
          actor: actor.user_id,
          actor_role: actor.role,
        },
        timestamp: new Date(),
        ip_address: req.ip,
      },
    });

    return res.json({ 
      success: true,
      message: 'User deleted (soft delete) successfully',
      data: {
        user_id: deletedUser.user_id,
        username: deletedUser.username,
        deleted_at: deletedUser.deleted_at,
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

// Helper: Check if actor can manage target user
function canManageUser(
  actor: { role: UserRole; sub_city_id?: string },
  target: { role: UserRole; sub_city_id: string | null }
): boolean {
  if (actor.role === 'CITY_ADMIN' && target.role === 'SUBCITY_ADMIN') return true;

  if (
    actor.role === 'SUBCITY_ADMIN' &&
    ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'].includes(target.role) &&
    target.sub_city_id !== null &&
    actor.sub_city_id !== undefined &&
    target.sub_city_id === actor.sub_city_id
  ) {
    return true;
  }

  if (actor.role === 'REVENUE_ADMIN' && target.role === 'REVENUE_USER') return true;

  return false;
}