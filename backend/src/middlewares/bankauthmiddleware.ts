// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  client?: {
    id: string;
    tokenId: string;
  };
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(200).json({
      success: false,
      message: 'Authentication required. Valid Bearer token missing.'
    });
  }
console.log("before",authHeader)
  const token = authHeader.substring(7);
console.log("after ",token)
  try {
    const decoded = jwt.verify(token, process.env.BANK_JWT_SECRET as string, {
      audience: 'webhook-api',
      algorithms: ['HS256']
    }) as jwt.JwtPayload;

 console.log(decoded)
    next();
  } catch (error) {
    console.warn('Token verification failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip
    });

    return res.status(200).json({
      success: false,
      message: 'Invalid or expired token. Please obtain a new token.'
    });
  }
}