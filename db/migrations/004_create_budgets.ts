import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE budget_period AS ENUM ('weekly', 'monthly', 'yearly')
  `);

  await knex.schema.createTable('budgets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('auth.users').onDelete('CASCADE');
    table.uuid('category_id').nullable().references('id').inTable('categories').onDelete('SET NULL');
    table.decimal('amount', 12, 2).notNullable().checkPositive();
    table.specificType('period', 'budget_period').notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index(['user_id', 'is_active'], 'idx_budgets_user_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('budgets');
  await knex.raw('DROP TYPE IF EXISTS budget_period');
}
