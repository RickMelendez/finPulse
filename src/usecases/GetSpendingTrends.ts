import db from '../infrastructure/config/database';
import { PgTransactionRepo } from '../adapters/repositories/PgTransactionRepo';
import { ClaudeInsightsService, TrendData } from '../adapters/services/ClaudeInsightsService';
import { InsightResult } from '../adapters/services/ClaudeInsightsService';

const txnRepo = new PgTransactionRepo();
const claude = new ClaudeInsightsService();

function getMonthRange(monthsAgo: number): { start: string; end: string; label: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const end = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
  return { start, end, label };
}

export async function getSpendingTrends(userId: string): Promise<InsightResult> {
  // Build 3-month trend data
  const periods: TrendData[] = [];

  for (let i = 2; i >= 0; i--) {
    const { start, end, label } = getMonthRange(i);
    const summary = await txnRepo.getSummary(userId, start, end);

    // Find top expense category
    const topCat = summary.byCategory
      .filter((c) => c.type === 'expense')
      .sort((a, b) => b.total - a.total)[0];

    let topCategoryName = 'None';
    if (topCat) {
      const cat = await db('categories').where({ id: topCat.categoryId }).select('name').first();
      topCategoryName = cat?.name ?? topCat.categoryId;
    }

    periods.push({
      period: label,
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      netBalance: summary.netBalance,
      topCategory: topCategoryName,
    });
  }

  // Fetch all category names for context
  const categoryNames: Record<string, string> = {};

  return claude.analyzeTrends(periods, categoryNames);
}
