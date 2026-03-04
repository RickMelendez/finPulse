import { Navigate, Route, Routes } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuth } from './lib/auth';
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
      <div className="min-h-screen bg-brand flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center w-20 h-20 bg-accent rounded-3xl shadow-xl">
          <TrendingUp size={40} className="text-white" />
        </div>
        <span className="font-heading font-bold text-3xl text-white tracking-tight">
          FinPulse
        </span>
        <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin mt-2" />
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
