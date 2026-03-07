import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight, ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { SkeletonStat, SkeletonCard, SkeletonRow } from '../components/ui/Skeleton';
import { useAuth } from '../lib/auth';
import {
  useTransactionSummary,
  useTransactions,
  useCategories,
  useBudgets,
} from '../hooks/useApi';

function getPeriods(): [string, string, string] {
  const now = new Date();
  return [0, 1, 2].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }) as [string, string, string];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtFull = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export function Dashboard() {
  const { user } = useAuth();
  const firstName = (user?.email ?? 'there').split('@')[0];

  const [currentPeriod, prev1, prev2] = getPeriods();
  const summary = useTransactionSummary(currentPeriod);
  const sum1 = useTransactionSummary(prev1);
  const sum2 = useTransactionSummary(prev2);
  const recent = useTransactions({ limit: 5, page: 1 });
  const categories = useCategories();
  const budgets = useBudgets();

  const catMap = Object.fromEntries(
    (categories.data ?? []).map((c) => [c.id, c.name]),
  );

  const chartData = [
    { month: prev2, income: sum2.data?.totalIncome ?? 0, expenses: sum2.data?.totalExpenses ?? 0 },
    { month: prev1, income: sum1.data?.totalIncome ?? 0, expenses: sum1.data?.totalExpenses ?? 0 },
    { month: currentPeriod, income: summary.data?.totalIncome ?? 0, expenses: summary.data?.totalExpenses ?? 0 },
  ];

  const income = summary.data?.totalIncome ?? 0;
  const expenses = summary.data?.totalExpenses ?? 0;
  const net = summary.data?.netBalance ?? 0;
  const savingsPct = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;
  const txCount = (summary.data?.byCategory ?? []).reduce((acc, c) => acc + c.count, 0);

  const topCategories = (summary.data?.byCategory ?? [])
    .filter((c) => c.type === 'expense')
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((c) => ({ name: catMap[c.categoryId] ?? 'Other', value: c.total }));
  const maxCatVal = topCategories[0]?.value ?? 1;

  const prevIncome = sum1.data?.totalIncome ?? 0;
  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
  const prevExpenses = sum1.data?.totalExpenses ?? 0;
  const expensesChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;

  const isLoading = summary.isLoading || recent.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-56 shimmer rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonCard h={320} />
          <SkeletonCard className="lg:col-span-2" h={320} />
        </div>
        <Card>
          <CardHeader><div className="h-4 w-40 shimmer rounded" /></CardHeader>
          <CardContent className="divide-y divide-border dark:divide-slate-700">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
          Good day, <span className="text-brand">{firstName}</span>
        </h1>
        <p className="font-body text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Here&apos;s your financial overview for this month
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-brand">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-brand" />
            </div>
            <div className="flex items-center gap-0.5">
              {incomeChange >= 0
                ? <ArrowUpRight size={12} className="text-brand" />
                : <ArrowDownRight size={12} className="text-expense" />}
              <span className={`font-body text-xs font-medium ${incomeChange >= 0 ? 'text-brand' : 'text-expense'}`}>
                {Math.abs(incomeChange).toFixed(1)}%
              </span>
            </div>
          </div>
          <AnimatedNumber value={income} className="font-heading text-xl font-bold text-slate-900 dark:text-white" />
          <p className="font-body text-xs text-slate-500 dark:text-slate-400 mt-1">Total Income</p>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-expense">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <TrendingDown size={16} className="text-expense" />
            </div>
            <div className="flex items-center gap-0.5">
              {expensesChange <= 0
                ? <ArrowDownRight size={12} className="text-brand" />
                : <ArrowUpRight size={12} className="text-expense" />}
              <span className={`font-body text-xs font-medium ${expensesChange <= 0 ? 'text-brand' : 'text-expense'}`}>
                {Math.abs(expensesChange).toFixed(1)}%
              </span>
            </div>
          </div>
          <AnimatedNumber value={expenses} className="font-heading text-xl font-bold text-slate-900 dark:text-white" />
          <p className="font-body text-xs text-slate-500 dark:text-slate-400 mt-1">Total Expenses</p>
        </div>

        {/* Net Balance */}
        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 ${net >= 0 ? 'border-l-brand' : 'border-l-expense'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${net >= 0 ? 'bg-brand/10' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <Wallet size={16} className={net >= 0 ? 'text-brand' : 'text-expense'} />
            </div>
            <span className="font-body text-xs font-medium text-slate-400">{savingsPct.toFixed(0)}% saved</span>
          </div>
          <AnimatedNumber value={net} className={`font-heading text-xl font-bold ${net >= 0 ? 'text-brand' : 'text-expense'}`} />
          <p className="font-body text-xs text-slate-500 dark:text-slate-400 mt-1">Net Balance</p>
        </div>

        {/* Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <ArrowLeftRight size={16} className="text-amber-500" />
            </div>
            <span className="font-body text-xs font-medium text-slate-400">this month</span>
          </div>
          <AnimatedNumber value={txCount} format={{ style: 'decimal' }} className="font-heading text-xl font-bold text-slate-900 dark:text-white" />
          <p className="font-body text-xs text-slate-500 dark:text-slate-400 mt-1">Transactions</p>
        </div>
      </div>

      {/* Middle row: balance overview + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Balance overview card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-5">
          <div>
            <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Monthly Overview
            </p>
            <p className={`font-heading text-3xl font-bold ${net >= 0 ? 'text-brand' : 'text-expense'}`}>
              {fmt(net)}
            </p>
            <p className="font-body text-xs text-slate-400 mt-1">
              {savingsPct.toFixed(1)}% savings rate this month
            </p>
          </div>

          {/* Income / Expenses bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" />
                  <span className="font-body text-sm text-slate-600 dark:text-slate-300">Income</span>
                </div>
                <span className="font-heading text-sm font-semibold text-slate-800 dark:text-white">{fmt(income)}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-brand" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-expense inline-block" />
                  <span className="font-body text-sm text-slate-600 dark:text-slate-300">Expenses</span>
                </div>
                <span className="font-heading text-sm font-semibold text-slate-800 dark:text-white">{fmt(expenses)}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-expense"
                  style={{ width: `${income > 0 ? Math.min((expenses / income) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Savings note */}
          <div className={`rounded-xl p-3 ${net >= 0 ? 'bg-green-50 border border-green-100 dark:bg-green-950/20 dark:border-green-900/30' : 'bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30'}`}>
            <div className="flex items-center gap-2">
              <PiggyBank size={15} className={net >= 0 ? 'text-brand' : 'text-expense'} />
              <span className="font-body text-xs font-medium text-slate-700 dark:text-slate-300">
                {net >= 0 ? `Saving ${fmt(net)} this month` : `Over budget by ${fmt(Math.abs(net))}`}
              </span>
            </div>
          </div>

          {/* Top spend categories */}
          {topCategories.length > 0 && (
            <div>
              <p className="font-body text-xs text-slate-400 uppercase tracking-wider mb-3">Top Spending</p>
              <div className="space-y-2.5">
                {topCategories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="font-body text-xs text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{cat.name}</span>
                      <span className="font-heading text-xs font-semibold text-slate-800 dark:text-white">{fmt(cat.value)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand/60 transition-all duration-700"
                        style={{ width: `${(cat.value / maxCatVal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 2/3: chart + budget */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h2 className="font-heading text-sm font-semibold text-slate-800 dark:text-white">
                Cash Flow — Last 3 Months
              </h2>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={chartData} />
            </CardContent>
          </Card>

          {(budgets.data ?? []).length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="font-heading text-sm font-semibold text-slate-800 dark:text-white">Budget Status</h2>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full font-body text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-700">
                        {['Budget', 'Limit', 'Spent', 'Remaining', 'Status'].map((h) => (
                          <th key={h} className="text-left py-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(budgets.data ?? []).slice(0, 5).map((b) => (
                        <tr key={b.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-100">{b.name}</td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{fmtFull(b.amount)}</td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{fmtFull(b.spent)}</td>
                          <td className={`py-2.5 px-4 font-semibold ${b.isOverBudget ? 'text-expense' : 'text-brand'}`}>
                            {fmtFull(b.remaining)}
                          </td>
                          <td className="py-2.5 px-4">
                            {b.isOverBudget
                              ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Over Budget</span>
                              : b.isNearLimit
                                ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Near Limit</span>
                                : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">On Track</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <h2 className="font-heading text-sm font-semibold text-slate-800 dark:text-white">Recent Transactions</h2>
        </CardHeader>
        <CardContent>
          {(recent.data?.data ?? []).length === 0 ? (
            <p className="text-center py-8 text-slate-400 dark:text-slate-500 font-body text-sm">No transactions yet</p>
          ) : (
            <>
              {/* Mobile list */}
              <div className="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
                {(recent.data?.data ?? []).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-body font-medium text-slate-800 dark:text-slate-100 text-sm truncate">{tx.description}</p>
                      <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(tx.transactionDate).toLocaleDateString()} · {catMap[tx.categoryId] ?? '—'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-heading font-semibold text-sm ${tx.type === 'income' ? 'text-brand' : 'text-expense'}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmtFull(tx.amount)}
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
                    <tr className="border-b border-gray-100 dark:border-slate-700">
                      {['Date', 'Description', 'Category', 'Amount', 'Type'].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(recent.data?.data ?? []).map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3 text-slate-800 dark:text-slate-100 font-medium">{tx.description}</td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{catMap[tx.categoryId] ?? '—'}</td>
                        <td className={`py-2.5 px-3 font-heading font-semibold ${tx.type === 'income' ? 'text-brand' : 'text-expense'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmtFull(tx.amount)}
                        </td>
                        <td className="py-2.5 px-3"><Badge variant={tx.type}>{tx.type}</Badge></td>
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
