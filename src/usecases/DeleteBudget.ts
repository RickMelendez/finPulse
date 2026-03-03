import { PgBudgetRepo } from '../adapters/repositories/PgBudgetRepo';

const repo = new PgBudgetRepo();

export async function deleteBudget(id: string, userId: string): Promise<void> {
  return repo.delete(id, userId);
}
