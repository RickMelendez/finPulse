import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Wallet,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
  { to: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={22} /> },
  { to: '/budgets', label: 'Budgets', icon: <Target size={22} /> },
  { to: '/accounts', label: 'Accounts', icon: <Wallet size={22} /> },
  { to: '/insights', label: 'Insights', icon: <Sparkles size={22} /> },
];

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-border dark:border-slate-700 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            clsx(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-body font-medium',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:bg-brand/5',
              isActive ? 'text-brand dark:text-brand-light' : 'text-slate-400 dark:text-slate-500',
            )
          }
        >
          {item.icon}
          <span className="text-[10px] leading-tight">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
