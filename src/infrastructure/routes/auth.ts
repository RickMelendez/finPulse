import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { JwtAuthService } from '../../adapters/services/JwtAuthService';
import { registerSchema, loginSchema, refreshSchema } from '../../shared/validators/auth.validators';
import { ValidationError } from '../../shared/errors/ValidationError';
import { AppError } from '../../shared/errors/AppError';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import db from '../config/database';

const router = Router();
const authService = new JwtAuthService();

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const tokens = await authService.register(result.data);
    res.status(201).json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const tokens = await authService.login(result.data);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = refreshSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed', { refreshToken: ['Refresh token is required'] });
    }
    const tokens = await authService.refresh(result.data.refreshToken);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] || '';
    await authService.logout(token);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/google
// Accepts a Google ID token, verifies it, and issues app JWT tokens.
// Creates the user on first sign-in (find-or-create).
router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new AppError('Google OAuth is not configured on this server', 501);
    }

    const { idToken } = req.body as { idToken?: string };
    if (!idToken || typeof idToken !== 'string') {
      throw new ValidationError('Validation failed', { idToken: ['idToken is required'] });
    }

    // Verify the Google ID token
    const client = new OAuth2Client(clientId);
    let email: string;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      const payload = ticket.getPayload();
      if (!payload?.email) throw new Error('No email in token payload');
      email = payload.email;
    } catch {
      throw new AppError('Invalid Google ID token', 401);
    }

    // Find or create user
    let user = await db('users').where({ email }).first();
    if (!user) {
      // Create with a random non-reversible password (OAuth users cannot use password login)
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const password_hash = await bcrypt.hash(randomPassword, 12);
      [user] = await db('users')
        .insert({ email, password_hash })
        .returning(['id', 'email']);
    }

    // Issue app JWT tokens
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError('JWT_SECRET not configured', 500);

    const payload = { sub: user.id, email: user.email };
    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60,
        user: { id: user.id, email: user.email },
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/auth/profile — update email and/or password (requires current password)
router.patch('/profile', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { currentPassword, email, newPassword } = req.body as {
      currentPassword?: string;
      email?: string;
      newPassword?: string;
    };

    if (!currentPassword || typeof currentPassword !== 'string') {
      throw new ValidationError('Validation failed', { currentPassword: ['Current password is required'] });
    }

    const dbUser = await db('users').where({ id: user.id }).first();
    if (!dbUser) throw new AppError('User not found', 404);

    const valid = await bcrypt.compare(currentPassword, dbUser.password_hash);
    if (!valid) throw new AppError('Current password is incorrect', 401);

    const updates: Record<string, unknown> = {};

    if (email && typeof email === 'string') {
      const trimmed = email.trim().toLowerCase();
      if (trimmed !== dbUser.email) {
        const existing = await db('users').where({ email: trimmed }).whereNot({ id: user.id }).first();
        if (existing) throw new AppError('Email already in use', 409);
        updates.email = trimmed;
      }
    }

    if (newPassword && typeof newPassword === 'string') {
      if (newPassword.length < 8) {
        throw new ValidationError('Validation failed', { newPassword: ['Password must be at least 8 characters'] });
      }
      updates.password_hash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return res.json({ success: true, data: { user: { id: user.id, email: dbUser.email } } });
    }

    const [updated] = await db('users').where({ id: user.id }).update(updates).returning(['id', 'email']);

    // Issue new tokens so the JWT reflects any email change
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError('JWT_SECRET not configured', 500);
    const payload = { sub: updated.id, email: updated.email };
    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn: '7d' });

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60,
        user: { id: updated.id, email: updated.email },
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
