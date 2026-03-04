import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/accounts': 'Accounts',
  '/insights': 'AI Insights',
};

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const title = routeTitles[location.pathname] ?? 'FinPulse';
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header
      className="h-14 md:h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-100"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Page title */}
      <h1 className="font-heading font-semibold text-base md:text-lg text-primary-dark tracking-tight">
        {title}
      </h1>

      {/* User menu */}
      <div className="relative flex items-center gap-3">
        <span className="text-sm font-body text-gray-500 hidden sm:block">
          {user?.email}
        </span>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="User menu"
          title={user?.email ?? 'User'}
        >
          <span className="text-white text-sm font-heading font-semibold select-none">
            {initial}
          </span>
        </button>

        {/* Mobile user dropdown */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-lg border border-gray-100 min-w-[180px] py-1 md:hidden">
              <p className="px-4 py-2 text-xs font-body text-gray-400 truncate border-b border-gray-50">
                {user?.email}
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-body text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
