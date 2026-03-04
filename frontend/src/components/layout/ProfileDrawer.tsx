import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  X,
  LogOut,
  Sun,
  Moon,
  Monitor,
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Wallet,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/auth';
import { useTheme, type Theme } from '../../lib/theme';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
  { to: '/budgets', label: 'Budgets', icon: <Target size={18} /> },
  { to: '/accounts', label: 'Accounts', icon: <Wallet size={18} /> },
  { to: '/insights', label: 'AI Insights', icon: <Sparkles size={18} /> },
];

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={16} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { value: 'system', label: 'Auto', icon: <Monitor size={16} /> },
];

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Profile and settings"
        className={clsx(
          'fixed right-0 top-0 bottom-0 z-50 w-72 flex flex-col',
          'bg-white dark:bg-slate-900',
          'border-l border-border dark:border-slate-700',
          'shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-slate-700">
          <span className="font-heading font-semibold text-slate-800 dark:text-white text-sm">
            My Profile
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar + Email */}
        <div className="flex flex-col items-center gap-3 px-5 py-6 border-b border-border dark:border-slate-700">
          <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-heading font-bold select-none">
              {initial}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-body font-medium text-slate-800 dark:text-white truncate max-w-[200px]">
              {user?.email ?? 'User'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Personal account</p>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="px-5 py-4 border-b border-border dark:border-slate-700">
          <p className="text-xs font-body font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Appearance
          </p>
          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {themeOptions.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-body font-medium transition-all duration-150',
                  theme === value
                    ? 'bg-white dark:bg-slate-700 text-brand shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Nav links (mobile primarily) */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <p className="px-2 text-xs font-body font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium mb-0.5',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-brand/10 text-brand dark:text-brand-light'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                )
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-6 border-t border-border dark:border-slate-700 pt-3">
          <button
            onClick={handleLogout}
            className={clsx(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl',
              'text-sm font-body font-medium text-red-500',
              'hover:bg-red-50 dark:hover:bg-red-950/30',
              'transition-colors duration-150',
            )}
          >
            <LogOut size={18} className="shrink-0" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
