import { PgRecurringRepo } from '../adapters/repositories/PgRecurringRepo';

const repo = new PgRecurringRepo();

export async function reconcileRecurring(today?: string): Promise<{ created: number; errors: string[] }> {
  const date = today ?? new Date().toISOString().split('T')[0];
  return repo.reconcile(date);
}
