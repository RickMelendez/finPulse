import { useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

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

  const title = routeTitles[location.pathname] ?? 'FinPulse';
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white border-b border-gray-100">
      {/* Page title */}
      <h1 className="font-heading font-semibold text-lg text-primary-dark tracking-tight">
        {title}
      </h1>

      {/* User info */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-body text-gray-500 hidden sm:block">
          {user?.email}
        </span>
        <div
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"
          aria-label={`Signed in as ${user?.email ?? 'user'}`}
          title={user?.email ?? 'User'}
        >
          <span className="text-white text-sm font-heading font-semibold select-none">
            {initial}
          </span>
        </div>
      </div>
    </header>
  );
}
