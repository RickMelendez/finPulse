import { useState, useRef, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { ProfileDrawer } from './ProfileDrawer';

export function Header() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'User';
  const initial = displayName.charAt(0).toUpperCase();

  // Close bell dropdown on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  return (
    <>
      <header
        className="h-14 md:h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200 gap-4"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions, budgets..."
            className="text-sm font-body text-slate-700 bg-transparent outline-none w-full placeholder:text-slate-400"
          />
        </div>

        {/* Right: bell + avatar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Bell with dropdown */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen((v) => !v)}
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Notifications"
              aria-expanded={bellOpen}
            >
              <Bell size={16} className="text-slate-500" />
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-heading font-semibold text-slate-800">Notifications</span>
                  <span className="text-xs text-slate-400">0 unread</span>
                </div>
                <div className="flex flex-col items-center justify-center py-10 px-6 gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bell size={20} className="text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-body font-medium text-slate-700">No notifications yet</p>
                    <p className="text-xs text-slate-400 mt-1">We'll alert you when budgets are exceeded or spending spikes.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2.5 focus:outline-none"
            aria-label="Open profile"
          >
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-heading font-semibold select-none">{initial}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-body font-semibold text-slate-800 leading-tight capitalize">{displayName}</p>
              <p className="text-xs font-body text-slate-400 leading-tight truncate max-w-[160px]">{user?.email}</p>
            </div>
          </button>
        </div>
      </header>

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
