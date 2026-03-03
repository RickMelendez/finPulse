import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import api, { setTokens, clearTokens, getAccessToken } from './api';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Decode a JWT token and extract the payload.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url decode the payload segment
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const id = (payload['sub'] as string) ?? '';
  const email = (payload['email'] as string) ?? '';

  if (!id || !email) return null;
  return { id, email };
}

interface AuthApiResponse {
  user: { id: string; email: string };
  session: { access_token: string; refresh_token: string };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const restored = userFromToken(token);
      setUser(restored);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { data } = await api.post<AuthApiResponse>('/auth/login', { email, password });
    setTokens(data.session.access_token, data.session.refresh_token);
    setUser({ id: data.user.id, email: data.user.email });
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<void> => {
    const { data } = await api.post<AuthApiResponse>('/auth/register', { email, password });
    setTokens(data.session.access_token, data.session.refresh_token);
    setUser({ id: data.user.id, email: data.user.email });
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout — always clear local state
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
