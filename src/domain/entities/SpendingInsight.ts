export interface SpendingRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SpendingInsight {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  summary: string;
  recommendations: SpendingRecommendation[];
  topCategories: Record<string, number>;
  anomalies: Record<string, unknown> | null;
  modelUsed: string;
  generatedAt: Date;
  expiresAt: Date;
}
