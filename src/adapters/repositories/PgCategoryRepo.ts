import db from '../../infrastructure/config/database';
import { Category } from '../../domain/entities/Category';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { AppError } from '../../shared/errors/AppError';

interface DbCategory {
  id: string;
  user_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  type: 'income' | 'expense';
  is_system: boolean;
  created_at: Date;
}

function toEntity(row: DbCategory): Category {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    name: row.name,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    type: row.type,
    isSystem: row.is_system,
    createdAt: row.created_at,
  };
}

export interface CreateCategoryData {
  userId: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export class PgCategoryRepo {
  // List all: system categories (user_id IS NULL) + user's own categories
  async list(userId: string): Promise<Category[]> {
    const rows = await db('categories')
      .where(function () {
        this.whereNull('user_id').orWhere('user_id', userId);
      })
      .orderBy([
        { column: 'is_system', order: 'desc' },
        { column: 'name', order: 'asc' },
      ]);
    return rows.map(toEntity);
  }

  async findById(id: string, userId: string): Promise<Category> {
    const row = await db('categories')
      .where(function () {
        this.where('id', id).andWhere(function () {
          this.whereNull('user_id').orWhere('user_id', userId);
        });
      })
      .first();
    if (!row) throw new NotFoundError('Category');
    return toEntity(row);
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const [row] = await db('categories')
      .insert({
        user_id: data.userId,
        name: data.name,
        type: data.type,
        icon: data.icon ?? null,
        color: data.color ?? null,
        is_system: false,
      })
      .returning('*');
    return toEntity(row);
  }

  async update(id: string, userId: string, data: Partial<CreateCategoryData>): Promise<Category> {
    // Can only update user-owned categories (not system)
    const existing = await db('categories')
      .where({ id, user_id: userId, is_system: false })
      .first();
    if (!existing) throw new NotFoundError('Category');

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;

    const [row] = await db('categories')
      .where({ id, user_id: userId })
      .update(updateData)
      .returning('*');
    return toEntity(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    // Can only delete user-owned (non-system) categories
    const existing = await db('categories')
      .where({ id, user_id: userId, is_system: false })
      .first();
    if (!existing) throw new NotFoundError('Category');

    // Check if category is in use by transactions
    const usageCount = await db('transactions')
      .where({ category_id: id, user_id: userId })
      .count('id as count')
      .first();

    if (Number(usageCount?.count ?? 0) > 0) {
      throw new AppError(
        'Cannot delete category that has transactions. Reassign transactions first.',
        409
      );
    }

    await db('categories').where({ id, user_id: userId }).delete();
  }
}
