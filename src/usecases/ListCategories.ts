import { PgCategoryRepo } from '../adapters/repositories/PgCategoryRepo';
import { Category } from '../domain/entities/Category';

const repo = new PgCategoryRepo();

export async function listCategories(userId: string): Promise<Category[]> {
  return repo.list(userId);
}
