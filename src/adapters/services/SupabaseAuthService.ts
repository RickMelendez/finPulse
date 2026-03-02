import { supabase } from '../../infrastructure/config/supabase';
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

export class SupabaseAuthService {
  async register(input: RegisterInput): Promise<AuthTokens> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (error) throw new AppError(error.message, 400);
    if (!data.session || !data.user) throw new AppError('Registration failed', 500);

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user: { id: data.user.id, email: data.user.email! },
    };
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) throw new AppError('Invalid email or password', 401);
    if (!data.session || !data.user) throw new AppError('Login failed', 500);

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user: { id: data.user.id, email: data.user.email! },
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error) throw new AppError('Invalid or expired refresh token', 401);
    if (!data.session || !data.user) throw new AppError('Token refresh failed', 500);

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user: { id: data.user.id, email: data.user.email! },
    };
  }

  async logout(accessToken: string): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AppError(error.message, 500);
  }

  async verifyToken(token: string): Promise<{ id: string; email: string }> {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new AppError('Invalid or expired token', 401);
    return { id: data.user.id, email: data.user.email! };
  }
}
