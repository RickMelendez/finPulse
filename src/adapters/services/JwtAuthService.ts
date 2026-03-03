import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../infrastructure/config/database';
import { AppError } from '../../shared/errors/AppError';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
  };
}

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const ACCESS_EXPIRES_SECONDS = 15 * 60;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET not configured', 500);
  return secret;
}

function issueTokens(user: { id: string; email: string }): AuthTokens {
  const secret = getSecret();
  const payload = { sub: user.id, email: user.email };
  const accessToken = jwt.sign(payload, secret, { expiresIn: ACCESS_EXPIRES_IN });
  const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn: REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken, expiresIn: ACCESS_EXPIRES_SECONDS, user };
}

export class JwtAuthService {
  async register(input: RegisterInput): Promise<AuthTokens> {
    const existing = await db('users').where({ email: input.email }).first();
    if (existing) throw new AppError('Email already registered', 409);

    const password_hash = await bcrypt.hash(input.password, 12);
    const [user] = await db('users')
      .insert({ email: input.email, password_hash })
      .returning(['id', 'email']);

    return issueTokens(user);
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await db('users').where({ email: input.email }).first();
    if (!user) throw new AppError('Invalid email or password', 401);

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) throw new AppError('Invalid email or password', 401);

    return issueTokens({ id: user.id, email: user.email });
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const secret = getSecret();
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(refreshToken, secret) as jwt.JwtPayload;
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }
    if (payload.type !== 'refresh') throw new AppError('Invalid token type', 401);

    const user = await db('users').where({ id: payload.sub }).first();
    if (!user) throw new AppError('User not found', 401);

    return issueTokens({ id: user.id, email: user.email });
  }

  async verifyToken(token: string): Promise<{ id: string; email: string }> {
    const secret = getSecret();
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, secret) as jwt.JwtPayload;
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
    return { id: payload.sub as string, email: payload.email as string };
  }

  async logout(_accessToken: string): Promise<void> {
    // Stateless JWT — tokens expire naturally. For production, implement a
    // token denylist (e.g. Redis) here if needed.
  }
}
