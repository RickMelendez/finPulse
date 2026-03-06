import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

function FinancialGauge({ pct, value }: { pct: number; value: number }) {
  const segments = 20;
  const cx = 100, cy = 104;
  const r1 = 60, r2 = 82;
  const activeCount = Math.round((Math.max(0, Math.min(100, pct)) / 100) * segments);

  function segColor(i: number) {
    if (i >= activeCount) return '#1e293b';
    return i / (segments - 1) < 0.5 ? '#F59E0B' : '#10B981';
  }

  const statusLabel = pct >= 20 ? 'Still Safe' : pct >= 5 ? 'Watch Out' : 'In The Red';
  const statusCls = pct >= 20
    ? 'text-emerald-400 bg-emerald-500/20'
    : pct >= 5
      ? 'text-amber-400 bg-amber-500/20'
      : 'text-red-400 bg-red-500/20';

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="110" viewBox="0 0 200 110" className="w-full max-w-[200px]">
        {Array.from({ length: segments }, (_, i) => {
          const angle = (180 - (i / (segments - 1)) * 180) * (Math.PI / 180);
          const x1 = cx + r1 * Math.cos(angle);
          const y1 = cy - r1 * Math.sin(angle);
          const x2 = cx + r2 * Math.cos(angle);
          const y2 = cy - r2 * Math.sin(angle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={segColor(i)} strokeWidth="6" strokeLinecap="round" />
          );
        })}
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center pb-1">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls} mb-1`}>
          {statusLabel}
        </span>
        <span className="font-heading text-2xl font-bold text-white">{fmt(value)}</span>
      </div>
    </div>
  );
}

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

  const pieData = (summary.data?.byCategory ?? [])
    .filter((c) => c.type === 'expense')
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((c) => ({ name: catMap[c.categoryId] ?? 'Other', value: c.total }));
  const maxCatVal = pieData[0]?.value ?? 1;

  const prevIncome = sum1.data?.totalIncome ?? 0;
  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
  const prevExpenses = sum1.data?.totalExpenses ?? 0;
  const expensesChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;

  const isLoading = summary.isLoading || recent.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonCard h={380} />
          <SkeletonCard className="lg:col-span-2" h={380} />
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
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-border dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Income</p>
            <TrendingUp size={16} className="text-income" />
          </div>
          <AnimatedNumber value={income} className="font-heading text-xl font-bold text-income" />
          <div className="flex items-center gap-1 mt-1">
            {incomeChange >= 0
              ? <ArrowUpRight size={12} className="text-income" />
              : <ArrowDownRight size={12} className="text-expense" />}
            <span className={`font-body text-xs ${incomeChange >= 0 ? 'text-income' : 'text-expense'}`}>
              {Math.abs(incomeChange).toFixed(1)}% vs last month
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-border dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expenses</p>
            <TrendingDown size={16} className="text-expense" />
          </div>
          <AnimatedNumber value={expenses} className="font-heading text-xl font-bold text-expense" />
          <div className="flex items-center gap-1 mt-1">
            {expensesChange <= 0
              ? <ArrowDownRight size={12} className="text-income" />
              : <ArrowUpRight size={12} className="text-expense" />}
            <span className={`font-body text-xs ${expensesChange <= 0 ? 'text-income' : 'text-expense'}`}>
              {Math.abs(expensesChange).toFixed(1)}% vs last month
            </span>
          </div>
        </div>

        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border-2 ${net >= 0 ? 'border-income/30' : 'border-expense/30'} dark:border-slate-700`}>
          <div className="flex items-center justify-between mb-1">
            <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Balance</p>
            <Wallet size={16} className="text-brand dark:text-brand-light" />
          </div>
          <AnimatedNumber value={net} className={`font-heading text-xl font-bold ${net >= 0 ? 'text-income' : 'text-expense'}`} />
          <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-1">{savingsPct.toFixed(0)}% savings rate</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-border dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transactions</p>
            <ArrowLeftRight size={16} className="text-accent" />
          </div>
          <AnimatedNumber value={txCount} format={{ style: 'decimal' }} className="font-heading text-xl font-bold text-accent" />
          <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-1">this month</p>
        </div>
      </div>

      {/* Main 3-col section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dark hero card */}
        <div className="bg-slate-900 rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">Hello, {firstName}</h2>
            <p className="font-body text-sm text-slate-400 mt-0.5">Track your budget and financial goals</p>
          </div>

          <FinancialGauge pct={savingsPct} value={net} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span className="font-body text-sm text-slate-300">Income</span>
              </div>
              <span className="font-heading text-sm font-semibold text-white">{fmt(income)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                <span className="font-body text-sm text-slate-300">Expenses</span>
              </div>
              <span className="font-heading text-sm font-semibold text-white">{fmt(expenses)}</span>
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <p className="font-body text-xs text-slate-400 uppercase tracking-wider mb-3">Category Spending</p>
              <div className="space-y-3">
                {pieData.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="font-body text-xs text-slate-300 truncate max-w-[120px]">{cat.name}</span>
                      <span className="font-heading text-xs font-semibold text-white">{fmt(cat.value)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                        style={{ width: `${(cat.value / maxCatVal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pieData.length === 0 && (
            <div className="border-t border-slate-700 pt-4 text-center py-6">
              <p className="font-body text-sm text-slate-500">No expense data this month</p>
            </div>
          )}
        </div>

        {/* Right 2/3: chart + budget table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h2 className="font-heading text-sm font-semibold text-slate-800 dark:text-white">
                Income vs Expenses — 3 Months
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
                      <tr className="border-b border-border dark:border-slate-700">
                        {['Budget', 'Limit', 'Spent', 'Remaining', 'Status'].map((h) => (
                          <th key={h} className="text-left py-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(budgets.data ?? []).slice(0, 5).map((b) => (
                        <tr key={b.id} className="border-b border-border dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-100">{b.name}</td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{fmtFull(b.amount)}</td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{fmtFull(b.spent)}</td>
                          <td className={`py-2.5 px-4 font-semibold ${b.isOverBudget ? 'text-expense' : 'text-income'}`}>
                            {fmtFull(b.remaining)}
                          </td>
                          <td className="py-2.5 px-4">
                            {b.isOverBudget
                              ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Over Budget</span>
                              : b.isNearLimit
                                ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Near Limit</span>
                                : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">On Track</span>
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
              <div className="sm:hidden divide-y divide-border dark:divide-slate-700">
                {(recent.data?.data ?? []).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-body font-medium text-slate-800 dark:text-slate-100 text-sm truncate">{tx.description}</p>
                      <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(tx.transactionDate).toLocaleDateString()} · {catMap[tx.categoryId] ?? '—'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-heading font-semibold text-sm ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmtFull(tx.amount)}
                      </p>
                      <Badge variant={tx.type}>{tx.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full font-body text-sm">
                  <thead>
                    <tr className="border-b border-border dark:border-slate-700">
                      {['Date', 'Description', 'Category', 'Amount', 'Type'].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(recent.data?.data ?? []).map((tx) => (
                      <tr key={tx.id} className="border-b border-border dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                        <td className="py-2 px-3 text-slate-800 dark:text-slate-100 font-medium">{tx.description}</td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{catMap[tx.categoryId] ?? '—'}</td>
                        <td className={`py-2 px-3 font-heading font-semibold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmtFull(tx.amount)}
                        </td>
                        <td className="py-2 px-3"><Badge variant={tx.type}>{tx.type}</Badge></td>
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
