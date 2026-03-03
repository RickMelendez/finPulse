import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('budgets', (table) => {
    table.string('name', 100).notNullable().defaultTo('');
    table.date('end_date').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('budgets', (table) => {
    table.dropColumn('name');
    table.date('end_date').notNullable().alter();
  });
}
