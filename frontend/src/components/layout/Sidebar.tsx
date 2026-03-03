import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Wallet,
  Sparkles,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/auth';

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
    <aside className="w-64 shrink-0 flex flex-col bg-primary h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-lg shrink-0">
          <TrendingUp size={18} className="text-white" />
        </div>
        <span className="font-heading font-bold text-lg text-white tracking-tight">
          FinPulse
        </span>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium',
                'cursor-pointer transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-3">
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
            'text-sm font-body font-medium text-white/70',
            'hover:bg-white/5 hover:text-white',
            'cursor-pointer transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          )}
        >
          <LogOut size={18} className="shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
