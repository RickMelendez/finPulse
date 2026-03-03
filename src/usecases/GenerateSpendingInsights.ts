import db from '../infrastructure/config/database';
import { PgInsightsRepo } from '../adapters/repositories/PgInsightsRepo';
import { PgTransactionRepo } from '../adapters/repositories/PgTransactionRepo';
import { ClaudeInsightsService } from '../adapters/services/ClaudeInsightsService';
import { SpendingInsight } from '../domain/entities/SpendingInsight';

const insightsRepo = new PgInsightsRepo();
const txnRepo = new PgTransactionRepo();
const claude = new ClaudeInsightsService();

// Cache TTL: 24 hours
const CACHE_TTL_HOURS = 24;

export async function generateSpendingInsights(
  userId: string,
  periodStart: string,
  periodEnd: string
): Promise<SpendingInsight> {
  // 1. Check cache first
  const cached = await insightsRepo.findCached(userId, periodStart, periodEnd);
  if (cached) return cached;

  // 2. Fetch transaction summary for the period
  const summary = await txnRepo.getSummary(userId, periodStart, periodEnd);

  // 3. Fetch category names for readable output
  const categoryRows = await db('categories')
    .whereIn('id', summary.byCategory.map((c) => c.categoryId))
    .select('id', 'name');
  const categoryNames: Record<string, string> = {};
  categoryRows.forEach((r: { id: string; name: string }) => {
    categoryNames[r.id] = r.name;
  });

  // 4. Call Claude
  const result = await claude.generateMonthlySummary(periodStart, periodEnd, summary, categoryNames);

  // 5. Cache the result (expires in 24h)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

  return insightsRepo.save({
    userId,
    periodStart,
    periodEnd,
    summary: result.summary,
    recommendations: result.recommendations,
    topCategories: result.topCategories,
    anomalies: result.anomalies,
    modelUsed: result.modelUsed,
    expiresAt,
  });
}
