import type { Knex } from 'knex';

// RLS policies used Supabase-specific auth.uid() which is not available on
// standard PostgreSQL (Railway). Application-level user_id filtering in all
// queries provides the same isolation guarantee. This migration is a no-op.
export async function up(_knex: Knex): Promise<void> {
  // no-op
}

export async function down(_knex: Knex): Promise<void> {
  // no-op
}
