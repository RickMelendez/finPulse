import { PgBudgetRepo, BudgetWithProgress } from '../adapters/repositories/PgBudgetRepo';

const repo = new PgBudgetRepo();

export async function getBudget(id: string, userId: string): Promise<BudgetWithProgress> {
  return repo.findById(id, userId);
}
