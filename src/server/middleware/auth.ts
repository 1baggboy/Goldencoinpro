import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth as adminAuth } from '../lib/firebase';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized. Missing token." });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Try JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      // If JWT fails, try Firebase ID Token if admin auth is available
      if (adminAuth) {
        try {
          const firebaseUser = await adminAuth.verifyIdToken(token);
          const isAdmin = firebaseUser.email === 'info.goldencoinltd@gmail.com';
          req.user = {
            userId: firebaseUser.uid,
            role: isAdmin ? 'ADMIN' : 'USER',
            email: firebaseUser.email || ''
          };
          return next();
        } catch (fbErr) {
          console.warn('[Auth] Both JWT and Firebase token verification failed');
        }
      }
      throw jwtErr; // Re-throw JWT error if Firebase check also fails or isn't possible
    }
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: "Forbidden. Admin access required." });
  }
  next();
};
