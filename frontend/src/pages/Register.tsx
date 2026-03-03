import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors['email'] = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['email'] = 'Please enter a valid email address.';
    }

    if (!password) {
      errors['password'] = 'Password is required.';
    } else if (password.length < 8) {
      errors['password'] = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      errors['confirmPassword'] = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors['confirmPassword'] = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await register(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const fallback = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(apiMessage ?? fallback);
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo & heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4 shadow-lg shadow-primary/20">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-primary-dark tracking-tight">
            FinPulse
          </h1>
          <p className="font-body text-gray-500 text-sm mt-1">
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Error banner */}
          {error && (
            <div
              className="flex items-start gap-2.5 mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-body"
              role="alert"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors['email']}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors['password']}
                required
              />
              {password.length > 0 && password.length < 8 && (
                <p className="text-xs font-body text-amber-600">
                  {8 - password.length} more character{8 - password.length !== 1 ? 's' : ''} required
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors['confirmPassword']}
                required
              />
              {passwordsMatch && (
                <p className="flex items-center gap-1 text-xs font-body text-emerald-600">
                  <CheckCircle2 size={12} />
                  Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm font-body text-gray-500 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-medium hover:text-primary-dark cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs font-body text-gray-400 mt-6">
          Personal Finance Tracker &mdash; All data is encrypted and private.
        </p>
      </div>
    </div>
  );
}
