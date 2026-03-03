import Anthropic from '@anthropic-ai/sdk';

export interface TransactionSummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  byCategory: Array<{ categoryId: string; type: string; total: number; count: number }>;
}

export interface InsightResult {
  summary: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  topCategories: Record<string, number>;
  anomalies: Array<{
    description: string;
    amount: number;
    severity: 'high' | 'medium' | 'low';
  }> | null;
  modelUsed: string;
}

export interface TrendData {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  topCategory: string;
}

const MODEL = 'claude-sonnet-4-6';

export class ClaudeInsightsService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateMonthlySummary(
    periodStart: string,
    periodEnd: string,
    data: TransactionSummaryData,
    categoryNames: Record<string, string>
  ): Promise<InsightResult> {
    const categoryBreakdown = data.byCategory
      .filter((c) => c.type === 'expense')
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((c) => ({
        category: categoryNames[c.categoryId] ?? c.categoryId,
        total: c.total,
        count: c.count,
      }));

    const prompt = {
      role: 'user' as const,
      content: `You are a personal finance advisor analyzing spending data. Respond ONLY with valid JSON matching the exact schema below — no markdown, no explanation.

Period: ${periodStart} to ${periodEnd}

Financial Data:
${JSON.stringify({
  totalIncome: data.totalIncome,
  totalExpenses: data.totalExpenses,
  netBalance: data.netBalance,
  topExpenseCategories: categoryBreakdown,
}, null, 2)}

Required JSON response schema:
{
  "summary": "2-3 sentence overview of the period",
  "recommendations": [
    { "title": "short title", "description": "actionable advice", "priority": "high|medium|low" }
  ],
  "topCategories": { "CategoryName": 123.45 },
  "anomalies": [
    { "description": "what was unusual", "amount": 0, "severity": "high|medium|low" }
  ] | null
}

Provide 3-5 recommendations. Only include anomalies if genuinely unusual patterns exist.`,
    };

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [prompt],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text) as Omit<InsightResult, 'modelUsed'>;

    return { ...parsed, modelUsed: MODEL };
  }

  async analyzeTrends(
    periods: TrendData[],
    categoryNames: Record<string, string>
  ): Promise<InsightResult> {
    const prompt = {
      role: 'user' as const,
      content: `You are a personal finance advisor analyzing 3-month spending trends. Respond ONLY with valid JSON — no markdown, no explanation.

Trend Data (last 3 months):
${JSON.stringify(periods, null, 2)}

Required JSON response schema:
{
  "summary": "2-3 sentence trend analysis with month-over-month observations",
  "recommendations": [
    { "title": "short title", "description": "trend-based advice", "priority": "high|medium|low" }
  ],
  "topCategories": { "CategoryName": 123.45 },
  "anomalies": [
    { "description": "trend anomaly", "amount": 0, "severity": "high|medium|low" }
  ] | null
}

Focus on spending trends, growth patterns, and projections. Provide 3-4 recommendations.`,
    };

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [prompt],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text) as Omit<InsightResult, 'modelUsed'>;

    return { ...parsed, modelUsed: MODEL };
  }

  async askQuestion(
    question: string,
    context: {
      recentTransactions: Array<{ description: string; amount: number; type: string; category: string; date: string }>;
      totalIncome: number;
      totalExpenses: number;
      netBalance: number;
    }
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: 'You are a helpful personal finance advisor. Answer questions about the user\'s finances concisely and accurately based on the data provided. Keep answers under 150 words.',
      messages: [
        {
          role: 'user',
          content: `Financial context:
${JSON.stringify(context, null, 2)}

Question: ${question}`,
        },
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
}
