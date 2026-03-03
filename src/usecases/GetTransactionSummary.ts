import { PgTransactionRepo } from '../adapters/repositories/PgTransactionRepo';

const repo = new PgTransactionRepo();

export async function getTransactionSummary(userId: string, startDate?: string, endDate?: string) {
  return repo.getSummary(userId, startDate, endDate);
}
