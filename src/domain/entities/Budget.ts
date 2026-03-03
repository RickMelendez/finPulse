export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  name: string;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
}
