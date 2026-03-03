import db from '../../infrastructure/config/database';
import { SpendingInsight } from '../../domain/entities/SpendingInsight';

interface DbInsight {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  summary: string;
  recommendations: SpendingInsight['recommendations'];
  top_categories: SpendingInsight['topCategories'];
  anomalies: SpendingInsight['anomalies'];
  model_used: string;
  generated_at: Date;
  expires_at: Date;
}

function toEntity(row: DbInsight): SpendingInsight {
  return {
    id: row.id,
    userId: row.user_id,
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
    summary: row.summary,
    recommendations: row.recommendations,
    topCategories: row.top_categories,
    anomalies: row.anomalies,
    modelUsed: row.model_used,
    generatedAt: row.generated_at,
    expiresAt: row.expires_at,
  };
}

export interface SaveInsightData {
  userId: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  recommendations: SpendingInsight['recommendations'];
  topCategories: SpendingInsight['topCategories'];
  anomalies: SpendingInsight['anomalies'];
  modelUsed: string;
  expiresAt: Date;
}

export class PgInsightsRepo {
  // Check cache: find a non-expired insight for the given user and period
  async findCached(userId: string, periodStart: string, periodEnd: string): Promise<SpendingInsight | null> {
    const row = await db('spending_insights')
      .where({ user_id: userId, period_start: periodStart, period_end: periodEnd })
      .andWhere('expires_at', '>', new Date())
      .orderBy('generated_at', 'desc')
      .first();

    return row ? toEntity(row) : null;
  }

  async save(data: SaveInsightData): Promise<SpendingInsight> {
    const [row] = await db('spending_insights')
      .insert({
        user_id: data.userId,
        period_start: data.periodStart,
        period_end: data.periodEnd,
        summary: data.summary,
        recommendations: JSON.stringify(data.recommendations),
        top_categories: JSON.stringify(data.topCategories),
        anomalies: data.anomalies ? JSON.stringify(data.anomalies) : null,
        model_used: data.modelUsed,
        expires_at: data.expiresAt,
      })
      .returning('*');
    return toEntity(row);
  }

  async listByUser(userId: string): Promise<SpendingInsight[]> {
    const rows = await db('spending_insights')
      .where({ user_id: userId })
      .orderBy('generated_at', 'desc')
      .limit(10);
    return rows.map(toEntity);
  }
}
