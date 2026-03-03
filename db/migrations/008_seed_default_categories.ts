import type { Knex } from 'knex';

interface CategoryRow {
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_system: boolean;
  user_id: null;
}

const defaultCategories: CategoryRow[] = [
  { name: 'Groceries', icon: 'shopping-cart', color: '#22c55e', type: 'expense', is_system: true, user_id: null },
  { name: 'Rent', icon: 'home', color: '#3b82f6', type: 'expense', is_system: true, user_id: null },
  { name: 'Transportation', icon: 'car', color: '#f97316', type: 'expense', is_system: true, user_id: null },
  { name: 'Entertainment', icon: 'film', color: '#a855f7', type: 'expense', is_system: true, user_id: null },
  { name: 'Healthcare', icon: 'heart', color: '#ef4444', type: 'expense', is_system: true, user_id: null },
  { name: 'Utilities', icon: 'zap', color: '#eab308', type: 'expense', is_system: true, user_id: null },
  { name: 'Dining', icon: 'utensils', color: '#f59e0b', type: 'expense', is_system: true, user_id: null },
  { name: 'Shopping', icon: 'shopping-bag', color: '#ec4899', type: 'expense', is_system: true, user_id: null },
  { name: 'Education', icon: 'book', color: '#06b6d4', type: 'expense', is_system: true, user_id: null },
  { name: 'Personal Care', icon: 'user', color: '#8b5cf6', type: 'expense', is_system: true, user_id: null },
  { name: 'Travel', icon: 'plane', color: '#14b8a6', type: 'expense', is_system: true, user_id: null },
  { name: 'Insurance', icon: 'shield', color: '#64748b', type: 'expense', is_system: true, user_id: null },
  { name: 'Subscriptions', icon: 'refresh-cw', color: '#0ea5e9', type: 'expense', is_system: true, user_id: null },
  { name: 'Other Expense', icon: 'more-horizontal', color: '#94a3b8', type: 'expense', is_system: true, user_id: null },
  { name: 'Salary', icon: 'briefcase', color: '#10b981', type: 'income', is_system: true, user_id: null },
  { name: 'Freelance', icon: 'laptop', color: '#6366f1', type: 'income', is_system: true, user_id: null },
  { name: 'Investment', icon: 'trending-up', color: '#f59e0b', type: 'income', is_system: true, user_id: null },
  { name: 'Gift', icon: 'gift', color: '#ec4899', type: 'income', is_system: true, user_id: null },
  { name: 'Other Income', icon: 'plus-circle', color: '#94a3b8', type: 'income', is_system: true, user_id: null },
];

export async function up(knex: Knex): Promise<void> {
  const existing = await knex('categories').where({ is_system: true }).count('id as count').first();
  if (existing && Number(existing.count) > 0) return;

  await knex('categories').insert(defaultCategories);
}

export async function down(knex: Knex): Promise<void> {
  await knex('categories').where({ is_system: true }).delete();
}
