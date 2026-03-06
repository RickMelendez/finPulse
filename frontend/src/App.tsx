import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { FinPulseLogo } from './components/ui/FinPulseLogo';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { Accounts } from './pages/Accounts';
import { Insights } from './pages/Insights';

/**
 * Guards a route — redirects to /login when no auth token is present.
 * Shows a branded splash screen while auth is being restored from localStorage.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5"
        style={{ background: 'linear-gradient(135deg, #020617 0%, #0c0a2e 50%, #0f172a 100%)' }}
      >
        <FinPulseLogo size={64} variant="icon" />
        <FinPulseLogo size={40} variant="full" light className="opacity-90" />
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin mt-1" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected application routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="insights" element={<Insights />} />
      </Route>

      {/* Catch-all: redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
