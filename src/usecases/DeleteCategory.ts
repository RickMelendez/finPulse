import { PgCategoryRepo } from '../adapters/repositories/PgCategoryRepo';

const repo = new PgCategoryRepo();

export async function deleteCategory(id: string, userId: string): Promise<void> {
  return repo.delete(id, userId);
}
