import db from '../../infrastructure/config/database';
import { RecurringTransaction } from '../../domain/entities/RecurringTransaction';
import { NotFoundError } from '../../shared/errors/NotFoundError';

interface DbRecurring {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  next_run: string;
  is_active: boolean;
}

function toEntity(row: DbRecurring): RecurringTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    categoryId: row.category_id,
    type: row.type,
    amount: parseFloat(row.amount),
    description: row.description,
    frequency: row.frequency,
    nextRun: new Date(row.next_run),
    isActive: row.is_active,
  };
}

function calculateNextRun(currentDate: string, frequency: DbRecurring['frequency']): string {
  const date = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().split('T')[0];
}

export interface CreateRecurringData {
  userId: string;
  accountId: string;
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  nextRun: string;
}

export class PgRecurringRepo {
  async list(userId: string): Promise<RecurringTransaction[]> {
    const rows = await db('recurring_transactions')
      .where({ user_id: userId })
      .orderBy('next_run', 'asc');
    return rows.map(toEntity);
  }

  async findById(id: string, userId: string): Promise<RecurringTransaction> {
    const row = await db('recurring_transactions').where({ id, user_id: userId }).first();
    if (!row) throw new NotFoundError('RecurringTransaction');
    return toEntity(row);
  }

  async create(data: CreateRecurringData): Promise<RecurringTransaction> {
    const [row] = await db('recurring_transactions')
      .insert({
        user_id: data.userId,
        account_id: data.accountId,
        category_id: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        frequency: data.frequency,
        next_run: data.nextRun,
        is_active: true,
      })
      .returning('*');
    return toEntity(row);
  }

  async update(id: string, userId: string, data: Partial<CreateRecurringData> & { isActive?: boolean }): Promise<RecurringTransaction> {
    const existing = await db('recurring_transactions').where({ id, user_id: userId }).first();
    if (!existing) throw new NotFoundError('RecurringTransaction');

    const updateData: Record<string, unknown> = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.nextRun !== undefined) updateData.next_run = data.nextRun;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const [row] = await db('recurring_transactions')
      .where({ id, user_id: userId })
      .update(updateData)
      .returning('*');
    return toEntity(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const count = await db('recurring_transactions').where({ id, user_id: userId }).delete();
    if (count === 0) throw new NotFoundError('RecurringTransaction');
  }

  /**
   * Reconcile: find all active recurring rules due on or before today,
   * create the corresponding transactions, and advance next_run.
   * Returns the number of transactions created.
   */
  async reconcile(today: string): Promise<{ created: number; errors: string[] }> {
    const dueSeries = await db('recurring_transactions')
      .where({ is_active: true })
      .andWhere('next_run', '<=', today);

    let created = 0;
    const errors: string[] = [];

    for (const rule of dueSeries as DbRecurring[]) {
      try {
        await db.transaction(async (trx) => {
          // Insert the transaction
          await trx('transactions').insert({
            user_id: rule.user_id,
            account_id: rule.account_id,
            category_id: rule.category_id,
            type: rule.type,
            amount: rule.amount,
            description: rule.description,
            transaction_date: rule.next_run,
            is_recurring: true,
            recurring_id: rule.id,
          });

          // Advance next_run
          const newNextRun = calculateNextRun(rule.next_run, rule.frequency);
          await trx('recurring_transactions')
            .where({ id: rule.id })
            .update({ next_run: newNextRun });
        });
        created++;
      } catch (err) {
        errors.push(`Rule ${rule.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { created, errors };
  }
}
