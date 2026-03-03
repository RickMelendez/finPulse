import { Router, Request, Response, NextFunction } from 'express';
import { JwtAuthService } from '../../adapters/services/JwtAuthService';
import { registerSchema, loginSchema, refreshSchema } from '../../shared/validators/auth.validators';
import { ValidationError } from '../../shared/errors/ValidationError';

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

export default router;
