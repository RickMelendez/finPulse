import { useState } from 'react';
import {
  BarChart2,
  MessageCircle,
  AlertCircle,
  Loader2,
  Activity,
  ChevronRight,
  Calculator,
  TrendingDown,
  CheckCircle2,
  MinusCircle,
  Send,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SuccessIcon, DownloadDoneIcon, SendAnimatedIcon } from '../components/ui/AnimatedStateIcons';
import { useInsights, useInsightTrends, useAskQuestion, useGenerateBudgetPlan } from '../hooks/useApi';
import type { BudgetPlan } from '../types';

const inputCls =
  'border border-border dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-body ' +
  'text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/50 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ' +
  'transition-colors duration-150';

function getPeriod() {
  return new Date().toISOString().slice(0, 7);
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export function Insights() {
  const [period, setPeriod] = useState(getPeriod());
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan | null>(null);

  const insights = useInsights(period);
  const trends = useInsightTrends();
  const askQ = useAskQuestion();
  const generatePlan = useGenerateBudgetPlan();

  async function handleGeneratePlan() {
    try {
      const plan = await generatePlan.mutateAsync();
      setBudgetPlan(plan);
    } catch {
      // error surfaced via generatePlan.isError
    }
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    try {
      const res = await askQ.mutateAsync(question.trim());
      setAnswer(res);
      setQuestion('');
    } catch {
      // error state surfaced via askQ.isError
    }
  }

  const insightData = insights.data?.insights;
  const topCategories = insightData
    ? Object.entries(insightData.topCategories).sort((a, b) => b[1] - a[1])
    : [];
  const maxCat = topCategories[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-slate-800 flex-1">
          AI Insights
        </h1>
        <div className="flex items-center gap-2">
          <label className="font-body text-sm text-slate-500">Period:</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Monthly Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center">
              <BarChart2 size={14} className="text-brand" />
            </div>
            <h2 className="font-heading text-sm font-semibold text-slate-800">
              Monthly Summary &mdash; {period}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {insights.isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <SuccessIcon size={44} color="#16a34a" duration={1400} />
              <p className="font-body text-sm text-slate-400">Generating AI insights...</p>
            </div>
          )}
          {insights.error && (
            <div className="flex items-center gap-2 text-red-500 justify-center py-8 font-body text-sm">
              <AlertCircle size={16} /> Could not load insights for this period.
            </div>
          )}
          {insightData && (
            <div className="space-y-6">
              {/* Summary */}
              <p className="font-body text-slate-700 dark:text-slate-300 leading-relaxed bg-brand/5 dark:bg-brand/10 border-l-4 border-brand p-4 rounded-r-xl">
                {insightData.summary}
              </p>

              {/* Recommendations */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-white mb-3">
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {insightData.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRight size={16} className="text-brand-light mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-body font-semibold text-sm text-slate-800 dark:text-white">
                            {rec.title}
                          </p>
                          <Badge variant={rec.priority}>{rec.priority}</Badge>
                        </div>
                        <p className="font-body text-sm text-slate-500 dark:text-slate-400">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Categories */}
              {topCategories.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-white mb-3">
                    Top Spending Categories
                  </h3>
                  <div className="space-y-2">
                    {topCategories.slice(0, 6).map(([name, value]) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="font-body text-sm text-slate-600 dark:text-slate-400 w-28 truncate">
                          {name}
                        </span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-brand-light h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(value / maxCat) * 100}%` }}
                          />
                        </div>
                        <span className="font-heading text-sm font-semibold text-slate-800 dark:text-white w-20 text-right">
                          {fmt(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anomalies */}
              {insightData.anomalies && insightData.anomalies.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-white mb-3">
                    Anomalies Detected
                  </h3>
                  <div className="space-y-2">
                    {insightData.anomalies.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                        <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-body text-sm text-slate-700 dark:text-slate-300">{a.description}</p>
                          <p className="font-heading text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            {fmt(a.amount)} &middot; <Badge variant={a.severity}>{a.severity}</Badge>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="font-body text-xs text-slate-400 dark:text-slate-500">
                Generated by {insightData.modelUsed}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
              <Activity size={14} className="text-brand" />
            </div>
            <h2 className="font-heading text-sm font-semibold text-slate-800">
              3-Month Trends
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {trends.isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 size={20} className="animate-spin text-brand" />
              <p className="font-body text-sm text-slate-400">Analyzing trends...</p>
            </div>
          )}
          {trends.data && (
            <p className="font-body text-slate-700 leading-relaxed bg-brand/5 border-l-4 border-brand p-4 rounded-r-xl">
              {trends.data.summary}
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI Budget Planner */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
                <Calculator size={14} className="text-amber-600" />
              </div>
              <h2 className="font-heading text-sm font-semibold text-slate-800">
                AI Budget Planner
              </h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              loading={generatePlan.isPending}
              onClick={handleGeneratePlan}
            >
              {budgetPlan ? 'Regenerate Plan' : 'Generate My Budget Plan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!budgetPlan && !generatePlan.isPending && !generatePlan.isError && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <DownloadDoneIcon size={36} color="#d97706" duration={2400} />
              </div>
              <p className="font-body text-sm text-slate-500 text-center max-w-sm">
                Click <strong className="text-slate-700">Generate My Budget Plan</strong> to get a personalized monthly budget
                based on your real income and spending data — powered by Claude AI.
              </p>
            </div>
          )}

          {generatePlan.isPending && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <SuccessIcon size={44} color="#d97706" duration={1200} />
              <p className="font-body text-sm text-slate-400">Analyzing your finances and building your plan...</p>
            </div>
          )}

          {generatePlan.isError && (
            <div className="flex items-center gap-2 text-red-500 justify-center py-8 font-body text-sm">
              <AlertCircle size={16} /> Could not generate budget plan. Please try again.
            </div>
          )}

          {budgetPlan && !generatePlan.isPending && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-income/5 dark:bg-income/10 rounded-xl p-4">
                  <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Monthly Income</p>
                  <p className="font-heading text-xl font-bold text-income">{fmt(budgetPlan.totalIncome)}</p>
                </div>
                <div className="bg-expense/5 dark:bg-expense/10 rounded-xl p-4">
                  <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current Expenses</p>
                  <p className="font-heading text-xl font-bold text-expense">{fmt(budgetPlan.totalExpenses)}</p>
                </div>
                <div className="bg-brand/5 dark:bg-brand/10 rounded-xl p-4">
                  <p className="font-body text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Savings Target</p>
                  <p className="font-heading text-xl font-bold text-brand dark:text-brand-light">
                    {fmt(budgetPlan.savingsTarget)} <span className="text-sm font-normal text-slate-400">({budgetPlan.savingsRate.toFixed(0)}%)</span>
                  </p>
                </div>
              </div>

              <p className="font-body text-slate-700 dark:text-slate-300 leading-relaxed bg-brand/5 dark:bg-brand/10 border-l-4 border-brand p-4 rounded-r-xl text-sm">
                {budgetPlan.summary}
              </p>

              {/* Budget table */}
              <div className="overflow-x-auto">
                <table className="w-full font-body text-sm">
                  <thead>
                    <tr className="border-b border-border dark:border-slate-700">
                      {['Category', 'Current Spend', 'Recommended', '% of Income', 'Status', 'Reasoning'].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {budgetPlan.items.map((item) => (
                      <tr key={item.category} className="border-b border-border dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{item.category}</td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{fmt(item.currentMonthSpend)}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">{fmt(item.recommendedMonthly)}</td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{item.percentOfIncome.toFixed(0)}%</td>
                        <td className="py-3 px-3">
                          {item.status === 'on_track' && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                              <CheckCircle2 size={12} /> On Track
                            </span>
                          )}
                          {item.status === 'reduce' && (
                            <span className="flex items-center gap-1 text-expense text-xs font-semibold">
                              <TrendingDown size={12} /> Reduce
                            </span>
                          )}
                          {item.status === 'increase_ok' && (
                            <span className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                              <MinusCircle size={12} /> Under Budget
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-xs max-w-[240px]">{item.reasoning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="font-body text-xs text-slate-400 dark:text-slate-500">
                Budget plan generated by Claude AI based on your current month's real transactions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ask a Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
              <MessageCircle size={14} className="text-blue-600" />
            </div>
            <h2 className="font-heading text-sm font-semibold text-slate-800">
              Ask Your Financial Advisor
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAsk} className="flex gap-3 mb-4">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How much did I spend on food this month?"
              className={`flex-1 ${inputCls}`}
            />
            <Button type="submit" variant="primary" size="sm" loading={askQ.isPending} disabled={!question.trim()}>
              <Send size={14} className="mr-1" /> Ask
            </Button>
          </form>

          {askQ.isPending && (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <SendAnimatedIcon size={40} color="#16a34a" duration={1600} />
              <p className="font-body text-sm text-slate-400">Thinking...</p>
            </div>
          )}

          {askQ.isError && (
            <div className="flex items-center gap-2 text-red-500 font-body text-sm">
              <AlertCircle size={16} /> Could not get an answer. Please try again.
            </div>
          )}

          {answer && !askQ.isPending && (
            <div className="bg-brand/5 border-l-4 border-brand p-4 rounded-r-xl font-body text-sm text-slate-700 leading-relaxed">
              {answer}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
