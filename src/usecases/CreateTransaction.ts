import { PgTransactionRepo, CreateTransactionData } from '../adapters/repositories/PgTransactionRepo';
import { Transaction } from '../domain/entities/Transaction';

const repo = new PgTransactionRepo();

export async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  return repo.create(data);
}
