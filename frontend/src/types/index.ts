export type TransactionType = 'income' | 'expense';
export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly';
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  transactionDate: string;
  isRecurring: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isSystem: boolean;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  name: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  byCategory: Array<{
    categoryId: string;
    type: string;
    total: number;
    count: number;
  }>;
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

export interface SpendingInsight {
  id: string;
  userId: string;
  period: string;
  insights: InsightResult;
  generatedAt: string;
  expiresAt: string;
}

export interface BudgetPlanItem {
  category: string;
  currentMonthSpend: number;
  recommendedMonthly: number;
  percentOfIncome: number;
  reasoning: string;
  status: 'on_track' | 'reduce' | 'increase_ok';
}

export interface BudgetPlan {
  savingsTarget: number;
  savingsRate: number;
  summary: string;
  items: BudgetPlanItem[];
  totalIncome: number;
  totalExpenses: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}
