import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import {
  useTransactionSummary,
  useTransactions,
  useCategories,
} from '../hooks/useApi';

function getPeriods(): [string, string, string] {
  const now = new Date();
  return [0, 1, 2].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }) as [string, string, string];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export function Dashboard() {
  const [currentPeriod, prev1, prev2] = getPeriods();
  const summary = useTransactionSummary(currentPeriod);
  const sum1 = useTransactionSummary(prev1);
  const sum2 = useTransactionSummary(prev2);
  const recent = useTransactions({ limit: 5, page: 1 });
  const categories = useCategories();

  const catMap = Object.fromEntries(
    (categories.data ?? []).map((c) => [c.id, c.name]),
  );

  const chartData = [
    {
      month: prev2,
      income: sum2.data?.totalIncome ?? 0,
      expenses: sum2.data?.totalExpenses ?? 0,
    },
    {
      month: prev1,
      income: sum1.data?.totalIncome ?? 0,
      expenses: sum1.data?.totalExpenses ?? 0,
    },
    {
      month: currentPeriod,
      income: summary.data?.totalIncome ?? 0,
      expenses: summary.data?.totalExpenses ?? 0,
    },
  ];

  const pieData = (summary.data?.byCategory ?? [])
    .filter((c) => c.type === 'expense')
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map((c) => ({ name: catMap[c.categoryId] ?? c.categoryId, value: c.total }));

  const txCount = (summary.data?.byCategory ?? []).reduce(
    (acc, c) => acc + c.count,
    0,
  );
  const net = summary.data?.netBalance ?? 0;
  const isLoading = summary.isLoading || recent.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 bg-gray-200 rounded-xl" />
          <div className="h-72 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-primary-dark">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-gray-500 uppercase tracking-wider">
                Income
              </p>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <p className="font-heading text-2xl font-bold text-emerald-600">
              {fmt(summary.data?.totalIncome ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-gray-500 uppercase tracking-wider">
                Expenses
              </p>
              <TrendingDown size={18} className="text-red-500" />
            </div>
            <p className="font-heading text-2xl font-bold text-red-600">
              {fmt(summary.data?.totalExpenses ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-gray-500 uppercase tracking-wider">
                Net Balance
              </p>
              <Wallet size={18} className="text-primary-light" />
            </div>
            <p
              className={`font-heading text-2xl font-bold ${
                net >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {fmt(net)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-gray-500 uppercase tracking-wider">
                Transactions
              </p>
              <ArrowLeftRight size={18} className="text-accent" />
            </div>
            <p className="font-heading text-2xl font-bold text-accent">{txCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-heading text-sm font-semibold text-primary-dark">
              Income vs Expenses (3 months)
            </h2>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-heading text-sm font-semibold text-primary-dark">
              Top Categories
            </h2>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <CategoryPieChart data={pieData} />
            ) : (
              <p className="text-center py-16 text-gray-400 font-body text-sm">
                No expense data
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <h2 className="font-heading text-sm font-semibold text-primary-dark">
            Recent Transactions
          </h2>
        </CardHeader>
        <CardContent>
          {(recent.data?.data ?? []).length === 0 ? (
            <p className="text-center py-8 text-gray-400 font-body text-sm">
              No transactions yet
            </p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-gray-50">
                {(recent.data?.data ?? []).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-body font-medium text-primary-dark text-sm truncate">
                        {tx.description}
                      </p>
                      <p className="font-body text-xs text-gray-400 mt-0.5">
                        {new Date(tx.transactionDate).toLocaleDateString()} &middot;{' '}
                        {catMap[tx.categoryId] ?? '—'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`font-heading font-semibold text-sm ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {fmt(tx.amount)}
                      </p>
                      <Badge variant={tx.type}>{tx.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full font-body text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Date', 'Description', 'Category', 'Amount', 'Type'].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(recent.data?.data ?? []).map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-default"
                      >
                        <td className="py-2 px-3 text-gray-500">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 text-primary-dark font-medium">
                          {tx.description}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {catMap[tx.categoryId] ?? '—'}
                        </td>
                        <td
                          className={`py-2 px-3 font-heading font-semibold ${
                            tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {fmt(tx.amount)}
                        </td>
                        <td className="py-2 px-3">
                          <Badge variant={tx.type}>{tx.type}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
