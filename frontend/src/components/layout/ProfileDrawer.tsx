import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, User, Mail, Lock, Pencil, Check, AlertCircle, Phone, Send } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/auth';
import api from '../../lib/api';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  email: string;
  newPassword: string;
  confirmPassword: string;
  currentPassword: string;
  name: string;
  phone: string;
}

const EMPTY_FORM: FormState = {
  email: '',
  newPassword: '',
  confirmPassword: '',
  currentPassword: '',
  name: '',
  phone: '',
};

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingAlert, setTestingAlert] = useState(false);
  const [alertResult, setAlertResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Reset to view on close
  useEffect(() => {
    if (!open) {
      setMode('view');
      setForm(EMPTY_FORM);
      setError('');
      setSuccess(false);
    }
  }, [open]);

  // Prefill form when entering edit mode
  useEffect(() => {
    if (mode === 'edit') {
      setForm((f) => ({ ...f, email: user?.email ?? '', name: user?.name ?? '', phone: user?.phone ?? '' }));
      setError('');
      setSuccess(false);
    }
  }, [mode, user?.email, user?.name, user?.phone]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSave = async () => {
    setError('');
    const emailChanged = form.email.trim() !== (user?.email ?? '');
    const passwordChanged = !!form.newPassword;
    const nameChanged = (form.name.trim() || null) !== (user?.name ?? null);
    const phoneChanged = (form.phone.trim() || null) !== (user?.phone ?? null);

    if (!emailChanged && !passwordChanged && !nameChanged && !phoneChanged) {
      setMode('view');
      return;
    }

    if (passwordChanged && form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if ((emailChanged || passwordChanged) && !form.currentPassword) {
      setError('Current password is required to change email or password.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(
        form.currentPassword,
        emailChanged ? form.email.trim() : undefined,
        passwordChanged ? form.newPassword : undefined,
        form.name.trim() || undefined,
        form.phone.trim() || undefined,
      );
      setSuccess(true);
      setTimeout(() => {
        setMode('view');
        setSuccess(false);
      }, 1200);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlert = async () => {
    setTestingAlert(true);
    setAlertResult(null);
    try {
      await api.post('/notifications/test');
      setAlertResult('success');
    } catch {
      setAlertResult('error');
    } finally {
      setTestingAlert(false);
      setTimeout(() => setAlertResult(null), 3000);
    }
  };

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="User profile"
        className={clsx(
          'fixed right-0 top-0 bottom-0 z-50 w-72 flex flex-col',
          'bg-white border-l border-gray-200 shadow-xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-heading font-semibold text-slate-800 text-sm">Account</span>
          <div className="flex items-center gap-1">
            {mode === 'view' && (
              <button
                onClick={() => setMode('edit')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gray-100 transition-colors"
                aria-label="Edit profile"
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 px-5 py-6">
          <div className="w-[72px] h-[72px] rounded-full bg-brand flex items-center justify-center shadow-sm">
            <span className="text-white text-2xl font-heading font-bold select-none">{initial}</span>
          </div>
          <div className="text-center">
            <p className="text-base font-body font-semibold text-slate-800 capitalize">{displayName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email ?? 'User'}</p>
          </div>
        </div>

        {/* View mode */}
        {mode === 'view' && (
          <div className="px-4 space-y-2 flex-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <User size={15} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 leading-none mb-0.5">Name</p>
                <p className="text-sm font-body font-medium text-slate-700 capitalize">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <Mail size={15} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 leading-none mb-0.5">Email</p>
                <p className="text-sm font-body font-medium text-slate-700 truncate">{user?.email ?? '—'}</p>
              </div>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <Phone size={15} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 leading-none mb-0.5">Phone</p>
                  <p className="text-sm font-body font-medium text-slate-700">{user.phone}</p>
                </div>
              </div>
            )}

            {/* Test alert button */}
            <div className="pt-2">
              <button
                onClick={handleTestAlert}
                disabled={testingAlert}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-body font-medium text-brand border border-brand/20 hover:bg-brand/5 transition-colors disabled:opacity-50"
              >
                <Send size={14} className="shrink-0" />
                {testingAlert ? 'Sending…' : 'Send test alert'}
              </button>
              {alertResult === 'success' && (
                <p className="text-xs text-green-600 mt-1.5 px-1 flex items-center gap-1">
                  <Check size={12} /> Alert sent! Check your email{user?.phone ? ' and phone' : ''}.
                </p>
              )}
              {alertResult === 'error' && (
                <p className="text-xs text-red-500 mt-1.5 px-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Failed to send. Check server config.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Edit mode */}
        {mode === 'edit' && (
          <div className="px-4 space-y-3 flex-1 overflow-y-auto py-1">
            {/* Display name */}
            <div>
              <label className="block text-xs font-body font-medium text-slate-500 mb-1.5">
                Display name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-body text-slate-700 outline-none focus:border-brand focus:bg-white transition-colors"
                  placeholder="Your display name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-body font-medium text-slate-500 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-body text-slate-700 outline-none focus:border-brand focus:bg-white transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-body font-medium text-slate-500 mb-1.5">
                New password <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-body text-slate-700 outline-none focus:border-brand focus:bg-white transition-colors"
                  placeholder="New password"
                />
              </div>
            </div>

            {form.newPassword && (
              <div>
                <label className="block text-xs font-body font-medium text-slate-500 mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-body text-slate-700 outline-none focus:border-brand focus:bg-white transition-colors"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            )}

            {/* Phone number */}
            <div>
              <label className="block text-xs font-body font-medium text-slate-500 mb-1.5">
                Phone <span className="text-slate-400 font-normal">(for SMS alerts)</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-body text-slate-700 outline-none focus:border-brand focus:bg-white transition-colors"
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <label className="block text-xs font-body font-medium text-slate-500 mb-1.5">
                Current password <span className="text-slate-400 font-normal">(required for email/password changes)</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-body text-slate-700 outline-none focus:border-brand focus:bg-white transition-colors"
                  placeholder="Current password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-500 px-1">
                <AlertCircle size={12} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-xs text-green-600 px-1">
                <Check size={12} className="shrink-0" />
                Profile updated!
              </div>
            )}

            <div className="flex gap-2 pt-1 pb-2">
              <button
                onClick={() => setMode('view')}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-body font-medium text-slate-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-body font-medium hover:bg-brand/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Sign out */}
        <div className="px-4 pb-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-body font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
