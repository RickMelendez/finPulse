import { PgBudgetRepo, CreateBudgetData } from '../adapters/repositories/PgBudgetRepo';
import { Budget } from '../domain/entities/Budget';

const repo = new PgBudgetRepo();

export async function updateBudget(id: string, userId: string, data: Partial<CreateBudgetData> & { isActive?: boolean }): Promise<Budget> {
  return repo.update(id, userId, data);
}
