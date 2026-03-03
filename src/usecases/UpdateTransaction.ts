import { PgTransactionRepo, CreateTransactionData } from '../adapters/repositories/PgTransactionRepo';
import { Transaction } from '../domain/entities/Transaction';

const repo = new PgTransactionRepo();

export async function updateTransaction(id: string, userId: string, data: Partial<CreateTransactionData>): Promise<Transaction> {
  return repo.update(id, userId, data);
}
