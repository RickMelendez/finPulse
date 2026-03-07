import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, User, Mail, Lock, Pencil, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/auth';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'view' | 'edit';

interface FormState {
  email: string;
  newPassword: string;
  confirmPassword: string;
  currentPassword: string;
}

const EMPTY_FORM: FormState = {
  email: '',
  newPassword: '',
  confirmPassword: '',
  currentPassword: '',
};

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';
  const name = user?.email?.split('@')[0] ?? 'User';

  const [mode, setMode] = useState<Mode>('view');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset to view mode when drawer closes
  useEffect(() => {
    if (!open) {
      setMode('view');
      setForm(EMPTY_FORM);
      setError('');
      setSuccess(false);
    }
  }, [open]);

  // Prefill email when entering edit mode
  useEffect(() => {
    if (mode === 'edit') {
      setForm((f) => ({ ...f, email: user?.email ?? '' }));
      setError('');
      setSuccess(false);
    }
  }, [mode, user?.email]);

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

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSave = async () => {
    setError('');
    if (!form.currentPassword) {
      setError('Current password is required to save changes.');
      return;
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    const emailChanged = form.email.trim().toLowerCase() !== (user?.email ?? '');
    const passwordChanged = !!form.newPassword;

    if (!emailChanged && !passwordChanged) {
      setMode('view');
      return;
    }

    try {
      setSaving(true);
      await updateProfile(
        form.currentPassword,
        emailChanged ? form.email.trim() : undefined,
        passwordChanged ? form.newPassword : undefined,
      );
      setSuccess(true);
      setForm(EMPTY_FORM);
      setTimeout(() => {
        setMode('view');
        setSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
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
          'fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col',
          'bg-white border-l border-gray-200 shadow-xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-heading font-semibold text-slate-800 text-sm">
            {mode === 'edit' ? 'Edit Profile' : 'Account'}
          </span>
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
        <div className="flex flex-col items-center gap-3 px-5 py-8">
          <div className="w-[72px] h-[72px] rounded-full bg-brand flex items-center justify-center shadow-sm">
            <span className="text-white text-2xl font-heading font-bold select-none">{initial}</span>
          </div>
          <div className="text-center">
            <p className="text-base font-body font-semibold text-slate-800 capitalize">{name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email ?? ''}</p>
          </div>
        </div>

        {/* View mode */}
        {mode === 'view' && (
          <div className="px-4 space-y-2 flex-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <User size={15} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 leading-none mb-0.5">Username</p>
                <p className="text-sm font-body font-medium text-slate-700 capitalize">{name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <Mail size={15} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 leading-none mb-0.5">Email</p>
                <p className="text-sm font-body font-medium text-slate-700 truncate">{user?.email ?? '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit mode */}
        {mode === 'edit' && (
          <div className="px-4 space-y-3 flex-1 overflow-y-auto pb-2">
            {/* Email */}
            <div>
              <label className="block text-xs font-body font-medium text-slate-500 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-body text-slate-700 outline-none focus:border-brand focus:bg-white transition-colors"
                  placeholder="you@example.com"
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
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            {/* Confirm new password */}
            {form.newPassword.length > 0 && (
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
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="pt-1 pb-0.5">
              <div className="border-t border-gray-100" />
            </div>

            {/* Current password (required) */}
            <div>
              <label className="block text-xs font-body font-medium text-slate-500 mb-1.5">
                Current password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-body text-slate-700 outline-none focus:border-brand focus:bg-white transition-colors"
                  placeholder="Confirm with current password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs font-body text-red-600">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-100">
                <Check size={14} className="text-green-500 shrink-0" />
                <p className="text-xs font-body text-green-700">Profile updated successfully!</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setMode('view'); setForm(EMPTY_FORM); setError(''); }}
                disabled={saving}
                className="flex-1 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-slate-500 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-white bg-brand hover:bg-brand/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
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
