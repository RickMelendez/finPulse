import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { ProfileDrawer } from './ProfileDrawer';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/accounts': 'Accounts',
  '/insights': 'AI Insights',
};

export function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const title = routeTitles[location.pathname] ?? 'FinPulse';
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <>
      <header
        className="h-14 md:h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-border dark:border-slate-700"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Page title */}
        <h1 className="font-heading font-semibold text-base md:text-lg text-slate-800 dark:text-white tracking-tight">
          {title}
        </h1>

        {/* User avatar — opens ProfileDrawer on ALL screen sizes */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-body text-slate-400 dark:text-slate-500 hidden sm:block">
            {user?.email}
          </span>
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 hover:ring-2 hover:ring-brand/25 transition-all"
            aria-label="Open profile"
            title={user?.email ?? 'Profile'}
          >
            <span className="text-white text-sm font-heading font-semibold select-none">
              {initial}
            </span>
          </button>
        </div>
      </header>

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
