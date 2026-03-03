import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedError('Token not provided');

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new UnauthorizedError('Server misconfigured');

    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    (req as AuthenticatedRequest).user = { id: payload.sub as string, email: payload.email as string };
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}
