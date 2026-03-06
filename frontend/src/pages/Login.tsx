import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { AlertCircle, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { FinPulseLogo } from '../components/ui/FinPulseLogo';
import api from '../lib/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// ── Deterministic star positions (avoids re-render jitter) ──────────────────
const BG_STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  size: 1 + ((i * 0.43) % 2),
  top: (i * 7.3 + 3) % 100,
  left: (i * 13.7 + 5) % 100,
  opacity: 0.15 + ((i * 0.06) % 0.55),
  delay: (i * 0.4) % 4,
}));

const CARD_STARS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 1 + ((i * 0.35) % 1.8),
  top: (i * 5.9 + 6) % 94,
  left: (i * 11.3 + 3) % 94,
  opacity: 0.2 + ((i * 0.04) % 0.5),
}));

// ── 3D Tilt Financial Card ──────────────────────────────────────────────────
function FinPulseCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const holoRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const rotate = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ px: 0.5, py: 0.5 });

  useEffect(() => {
    const animate = () => {
      rotate.current.x += (target.current.x - rotate.current.x) * 0.08;
      rotate.current.y += (target.current.y - rotate.current.y) * 0.08;

      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(900px) rotateX(${rotate.current.x}deg) rotateY(${rotate.current.y}deg)`;
      }
      if (holoRef.current) {
        const { px, py } = mousePos.current;
        holoRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 65%)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mousePos.current = { px, py };
    target.current = {
      x: (py - 0.5) * 22,
      y: (px - 0.5) * -22,
    };
  };

  const handleMouseLeave = () => {
    target.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative cursor-pointer"
      style={{ width: 320, height: 202 }}
    >
      {/* Glow behind the card */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.4) 0%, transparent 70%)',
          filter: 'blur(24px)',
          transform: 'translateY(12px) scaleX(0.9)',
        }}
      />

      {/* The card itself */}
      <div
        ref={cardRef}
        className="w-full h-full relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #1a1a4e 100%)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
          willChange: 'transform',
        }}
      >
        {/* Holographic shimmer overlay */}
        <div
          ref={holoRef}
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: 'overlay', transition: 'none' }}
        />

        {/* Color streak gradient */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'linear-gradient(145deg, rgba(79,70,229,0.5) 0%, transparent 40%, rgba(16,185,129,0.35) 100%)',
          }}
        />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Stars */}
        {CARD_STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{ width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%`, opacity: s.opacity }}
          />
        ))}

        {/* Card content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <FinPulseLogo size={22} variant="full" light />
            <span className="text-white/30 font-body text-[10px] uppercase tracking-widest">Virtual</span>
          </div>

          {/* Chip */}
          <div
            className="w-10 h-7 rounded-md opacity-90"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)' }}
          />

          {/* Bottom section */}
          <div>
            <p className="font-heading text-white/50 text-xs tracking-[0.35em] mb-3">
              •••• •••• •••• 2025
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/30 font-body text-[9px] uppercase tracking-widest mb-0.5">Card Holder</p>
                <p className="text-white font-heading text-sm tracking-wide">FinPulse Member</p>
              </div>
              <div className="text-right">
                <p className="text-white/30 font-body text-[9px] uppercase tracking-widest mb-0.5">Expires</p>
                <p className="text-white font-heading text-sm">12/30</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  'bg-slate-50 dark:bg-slate-800/60 ' +
  'border border-slate-200 dark:border-slate-700 ' +
  'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:focus:ring-brand/40 ' +
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <FinPulseLogo size={48} variant="icon" className="mx-auto mb-6" />
        <h2 className="font-heading font-bold text-2xl text-white mb-1">Welcome back</h2>
        <p className="font-body text-white/50 text-sm mb-8 truncate max-w-xs">{email}</p>
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

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <AlreadyLoggedIn email={user.email} />;

  // ── Handlers ──
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
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMsg ?? (err instanceof Error ? err.message : 'Invalid credentials. Please try again.'));
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
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMsg ?? (err instanceof Error ? err.message : 'Registration failed. Please try again.'));
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
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err: unknown) {
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMsg ?? 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setError(null);
    setFieldErrors({});
  };

  const passwordsMatch = regConfirm.length > 0 && regPassword === regConfirm;

  // ── Layout ──
  const page = (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── Left panel — hidden on mobile ─────────────────────── */}
      <div
        className="hidden lg:flex flex-1 relative overflow-hidden flex-col items-center justify-center gap-10"
        style={{ background: 'linear-gradient(135deg, #020617 0%, #0c0a2e 40%, #0f172a 70%, #020617 100%)' }}
      >
        {/* Background stars */}
        {BG_STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              width: s.size,
              height: s.size,
              top: `${s.top}%`,
              left: `${s.left}%`,
              opacity: s.opacity,
            }}
          />
        ))}

        {/* Aurora blobs */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 500,
            height: 500,
            top: '-15%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 400,
            height: 400,
            bottom: '-10%',
            right: '-5%',
            background: 'radial-gradient(circle, rgba(8,145,178,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{ x: [0, -30, 0], y: [0, 25, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 300,
            height: 300,
            top: '55%',
            left: '30%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* 3D card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <FinPulseCard />
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="text-center px-8 max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="font-heading text-white/80 text-lg font-semibold leading-snug">
            Your financial universe,<br />intelligently tracked.
          </p>
          <p className="font-body text-white/40 text-sm mt-2 leading-relaxed">
            Spend smarter. Save more. Know your numbers.
          </p>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center px-8 max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {['AI Insights', 'Smart Budgets', 'All Accounts', 'Real-time Sync'].map((f) => (
            <span
              key={f}
              className="font-body text-xs px-3 py-1 rounded-full text-white/60 border border-white/10 bg-white/5"
            >
              {f}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Right panel — form ─────────────────────────────────── */}
      <div className="w-full lg:w-[460px] flex flex-col justify-center px-8 sm:px-12 py-12 bg-white dark:bg-slate-900 overflow-y-auto">
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FinPulseLogo size={36} variant="full" className="mb-3" />
          <p className="font-body text-slate-400 dark:text-slate-500 text-sm">
            Your personal finance command center
          </p>
        </motion.div>

        {/* Mode toggle tabs */}
        <motion.div
          className="flex mb-6 p-1 rounded-xl bg-slate-100 dark:bg-slate-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
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
        </motion.div>

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

        {/* Forms — animated swap */}
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              className="space-y-4"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
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
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
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
                  <p className="flex items-center gap-1 text-xs font-body text-income">
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
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-body text-slate-400">or continue with</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
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

        {/* Footer */}
        <p className="text-center text-xs font-body text-slate-400 dark:text-slate-600 mt-8">
          All data is encrypted and private.
        </p>
      </div>
    </div>
  );

  if (GOOGLE_CLIENT_ID) {
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{page}</GoogleOAuthProvider>;
  }

  return page;
}
