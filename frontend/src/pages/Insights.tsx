import { Sparkles } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export function Insights() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary-dark">
          <Sparkles size={16} />
          <h2 className="font-heading font-semibold text-sm">AI Insights</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Sparkles size={40} className="mb-3 opacity-30" />
          <p className="font-body text-sm">AI spending insights coming soon.</p>
          <p className="font-body text-xs text-gray-300 mt-1">
            Get Claude-powered recommendations based on your spending patterns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
