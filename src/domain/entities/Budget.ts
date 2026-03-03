export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}
