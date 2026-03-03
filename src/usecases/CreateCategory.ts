import { PgCategoryRepo, CreateCategoryData } from '../adapters/repositories/PgCategoryRepo';
import { Category } from '../domain/entities/Category';

const repo = new PgCategoryRepo();

export async function createCategory(data: CreateCategoryData): Promise<Category> {
  return repo.create(data);
}
