import { Target } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export function Budgets() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary-dark">
          <Target size={16} />
          <h2 className="font-heading font-semibold text-sm">Budgets</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Target size={40} className="mb-3 opacity-30" />
          <p className="font-body text-sm">Budget tracking coming soon.</p>
          <p className="font-body text-xs text-gray-300 mt-1">
            Set budgets per category and track your spending against them.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
