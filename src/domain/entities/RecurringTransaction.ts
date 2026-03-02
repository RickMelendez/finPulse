import { TransactionType } from './Transaction';

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  nextRun: Date;
  isActive: boolean;
}
