import { PgTransactionRepo, PaginatedTransactions } from '../adapters/repositories/PgTransactionRepo';
import { ListTransactionsQuery } from '../shared/validators/transaction.validators';

const repo = new PgTransactionRepo();

export async function listTransactions(userId: string, query: ListTransactionsQuery): Promise<PaginatedTransactions> {
  return repo.list(userId, query);
}
