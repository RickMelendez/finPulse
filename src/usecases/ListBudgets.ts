import { PgBudgetRepo, BudgetWithProgress } from '../adapters/repositories/PgBudgetRepo';

const repo = new PgBudgetRepo();

export async function listBudgets(userId: string): Promise<BudgetWithProgress[]> {
  return repo.list(userId);
}
