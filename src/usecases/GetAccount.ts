import { PgAccountRepo } from '../adapters/repositories/PgAccountRepo';
import { Account } from '../domain/entities/Account';

const repo = new PgAccountRepo();

export async function getAccount(id: string, userId: string): Promise<Account> {
  return repo.findById(id, userId);
}
