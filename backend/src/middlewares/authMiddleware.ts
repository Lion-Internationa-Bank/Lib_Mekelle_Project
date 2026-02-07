// src/middleware/authMiddleware.ts
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.ts';
import { UserRole } from '../generated/prisma/enums.ts';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// ← THIS IS THE FIX: add generics to AuthRequest
export interface AuthRequest<
  P = {
    request_id?: string;
    session_id?: string;
    document_id?:string;
    step?:string;
    filename?:string;
    lease_id?:string;
    upin?:string;
    encumbrance_id?:string;
  },
  ResBody = any,
  ReqBody = any,
  ReqQuery = {
    page?: string;
    limit?: string;
    search?: string;
    sub_city_id?: string;
    tenure_type?: string;
    ketena?: string;
    land_use?: string;
    
  }
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    user_id: string;
    role: UserRole;
    sub_city_id: string | null;
  };
}
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
// 
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload === 'string') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    if (!payload.userId || typeof payload.userId !== 'string') {
      return res.status(401).json({ message: 'Invalid token: missing or invalid userId' });
    }

    const userId = payload.userId;

    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        role: true,
        sub_city_id: true,
        is_active: true,
        is_deleted: true,
      },
    });

    if (!user || user.is_deleted || !user.is_active) {
      return res.status(401).json({ message: 'Invalid or revoked token' });
    }

    req.user = {
      user_id: user.user_id,
      role: user.role,
      sub_city_id: user.sub_city_id,
    };
    console.log(req.user)

    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};