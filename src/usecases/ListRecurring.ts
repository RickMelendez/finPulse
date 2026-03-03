import { PgRecurringRepo } from '../adapters/repositories/PgRecurringRepo';
import { RecurringTransaction } from '../domain/entities/RecurringTransaction';

const repo = new PgRecurringRepo();

export async function listRecurring(userId: string): Promise<RecurringTransaction[]> {
  return repo.list(userId);
}
