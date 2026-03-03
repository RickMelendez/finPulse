import { PgAccountRepo, CreateAccountData } from '../adapters/repositories/PgAccountRepo';
import { Account } from '../domain/entities/Account';

const repo = new PgAccountRepo();

export async function createAccount(data: CreateAccountData): Promise<Account> {
  return repo.create(data);
}
