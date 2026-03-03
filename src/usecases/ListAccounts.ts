import { PgAccountRepo } from '../adapters/repositories/PgAccountRepo';
import { Account } from '../domain/entities/Account';

const repo = new PgAccountRepo();

export async function listAccounts(userId: string): Promise<Account[]> {
  return repo.list(userId);
}
