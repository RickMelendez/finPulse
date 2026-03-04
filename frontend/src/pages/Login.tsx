import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../lib/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Shown when user is already authenticated and visits /login
function AlreadyLoggedIn({ email }: { email: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-brand via-brand-dark to-slate-900">
      <div className="w-full max-w-sm glass rounded-3xl p-8 text-center shadow-2xl">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-brand rounded-2xl mb-5 shadow-lg">
          <TrendingUp size={28} className="text-white" />
        </div>
        <h1 className="font-heading font-bold text-xl text-slate-800 tracking-tight mb-1">
          Welcome back
        </h1>
        <p className="font-body text-slate-500 text-sm mb-6 truncate">{email}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-brand text-white font-body font-medium text-sm hover:bg-brand-dark transition-colors"
        >
          Go to Dashboard
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in — show welcome back screen instead of redirecting
  if (user) {
    return <AlreadyLoggedIn email={user.email} />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMessage ?? message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: { id: string; email: string } }>(
        '/auth/google',
        { idToken: credentialResponse.credential },
      );
      // Reuse the same login flow by storing the token directly
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMessage ?? 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const loginForm = (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-brand via-brand-dark to-slate-900">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-brand-light/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
            <TrendingUp size={28} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-white tracking-tight">
            FinPulse
          </h1>
          <p className="font-body text-white/60 text-sm mt-1">
            Your personal finance command center
          </p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-3xl shadow-2xl p-8">
          <h2 className="font-heading font-semibold text-lg text-slate-800 mb-6">
            Sign in to your account
          </h2>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2.5 mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-body"
              role="alert"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          {GOOGLE_CLIENT_ID && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-body text-slate-400">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Google OAuth */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed. Please try again.')}
                  theme="outline"
                  shape="pill"
                  size="large"
                  text="continue_with"
                />
              </div>
            </>
          )}

          <p className="text-center text-sm font-body text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-brand font-medium hover:text-brand-dark transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs font-body text-white/30 mt-6">
          Personal Finance Tracker &mdash; All data is encrypted and private.
        </p>
      </div>
    </div>
  );

  // Wrap in GoogleOAuthProvider only when client ID is configured
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {loginForm}
      </GoogleOAuthProvider>
    );
  }

  return loginForm;
}
