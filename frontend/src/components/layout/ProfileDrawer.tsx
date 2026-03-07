import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, User, Mail } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/auth';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';
  const name = user?.email?.split('@')[0] ?? 'User';

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
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 px-5 py-8">
          <div className="w-[72px] h-[72px] rounded-full bg-brand flex items-center justify-center shadow-sm">
            <span className="text-white text-2xl font-heading font-bold select-none">{initial}</span>
          </div>
          <div className="text-center">
            <p className="text-base font-body font-semibold text-slate-800 capitalize">{name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email ?? 'User'}</p>
          </div>
        </div>

        {/* Info rows */}
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
