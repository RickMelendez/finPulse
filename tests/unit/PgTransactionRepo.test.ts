// Mock the database module before imports
jest.mock('../../src/infrastructure/config/database', () => {
  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    first: jest.fn(),
    returning: jest.fn(),
    groupBy: jest.fn().mockReturnThis(),
  };

  const db = jest.fn(() => mockQuery) as jest.Mock & { fn: { now: jest.Mock }; raw: jest.Mock };
  db.fn = { now: jest.fn(() => 'NOW()') };
  db.raw = jest.fn((sql: string) => sql);

  (db as unknown as jest.Mock & { _mockQuery: typeof mockQuery })._mockQuery = mockQuery;
  return { __esModule: true, default: db };
});

import { PgTransactionRepo } from '../../src/adapters/repositories/PgTransactionRepo';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';

const getMockQuery = () => {
  const dbModule = require('../../src/infrastructure/config/database');
  return dbModule.default._mockQuery;
};

const mockRow = {
  id: 'txn-001',
  user_id: 'user-001',
  account_id: 'acc-001',
  category_id: 'cat-001',
  type: 'expense',
  amount: '50.00',
  description: 'Grocery run',
  notes: null,
  transaction_date: '2026-03-01',
  is_recurring: false,
  recurring_id: null,
  created_at: new Date('2026-03-01'),
  updated_at: new Date('2026-03-01'),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PgTransactionRepo', () => {
  const repo = new PgTransactionRepo();

  describe('findById', () => {
    it('returns a transaction when found', async () => {
      const mock = getMockQuery();
      mock.first.mockResolvedValueOnce(mockRow);

      const result = await repo.findById('txn-001', 'user-001');

      expect(result.id).toBe('txn-001');
      expect(result.amount).toBe(50);
      expect(result.type).toBe('expense');
      expect(result.description).toBe('Grocery run');
    });

    it('maps snake_case DB row to camelCase entity', async () => {
      const mock = getMockQuery();
      mock.first.mockResolvedValueOnce(mockRow);

      const result = await repo.findById('txn-001', 'user-001');

      expect(result.userId).toBe('user-001');
      expect(result.accountId).toBe('acc-001');
      expect(result.categoryId).toBe('cat-001');
      expect(result.isRecurring).toBe(false);
      expect(result.notes).toBeUndefined();
    });

    it('throws NotFoundError when transaction does not exist', async () => {
      const mock = getMockQuery();
      mock.first.mockResolvedValueOnce(undefined);

      await expect(repo.findById('non-existent', 'user-001')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('inserts and returns the new transaction', async () => {
      const mock = getMockQuery();
      mock.returning.mockResolvedValueOnce([mockRow]);

      const result = await repo.create({
        userId: 'user-001',
        accountId: 'acc-001',
        categoryId: 'cat-001',
        type: 'expense',
        amount: 50,
        description: 'Grocery run',
        transactionDate: '2026-03-01',
      });

      expect(result.id).toBe('txn-001');
      expect(result.amount).toBe(50);
    });
  });

  describe('delete', () => {
    it('throws NotFoundError when no rows deleted', async () => {
      const mock = getMockQuery();
      mock.delete.mockResolvedValueOnce(0);

      await expect(repo.delete('non-existent', 'user-001')).rejects.toThrow(NotFoundError);
    });

    it('resolves when row is successfully deleted', async () => {
      const mock = getMockQuery();
      mock.delete.mockResolvedValueOnce(1);

      await expect(repo.delete('txn-001', 'user-001')).resolves.toBeUndefined();
    });
  });
});
