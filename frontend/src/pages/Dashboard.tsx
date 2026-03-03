import { LayoutDashboard } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Net Balance', 'Total Income', 'Total Expenses', 'Savings Rate'].map((label) => (
          <Card key={label}>
            <CardContent>
              <p className="text-xs font-body text-gray-400 uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className="font-heading text-2xl font-semibold text-primary-dark">
                &mdash;
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary-dark">
            <LayoutDashboard size={16} />
            <h2 className="font-heading font-semibold text-sm">Dashboard</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <LayoutDashboard size={40} className="mb-3 opacity-30" />
            <p className="font-body text-sm">Dashboard charts coming soon.</p>
            <p className="font-body text-xs text-gray-300 mt-1">
              Add transactions to see your spending overview.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
