import { PgRecurringRepo, CreateRecurringData } from '../adapters/repositories/PgRecurringRepo';
import { RecurringTransaction } from '../domain/entities/RecurringTransaction';

const repo = new PgRecurringRepo();

export async function createRecurring(data: CreateRecurringData): Promise<RecurringTransaction> {
  return repo.create(data);
}
