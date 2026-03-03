import { PgTransactionRepo } from '../adapters/repositories/PgTransactionRepo';

const repo = new PgTransactionRepo();

export async function deleteTransaction(id: string, userId: string): Promise<void> {
  return repo.delete(id, userId);
}
