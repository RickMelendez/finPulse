import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { SkeletonStat, SkeletonCard, SkeletonRow } from '../components/ui/Skeleton';
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
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonStat key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonCard className="lg:col-span-2" h={288} />
          <SkeletonCard h={288} />
        </div>
        <Card>
          <CardHeader>
            <div className="h-4 w-40 shimmer rounded" />
          </CardHeader>
          <CardContent className="divide-y divide-border dark:divide-slate-700">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-income">
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Income
              </p>
              <TrendingUp size={18} className="text-income" />
            </div>
            <AnimatedNumber
              value={summary.data?.totalIncome ?? 0}
              className="font-heading text-xl font-bold text-income"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-expense">
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Expenses
              </p>
              <TrendingDown size={18} className="text-expense" />
            </div>
            <AnimatedNumber
              value={summary.data?.totalExpenses ?? 0}
              className="font-heading text-xl font-bold text-expense"
            />
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${net >= 0 ? 'border-l-income' : 'border-l-expense'}`}>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Net Balance
              </p>
              <Wallet size={18} className="text-brand dark:text-brand-light" />
            </div>
            <AnimatedNumber
              value={net}
              className={`font-heading text-xl font-bold ${net >= 0 ? 'text-income' : 'text-expense'}`}
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Transactions
              </p>
              <ArrowLeftRight size={18} className="text-accent" />
            </div>
            <AnimatedNumber
              value={txCount}
              format={{ style: 'decimal' }}
              className="font-heading text-xl font-bold text-accent"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-heading text-sm font-semibold text-slate-800 dark:text-white">
              Income vs Expenses (3 months)
            </h2>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-heading text-sm font-semibold text-slate-800 dark:text-white">
              Top Categories
            </h2>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <CategoryPieChart data={pieData} />
            ) : (
              <p className="text-center py-16 text-slate-400 dark:text-slate-500 font-body text-sm">
                No expense data
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <h2 className="font-heading text-sm font-semibold text-slate-800 dark:text-white">
            Recent Transactions
          </h2>
        </CardHeader>
        <CardContent>
          {(recent.data?.data ?? []).length === 0 ? (
            <p className="text-center py-8 text-slate-400 dark:text-slate-500 font-body text-sm">
              No transactions yet
            </p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-border dark:divide-slate-700">
                {(recent.data?.data ?? []).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-body font-medium text-slate-800 dark:text-slate-100 text-sm truncate">
                        {tx.description}
                      </p>
                      <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(tx.transactionDate).toLocaleDateString()} &middot;{' '}
                        {catMap[tx.categoryId] ?? '—'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`font-heading font-semibold text-sm ${
                          tx.type === 'income' ? 'text-income' : 'text-expense'
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
                    <tr className="border-b border-border dark:border-slate-700">
                      {['Date', 'Description', 'Category', 'Amount', 'Type'].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
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
                        className="border-b border-border dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                      >
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 text-slate-800 dark:text-slate-100 font-medium">
                          {tx.description}
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                          {catMap[tx.categoryId] ?? '—'}
                        </td>
                        <td
                          className={`py-2 px-3 font-heading font-semibold ${
                            tx.type === 'income' ? 'text-income' : 'text-expense'
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
