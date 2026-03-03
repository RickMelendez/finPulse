import { PgRecurringRepo } from '../adapters/repositories/PgRecurringRepo';

const repo = new PgRecurringRepo();

export async function deleteRecurring(id: string, userId: string): Promise<void> {
  return repo.delete(id, userId);
}
