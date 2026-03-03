export interface SpendingRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SpendingAnomaly {
  description: string;
  amount: number;
  severity: 'high' | 'medium' | 'low';
}

export interface SpendingInsight {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  summary: string;
  recommendations: SpendingRecommendation[];
  topCategories: Record<string, number>;
  anomalies: SpendingAnomaly[] | null;
  modelUsed: string;
  generatedAt: Date;
  expiresAt: Date;
}
