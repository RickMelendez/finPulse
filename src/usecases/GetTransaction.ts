import { PgTransactionRepo } from '../adapters/repositories/PgTransactionRepo';
import { Transaction } from '../domain/entities/Transaction';

const repo = new PgTransactionRepo();

export async function getTransaction(id: string, userId: string): Promise<Transaction> {
  return repo.findById(id, userId);
}
