import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tables = ['accounts', 'categories', 'transactions', 'budgets', 'recurring_transactions', 'spending_insights'];

  // Enable RLS on all tables
  for (const table of tables) {
    await knex.raw(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
  }

  // accounts: users can only see/modify their own
  await knex.raw(`
    CREATE POLICY "accounts_user_isolation" ON accounts
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid())
  `);

  // categories: users can see system categories OR their own
  await knex.raw(`
    CREATE POLICY "categories_user_isolation" ON categories
      USING (user_id IS NULL OR user_id = auth.uid())
      WITH CHECK (user_id = auth.uid())
  `);

  // transactions: users can only see/modify their own
  await knex.raw(`
    CREATE POLICY "transactions_user_isolation" ON transactions
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid())
  `);

  // budgets: users can only see/modify their own
  await knex.raw(`
    CREATE POLICY "budgets_user_isolation" ON budgets
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid())
  `);

  // recurring_transactions: users can only see/modify their own
  await knex.raw(`
    CREATE POLICY "recurring_transactions_user_isolation" ON recurring_transactions
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid())
  `);

  // spending_insights: users can only see/modify their own
  await knex.raw(`
    CREATE POLICY "spending_insights_user_isolation" ON spending_insights
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid())
  `);
}

export async function down(knex: Knex): Promise<void> {
  const policies = [
    ['accounts', 'accounts_user_isolation'],
    ['categories', 'categories_user_isolation'],
    ['transactions', 'transactions_user_isolation'],
    ['budgets', 'budgets_user_isolation'],
    ['recurring_transactions', 'recurring_transactions_user_isolation'],
    ['spending_insights', 'spending_insights_user_isolation'],
  ];

  for (const [table, policy] of policies) {
    await knex.raw(`DROP POLICY IF EXISTS "${policy}" ON ${table}`);
  }

  const tables = ['accounts', 'categories', 'transactions', 'budgets', 'recurring_transactions', 'spending_insights'];
  for (const table of tables) {
    await knex.raw(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`);
  }
}
