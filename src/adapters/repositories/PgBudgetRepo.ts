import db from '../../infrastructure/config/database';
import { Budget } from '../../domain/entities/Budget';
import { NotFoundError } from '../../shared/errors/NotFoundError';

interface DbBudget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: string;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: Date;
}

function toEntity(row: DbBudget): Budget {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id ?? undefined,
    amount: parseFloat(row.amount),
    period: row.period,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export interface BudgetWithProgress extends Budget {
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean; // true when >= 80%
}

export interface CreateBudgetData {
  userId: string;
  categoryId?: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

export class PgBudgetRepo {
  async list(userId: string): Promise<BudgetWithProgress[]> {
    const budgets = await db('budgets')
      .where({ user_id: userId, is_active: true })
      .orderBy('created_at', 'desc');

    return Promise.all(budgets.map((b: DbBudget) => this.attachProgress(b)));
  }

  async findById(id: string, userId: string): Promise<BudgetWithProgress> {
    const row = await db('budgets').where({ id, user_id: userId }).first();
    if (!row) throw new NotFoundError('Budget');
    return this.attachProgress(row);
  }

  async create(data: CreateBudgetData): Promise<Budget> {
    const [row] = await db('budgets')
      .insert({
        user_id: data.userId,
        category_id: data.categoryId ?? null,
        amount: data.amount,
        period: data.period,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: true,
      })
      .returning('*');
    return toEntity(row);
  }

  async update(id: string, userId: string, data: Partial<CreateBudgetData> & { isActive?: boolean }): Promise<Budget> {
    const existing = await db('budgets').where({ id, user_id: userId }).first();
    if (!existing) throw new NotFoundError('Budget');

    const updateData: Record<string, unknown> = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.period !== undefined) updateData.period = data.period;
    if (data.startDate !== undefined) updateData.start_date = data.startDate;
    if (data.endDate !== undefined) updateData.end_date = data.endDate;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const [row] = await db('budgets')
      .where({ id, user_id: userId })
      .update(updateData)
      .returning('*');
    return toEntity(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const count = await db('budgets').where({ id, user_id: userId }).delete();
    if (count === 0) throw new NotFoundError('Budget');
  }

  private async attachProgress(row: DbBudget): Promise<BudgetWithProgress> {
    const budget = toEntity(row);

    // Sum transactions within the budget period and category (if set)
    const spentQuery = db('transactions')
      .where({ user_id: row.user_id, type: 'expense' })
      .andWhere('transaction_date', '>=', row.start_date)
      .andWhere('transaction_date', '<=', row.end_date);

    if (row.category_id) {
      spentQuery.andWhere('category_id', row.category_id);
    }

    const result = await spentQuery
      .sum('amount as total')
      .first();

    const spent = parseFloat(result?.total ?? '0');
    const remaining = budget.amount - spent;
    const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      ...budget,
      spent,
      remaining,
      percentUsed: Math.round(percentUsed * 100) / 100,
      isOverBudget: spent > budget.amount,
      isNearLimit: percentUsed >= 80 && percentUsed < 100,
    };
  }

  // Called by transaction creation to check for budget alerts
  async checkBudgetAlerts(userId: string, categoryId: string, transactionDate: string): Promise<BudgetWithProgress[]> {
    const activeBudgets = await db('budgets')
      .where({ user_id: userId, is_active: true })
      .andWhere('start_date', '<=', transactionDate)
      .andWhere('end_date', '>=', transactionDate)
      .andWhere(function () {
        this.whereNull('category_id').orWhere('category_id', categoryId);
      });

    const withProgress = await Promise.all(activeBudgets.map((b: DbBudget) => this.attachProgress(b)));
    return withProgress.filter((b) => b.isNearLimit || b.isOverBudget);
  }
}
