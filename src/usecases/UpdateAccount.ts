import { PgAccountRepo } from '../adapters/repositories/PgAccountRepo';
import { Account } from '../domain/entities/Account';

const repo = new PgAccountRepo();

export async function updateAccount(id: string, userId: string, data: { name?: string; type?: string }): Promise<Account> {
  return repo.update(id, userId, data as Parameters<typeof repo.update>[2]);
}
