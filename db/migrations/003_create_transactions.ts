import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE transaction_type AS ENUM ('income', 'expense')
  `);

  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('auth.users').onDelete('CASCADE');
    table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('RESTRICT');
    table.uuid('category_id').notNullable().references('id').inTable('categories').onDelete('RESTRICT');
    table.specificType('type', 'transaction_type').notNullable();
    table.decimal('amount', 12, 2).notNullable().checkPositive();
    table.string('description', 255).notNullable();
    table.text('notes').nullable();
    table.date('transaction_date').notNullable();
    table.boolean('is_recurring').defaultTo(false);
    table.uuid('recurring_id').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index(['user_id', 'transaction_date'], 'idx_transactions_user_date');
    table.index(['user_id', 'category_id'], 'idx_transactions_user_category');
    table.index(['account_id'], 'idx_transactions_account');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
  await knex.raw('DROP TYPE IF EXISTS transaction_type');
}
