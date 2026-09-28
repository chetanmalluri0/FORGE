import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/auth.ts';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users, admins } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.forge_token;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : cookieToken;

  if (!token) {
    return next();
  }

  // 1. Try our internal JWT first
  const internalUser = verifyToken(token);
  if (internalUser) {
    req.user = internalUser;
    return next();
  }

  // 2. Try Firebase ID Token
  try {
    const decodedFirebase = await adminAuth.verifyIdToken(token);
    if (decodedFirebase) {
      // Find or sync user from DB
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.uid, decodedFirebase.uid));

      if (existingUser.length > 0) {
        req.user = {
          id: existingUser[0].id,
          uid: existingUser[0].uid,
          email: existingUser[0].email,
          name: existingUser[0].name,
          role: existingUser[0].role as any,
        };
      } else {
        // Upsert new customer from Firebase auth
        const inserted = await db
          .insert(users)
          .values({
            uid: decodedFirebase.uid,
            email: decodedFirebase.email || 'user@forge.app',
            name: decodedFirebase.name || decodedFirebase.email?.split('@')[0] || 'Athlete',
            role: 'CUSTOMER',
            avatarUrl: decodedFirebase.picture || null,
          })
          .returning();

        req.user = {
          id: inserted[0].id,
          uid: inserted[0].uid,
          email: inserted[0].email,
          name: inserted[0].name,
          role: 'CUSTOMER',
        };
      }
    }
  } catch (error) {
    // Token is invalid/expired
  }

  next();
};

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  next();
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  next();
};

export const requireStaffOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  if (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF') {
    return res.status(403).json({ error: 'Forbidden: Staff or Admin privileges required.' });
  }
  next();
};
