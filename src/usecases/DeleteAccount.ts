import { PgAccountRepo } from '../adapters/repositories/PgAccountRepo';

const repo = new PgAccountRepo();

export async function deleteAccount(id: string, userId: string): Promise<void> {
  return repo.delete(id, userId);
}
