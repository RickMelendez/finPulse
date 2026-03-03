import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create account_type enum
  await knex.raw(`
    CREATE TYPE account_type AS ENUM (
      'checking', 'savings', 'credit_card', 'cash', 'investment'
    )
  `);

  await knex.schema.createTable('accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.specificType('type', 'account_type').notNullable();
    table.decimal('balance', 12, 2).defaultTo(0.00);
    table.string('currency', 3).defaultTo('USD');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index(['user_id'], 'idx_accounts_user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('accounts');
  await knex.raw('DROP TYPE IF EXISTS account_type');
}
