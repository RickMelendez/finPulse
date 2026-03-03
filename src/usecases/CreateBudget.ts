import { PgBudgetRepo, CreateBudgetData } from '../adapters/repositories/PgBudgetRepo';
import { Budget } from '../domain/entities/Budget';

const repo = new PgBudgetRepo();

export async function createBudget(data: CreateBudgetData): Promise<Budget> {
  return repo.create(data);
}
