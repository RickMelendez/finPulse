import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')
  `);

  await knex.schema.createTable('recurring_transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('auth.users').onDelete('CASCADE');
    table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('RESTRICT');
    table.uuid('category_id').notNullable().references('id').inTable('categories').onDelete('RESTRICT');
    table.specificType('type', 'transaction_type').notNullable();
    table.decimal('amount', 12, 2).notNullable().checkPositive();
    table.string('description', 255).notNullable();
    table.specificType('frequency', 'recurring_frequency').notNullable();
    table.date('next_run').notNullable();
    table.boolean('is_active').defaultTo(true);

    table.index(['next_run', 'is_active'], 'idx_recurring_next_run');
  });

  // Add FK from transactions.recurring_id to recurring_transactions.id
  await knex.schema.alterTable('transactions', (table) => {
    table.foreign('recurring_id').references('id').inTable('recurring_transactions').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.dropForeign(['recurring_id']);
  });
  await knex.schema.dropTableIfExists('recurring_transactions');
  await knex.raw('DROP TYPE IF EXISTS recurring_frequency');
}
