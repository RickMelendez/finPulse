import db from '../../infrastructure/config/database';
import { Transaction } from '../../domain/entities/Transaction';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { ListTransactionsQuery } from '../../shared/validators/transaction.validators';

interface DbTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: string;
  description: string;
  notes: string | null;
  transaction_date: string;
  is_recurring: boolean;
  recurring_id: string | null;
  created_at: Date;
  updated_at: Date;
}

function toEntity(row: DbTransaction): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    categoryId: row.category_id,
    type: row.type,
    amount: parseFloat(row.amount),
    description: row.description,
    notes: row.notes ?? undefined,
    transactionDate: new Date(row.transaction_date),
    isRecurring: row.is_recurring,
    recurringId: row.recurring_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTransactionData {
  userId: string;
  accountId: string;
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  notes?: string;
  transactionDate: string;
  isRecurring?: boolean;
  recurringId?: string;
}

export class PgTransactionRepo {
  async list(userId: string, query: ListTransactionsQuery): Promise<PaginatedTransactions> {
    const { page, limit, type, categoryId, accountId, startDate, endDate, sortBy, sortOrder } = query;
    const offset = (page - 1) * limit;

    const baseQuery = db('transactions').where('user_id', userId);

    if (type) baseQuery.andWhere('type', type);
    if (categoryId) baseQuery.andWhere('category_id', categoryId);
    if (accountId) baseQuery.andWhere('account_id', accountId);
    if (startDate) baseQuery.andWhere('transaction_date', '>=', startDate);
    if (endDate) baseQuery.andWhere('transaction_date', '<=', endDate);

    const [countResult, rows] = await Promise.all([
      baseQuery.clone().count('id as count').first(),
      baseQuery.clone().orderBy(sortBy, sortOrder).limit(limit).offset(offset).select('*'),
    ]);

    const total = Number(countResult?.count ?? 0);

    return {
      data: rows.map(toEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string): Promise<Transaction> {
    const row = await db('transactions').where({ id, user_id: userId }).first();
    if (!row) throw new NotFoundError('Transaction');
    return toEntity(row);
  }

  async create(data: CreateTransactionData): Promise<Transaction> {
    const [row] = await db('transactions')
      .insert({
        user_id: data.userId,
        account_id: data.accountId,
        category_id: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        notes: data.notes ?? null,
        transaction_date: data.transactionDate,
        is_recurring: data.isRecurring ?? false,
        recurring_id: data.recurringId ?? null,
      })
      .returning('*');
    return toEntity(row);
  }

  async update(id: string, userId: string, data: Partial<CreateTransactionData>): Promise<Transaction> {
    const existing = await db('transactions').where({ id, user_id: userId }).first();
    if (!existing) throw new NotFoundError('Transaction');

    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.accountId !== undefined) updateData.account_id = data.accountId;
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.transactionDate !== undefined) updateData.transaction_date = data.transactionDate;
    if (data.isRecurring !== undefined) updateData.is_recurring = data.isRecurring;
    if (data.recurringId !== undefined) updateData.recurring_id = data.recurringId;

    const [row] = await db('transactions').where({ id, user_id: userId }).update(updateData).returning('*');
    return toEntity(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const count = await db('transactions').where({ id, user_id: userId }).delete();
    if (count === 0) throw new NotFoundError('Transaction');
  }

  async getSummary(userId: string, startDate?: string, endDate?: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    byCategory: Array<{ categoryId: string; type: string; total: number; count: number }>;
  }> {
    const query = db('transactions').where('user_id', userId);
    if (startDate) query.andWhere('transaction_date', '>=', startDate);
    if (endDate) query.andWhere('transaction_date', '<=', endDate);

    const [totals, byCategory] = await Promise.all([
      query.clone().select(
        db.raw('COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) as total_income', ['income']),
        db.raw('COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) as total_expenses', ['expense']),
      ).first(),
      query.clone()
        .groupBy('category_id', 'type')
        .select('category_id', 'type', db.raw('SUM(amount) as total'), db.raw('COUNT(*) as count')),
    ]);

    const totalIncome = parseFloat(totals?.total_income ?? '0');
    const totalExpenses = parseFloat(totals?.total_expenses ?? '0');

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      byCategory: byCategory.map((r: { category_id: string; type: string; total: string; count: string }) => ({
        categoryId: r.category_id,
        type: r.type,
        total: parseFloat(r.total),
        count: parseInt(r.count, 10),
      })),
    };
  }
}
