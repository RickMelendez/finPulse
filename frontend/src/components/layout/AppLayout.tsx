import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar — desktop only */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        {/* Extra bottom padding on mobile to clear the fixed BottomNav */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-surface pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
