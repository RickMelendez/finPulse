import { PgCategoryRepo, CreateCategoryData } from '../adapters/repositories/PgCategoryRepo';
import { Category } from '../domain/entities/Category';

const repo = new PgCategoryRepo();

export async function updateCategory(id: string, userId: string, data: Partial<CreateCategoryData>): Promise<Category> {
  return repo.update(id, userId, data);
}
