import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create category_type enum
  await knex.raw(`
    CREATE TYPE category_type AS ENUM ('income', 'expense')
  `);

  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 50).notNullable();
    table.string('icon', 30).nullable();
    table.string('color', 7).nullable();
    table.specificType('type', 'category_type').notNullable();
    table.boolean('is_system').defaultTo(false);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index(['user_id'], 'idx_categories_user_id');
    table.index(['is_system'], 'idx_categories_is_system');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('categories');
  await knex.raw('DROP TYPE IF EXISTS category_type');
}
