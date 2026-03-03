import { PgRecurringRepo, CreateRecurringData } from '../adapters/repositories/PgRecurringRepo';
import { RecurringTransaction } from '../domain/entities/RecurringTransaction';

const repo = new PgRecurringRepo();

export async function updateRecurring(id: string, userId: string, data: Partial<CreateRecurringData> & { isActive?: boolean }): Promise<RecurringTransaction> {
  return repo.update(id, userId, data);
}
