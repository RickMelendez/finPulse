export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  transactionDate: Date;
  isRecurring: boolean;
  recurringId?: string;
  createdAt: Date;
  updatedAt: Date;
}
