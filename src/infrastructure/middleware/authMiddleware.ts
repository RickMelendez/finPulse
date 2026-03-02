import { Request, Response, NextFunction } from 'express';
import { SupabaseAuthService } from '../../adapters/services/SupabaseAuthService';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';

const authService = new SupabaseAuthService();

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedError('Token not provided');

    const user = await authService.verifyToken(token);
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (err) {
    next(err);
  }
}
