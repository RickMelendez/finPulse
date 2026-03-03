import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('spending_insights', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('auth.users').onDelete('CASCADE');
    table.date('period_start').notNullable();
    table.date('period_end').notNullable();
    table.text('summary').notNullable();
    table.jsonb('recommendations').notNullable().defaultTo('[]');
    table.jsonb('top_categories').notNullable().defaultTo('{}');
    table.jsonb('anomalies').nullable();
    table.string('model_used', 50).notNullable();
    table.timestamp('generated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('expires_at', { useTz: true }).notNullable();

    table.index(['user_id', 'period_start', 'period_end'], 'idx_insights_user_period');
    table.index(['user_id', 'expires_at'], 'idx_insights_user_expires');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('spending_insights');
}
