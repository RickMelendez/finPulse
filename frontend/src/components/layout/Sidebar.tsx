import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Wallet,
  Sparkles,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/auth';
import { FinPulseLogo } from '../ui/FinPulseLogo';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
  { to: '/budgets', label: 'Budgets', icon: <Target size={18} /> },
  { to: '/accounts', label: 'Accounts', icon: <Wallet size={18} /> },
  { to: '/insights', label: 'Insights', icon: <Sparkles size={18} /> },
];

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900 h-full border-r border-gray-200 dark:border-slate-700">
      {/* Logo */}
      <div className="flex items-center px-5 py-5 border-b border-gray-200 dark:border-slate-700">
        <FinPulseLogo size={30} variant="full" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium',
                'cursor-pointer transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
                isActive
                  ? 'bg-brand/10 text-brand font-semibold dark:bg-brand/20 dark:text-brand-light'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
              )
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-gray-200 dark:border-slate-700 pt-3">
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl',
            'text-sm font-body font-medium text-slate-500 dark:text-slate-400',
            'hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400',
            'cursor-pointer transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30',
          )}
        >
          <LogOut size={18} className="shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
