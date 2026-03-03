import { useState } from 'react';
import {
  Sparkles,
  Send,
  AlertCircle,
  Loader2,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useInsights, useInsightTrends, useAskQuestion } from '../hooks/useApi';

function getPeriod() {
  return new Date().toISOString().slice(0, 7);
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

export function Insights() {
  const [period, setPeriod] = useState(getPeriod());
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const insights = useInsights(period);
  const trends = useInsightTrends();
  const askQ = useAskQuestion();

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    const res = await askQ.mutateAsync(question.trim());
    setAnswer(res);
    setQuestion('');
  }

  const insightData = insights.data?.insights;
  const topCategories = insightData
    ? Object.entries(insightData.topCategories).sort((a, b) => b[1] - a[1])
    : [];
  const maxCat = topCategories[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary-dark flex-1">
          AI Insights
        </h1>
        <div className="flex items-center gap-2">
          <label className="font-body text-sm text-gray-500">Period:</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Monthly Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h2 className="font-heading text-sm font-semibold text-primary-dark">
              Monthly Summary &mdash; {period}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {insights.isLoading && (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400 font-body text-sm">
              <Loader2 size={20} className="animate-spin" /> Generating AI insights...
            </div>
          )}
          {insights.error && (
            <div className="flex items-center gap-2 text-red-500 justify-center py-8 font-body text-sm">
              <AlertCircle size={20} /> Could not load insights for this period.
            </div>
          )}
          {insightData && (
            <div className="space-y-6">
              {/* Summary */}
              <p className="font-body text-gray-700 leading-relaxed bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl">
                {insightData.summary}
              </p>

              {/* Recommendations */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-primary-dark mb-3">
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {insightData.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight
                        size={16}
                        className="text-primary-light mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-body font-semibold text-sm text-primary-dark">
                            {rec.title}
                          </p>
                          <Badge variant={rec.priority}>{rec.priority}</Badge>
                        </div>
                        <p className="font-body text-sm text-gray-500">
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
                  <h3 className="font-heading text-sm font-semibold text-primary-dark mb-3">
                    Top Spending Categories
                  </h3>
                  <div className="space-y-2">
                    {topCategories.slice(0, 6).map(([name, value]) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="font-body text-sm text-gray-600 w-28 truncate">
                          {name}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-primary-light h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(value / maxCat) * 100}%` }}
                          />
                        </div>
                        <span className="font-heading text-sm font-semibold text-primary-dark w-20 text-right">
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
                  <h3 className="font-heading text-sm font-semibold text-primary-dark mb-3">
                    Anomalies Detected
                  </h3>
                  <div className="space-y-2">
                    {insightData.anomalies.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100"
                      >
                        <AlertCircle
                          size={16}
                          className="text-amber-500 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="font-body text-sm text-gray-700">
                            {a.description}
                          </p>
                          <p className="font-heading text-xs text-amber-600 mt-0.5">
                            {fmt(a.amount)} &middot;{' '}
                            <Badge variant={a.severity}>{a.severity}</Badge>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="font-body text-xs text-gray-400">
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
            <TrendingUp size={16} className="text-primary-light" />
            <h2 className="font-heading text-sm font-semibold text-primary-dark">
              3-Month Trends
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {trends.isLoading && (
            <div className="flex items-center justify-center py-8 gap-3 text-gray-400 font-body text-sm">
              <Loader2 size={18} className="animate-spin" /> Analyzing trends...
            </div>
          )}
          {trends.data && (
            <p className="font-body text-gray-700 leading-relaxed bg-primary/5 border-l-4 border-primary-light p-4 rounded-r-xl">
              {trends.data.summary}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ask a Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send size={16} className="text-accent" />
            <h2 className="font-heading text-sm font-semibold text-primary-dark">
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
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={askQ.isPending}
              disabled={!question.trim()}
            >
              <Send size={14} className="mr-1" /> Ask
            </Button>
          </form>

          {askQ.isPending && (
            <div className="flex items-center gap-2 text-gray-400 font-body text-sm">
              <Loader2 size={16} className="animate-spin" /> Thinking...
            </div>
          )}

          {answer && !askQ.isPending && (
            <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl font-body text-sm text-gray-700 leading-relaxed">
              {answer}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
