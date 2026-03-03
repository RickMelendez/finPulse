import db from '../../infrastructure/config/database';
import { Account } from '../../domain/entities/Account';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { AppError } from '../../shared/errors/AppError';

interface DbAccount {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';
  balance: string;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

function toEntity(row: DbAccount): Account {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    balance: parseFloat(row.balance),
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateAccountData {
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';
  balance?: number;
  currency?: string;
}

export class PgAccountRepo {
  async list(userId: string): Promise<Account[]> {
    const rows = await db('accounts')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
    return rows.map(toEntity);
  }

  async findById(id: string, userId: string): Promise<Account> {
    const row = await db('accounts').where({ id, user_id: userId }).first();
    if (!row) throw new NotFoundError('Account');
    return toEntity(row);
  }

  async create(data: CreateAccountData): Promise<Account> {
    const [row] = await db('accounts')
      .insert({
        user_id: data.userId,
        name: data.name,
        type: data.type,
        balance: data.balance ?? 0,
        currency: data.currency ?? 'USD',
      })
      .returning('*');
    return toEntity(row);
  }

  async update(id: string, userId: string, data: Partial<Pick<CreateAccountData, 'name' | 'type'>>): Promise<Account> {
    const existing = await db('accounts').where({ id, user_id: userId }).first();
    if (!existing) throw new NotFoundError('Account');

    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;

    const [row] = await db('accounts')
      .where({ id, user_id: userId })
      .update(updateData)
      .returning('*');
    return toEntity(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await db('accounts').where({ id, user_id: userId }).first();
    if (!existing) throw new NotFoundError('Account');

    // Guard: cannot delete account that has transactions
    const txnCount = await db('transactions')
      .where({ account_id: id, user_id: userId })
      .count('id as count')
      .first();

    if (Number(txnCount?.count ?? 0) > 0) {
      throw new AppError(
        'Cannot delete account that has transactions. Move or delete transactions first.',
        409
      );
    }

    await db('accounts').where({ id, user_id: userId }).delete();
  }
}
