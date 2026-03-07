import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Wallet,
  Sparkles,
  LogOut,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/auth';
import { FinPulseLogo } from '../ui/FinPulseLogo';

const mainNav = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
  { to: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={17} /> },
  { to: '/budgets', label: 'Budgets', icon: <Target size={17} /> },
  { to: '/accounts', label: 'Accounts', icon: <Wallet size={17} /> },
];

const featureNav = [
  { to: '/insights', label: 'AI Insights', icon: <Sparkles size={17} /> },
];

function NavItem({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium',
          'cursor-pointer transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20',
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800',
        )
      }
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col bg-white h-full border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-5 py-5 border-b border-gray-100">
        <FinPulseLogo size={28} variant="full" />
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-5">
        {/* Main Menu */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-body font-semibold text-slate-400 uppercase tracking-widest">
            Main Menu
          </p>
          <nav className="space-y-0.5" aria-label="Main navigation">
            {mainNav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </div>

        {/* Features */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-body font-semibold text-slate-400 uppercase tracking-widest">
            Features
          </p>
          <nav className="space-y-0.5" aria-label="Features navigation">
            {featureNav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom: Settings + Logout */}
      <div className="px-3 pb-5 border-t border-gray-100 pt-3 space-y-0.5">
        <button
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl',
            'text-sm font-body font-medium text-slate-500',
            'hover:bg-gray-100 hover:text-slate-800',
            'transition-all duration-150',
          )}
        >
          <Settings size={17} className="shrink-0" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl',
            'text-sm font-body font-medium text-red-500',
            'hover:bg-red-50',
            'transition-all duration-150',
          )}
        >
          <LogOut size={17} className="shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
