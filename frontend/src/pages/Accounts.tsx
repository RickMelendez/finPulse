import { Wallet } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export function Accounts() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary-dark">
          <Wallet size={16} />
          <h2 className="font-heading font-semibold text-sm">Accounts</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Wallet size={40} className="mb-3 opacity-30" />
          <p className="font-body text-sm">Account management coming soon.</p>
          <p className="font-body text-xs text-gray-300 mt-1">
            Connect and manage your checking, savings, and credit accounts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
