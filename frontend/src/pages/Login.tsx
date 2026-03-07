import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { AlertCircle, Eye, EyeOff, CheckCircle2, ArrowRight, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { FinPulseLogo } from '../components/ui/FinPulseLogo';
import api, { setTokens } from '../lib/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function getApiError(err: unknown, fallback: string): string {
  const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return apiMsg ?? (err instanceof Error ? err.message : fallback);
}

const features = [
  { icon: <TrendingUp size={18} />, title: 'Smart Insights', desc: 'AI-powered spending analysis' },
  { icon: <Shield size={18} />, title: 'Bank-level Security', desc: 'End-to-end encrypted data' },
  { icon: <Sparkles size={18} />, title: 'Budget Planner', desc: 'Personalized AI budget plans' },
];

// ── Input field with show/hide support ───────────────────────────────────────
interface FieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  showToggle?: boolean;
}

const inputCls =
  'w-full rounded-xl px-4 py-3 text-sm font-body ' +
  'text-slate-800 dark:text-slate-100 ' +
  'bg-white dark:bg-slate-800 ' +
  'border border-gray-200 dark:border-slate-700 ' +
  'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:focus:ring-brand/30 ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'transition-all duration-200';

function Field({ label, type = 'text', placeholder, value, onChange, autoComplete, error, required, showToggle }: FieldProps) {
  const [show, setShow] = useState(false);
  const resolvedType = showToggle ? (show ? 'text' : 'password') : type;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-body font-medium text-slate-600 dark:text-slate-400">
        {label}
      </label>
      <div className="relative">
        <input
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          className={`${inputCls} ${showToggle ? 'pr-11' : ''}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs font-body text-red-500">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Already logged in state ──────────────────────────────────────────────────
function AlreadyLoggedIn({ email }: { email: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-10"
      >
        <FinPulseLogo size={48} variant="icon" className="mx-auto mb-6" />
        <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white mb-1">Welcome back</h2>
        <p className="font-body text-slate-500 dark:text-slate-400 text-sm mb-8 truncate max-w-xs">{email}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="flex items-center justify-center gap-2 mx-auto px-8 py-3 rounded-xl bg-brand text-white font-body font-medium text-sm hover:bg-brand-dark transition-colors"
        >
          Go to Dashboard <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
}

// ── Main Login / Register page ───────────────────────────────────────────────
export function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<'login' | 'register'>(
    () => (searchParams.get('mode') === 'register' ? 'register' : 'login'),
  );

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <AlreadyLoggedIn email={user.email} />;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail.trim() || !loginPassword) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(getApiError(err, 'Invalid credentials. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const validateRegister = () => {
    const errs: Record<string, string> = {};
    if (!regEmail.trim()) errs['email'] = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errs['email'] = 'Enter a valid email.';
    if (!regPassword) errs['password'] = 'Password is required.';
    else if (regPassword.length < 8) errs['password'] = 'At least 8 characters required.';
    if (!regConfirm) errs['confirm'] = 'Please confirm your password.';
    else if (regPassword !== regConfirm) errs['confirm'] = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateRegister()) return;
    setLoading(true);
    try {
      await register(regEmail.trim(), regPassword);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(getApiError(err, 'Registration failed. Please try again.'));
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
      setTokens(data.token, '');
      window.location.href = '/';
    } catch (err: unknown) {
      setError(getApiError(err, 'Google sign-in failed. Please try again.'));
      setLoading(false);
    }
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setError(null);
    setFieldErrors({});
  };

  const passwordsMatch = regConfirm.length > 0 && regPassword === regConfirm;

  const page = (
    <div className="min-h-screen flex overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* ── Left panel — brand panel, hidden on mobile ── */}
      <div className="hidden lg:flex w-[480px] shrink-0 flex-col bg-brand dark:bg-brand-dark relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <FinPulseLogo size={36} variant="full" light />

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            <div>
              <h2 className="font-heading font-bold text-4xl text-white leading-tight mb-3">
                Take control of your finances
              </h2>
              <p className="font-body text-white/70 text-base leading-relaxed">
                Track spending, set budgets, and get AI-powered insights — all in one place.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-white">
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-white text-sm">{f.title}</p>
                    <p className="font-body text-white/60 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="font-body text-white/40 text-xs">
            &copy; {new Date().getFullYear()} FinPulse. All data encrypted.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <FinPulseLogo size={36} variant="full" />
          </div>

          {/* Heading */}
          <motion.div
            className="mb-7"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p className="font-body text-slate-500 dark:text-slate-400 text-sm mt-1">
              {mode === 'login'
                ? 'Welcome back — enter your credentials to continue'
                : 'Start tracking your finances in minutes'}
            </p>
          </motion.div>

          {/* Mode toggle */}
          <div className="flex mb-6 p-1 rounded-xl bg-gray-100 dark:bg-slate-800">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={[
                  'flex-1 py-2 rounded-lg text-sm font-body font-medium transition-all duration-200',
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
                ].join(' ')}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-body">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                onSubmit={handleLogin}
                className="space-y-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                noValidate
              >
                <Field
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Field
                  label="Password"
                  showToggle
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                onSubmit={handleRegister}
                className="space-y-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                noValidate
              >
                <Field
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                  error={fieldErrors['email']}
                  required
                />
                <div className="space-y-1">
                  <Field
                    label="Password"
                    showToggle
                    placeholder="At least 8 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    error={fieldErrors['password']}
                    required
                  />
                  {regPassword.length > 0 && regPassword.length < 8 && (
                    <p className="text-xs font-body text-amber-500">
                      {8 - regPassword.length} more character{8 - regPassword.length !== 1 ? 's' : ''} needed
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Field
                    label="Confirm password"
                    showToggle
                    placeholder="Re-enter your password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    autoComplete="new-password"
                    error={fieldErrors['confirm']}
                    required
                  />
                  {passwordsMatch && (
                    <p className="flex items-center gap-1 text-xs font-body text-brand">
                      <CheckCircle2 size={11} /> Passwords match
                    </p>
                  )}
                </div>
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                  {loading ? 'Creating account…' : 'Create account'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Google OAuth */}
          {GOOGLE_CLIENT_ID && (
            <div className="mt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                <span className="text-xs font-body text-slate-400">or continue with</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              </div>
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
            </div>
          )}

          <p className="text-center text-xs font-body text-slate-400 dark:text-slate-600 mt-8">
            All data is encrypted and private.
          </p>
        </div>
      </div>
    </div>
  );

  if (GOOGLE_CLIENT_ID) {
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{page}</GoogleOAuthProvider>;
  }

  return page;
}
