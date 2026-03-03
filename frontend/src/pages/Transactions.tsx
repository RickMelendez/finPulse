import { ArrowLeftRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export function Transactions() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary-dark">
          <ArrowLeftRight size={16} />
          <h2 className="font-heading font-semibold text-sm">Transactions</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ArrowLeftRight size={40} className="mb-3 opacity-30" />
          <p className="font-body text-sm">Transaction list coming soon.</p>
          <p className="font-body text-xs text-gray-300 mt-1">
            This page will list all your income and expense transactions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
