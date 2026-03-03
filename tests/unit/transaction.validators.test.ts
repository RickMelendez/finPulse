import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuerySchema,
} from '../../src/shared/validators/transaction.validators';

const validCreate = {
  accountId: '123e4567-e89b-12d3-a456-426614174000',
  categoryId: '123e4567-e89b-12d3-a456-426614174001',
  type: 'expense' as const,
  amount: 50.00,
  description: 'Grocery run',
  transactionDate: '2026-03-01',
};

describe('createTransactionSchema', () => {
  it('accepts a valid transaction', () => {
    const result = createTransactionSchema.safeParse(validCreate);
    expect(result.success).toBe(true);
  });

  it('rejects invalid accountId UUID', () => {
    const result = createTransactionSchema.safeParse({ ...validCreate, accountId: 'not-a-uuid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('accountId');
    }
  });

  it('rejects invalid type', () => {
    const result = createTransactionSchema.safeParse({ ...validCreate, type: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects zero or negative amount', () => {
    const result = createTransactionSchema.safeParse({ ...validCreate, amount: -10 });
    expect(result.success).toBe(false);
  });

  it('rejects zero amount', () => {
    const result = createTransactionSchema.safeParse({ ...validCreate, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = createTransactionSchema.safeParse({ ...validCreate, transactionDate: '03/01/2026' });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = createTransactionSchema.safeParse({ ...validCreate, description: '' });
    expect(result.success).toBe(false);
  });

  it('defaults isRecurring to false', () => {
    const result = createTransactionSchema.safeParse(validCreate);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isRecurring).toBe(false);
  });

  it('accepts income type', () => {
    const result = createTransactionSchema.safeParse({ ...validCreate, type: 'income' });
    expect(result.success).toBe(true);
  });

  it('accepts optional notes', () => {
    const result = createTransactionSchema.safeParse({ ...validCreate, notes: 'Bought vegetables' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.notes).toBe('Bought vegetables');
  });
});

describe('updateTransactionSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = updateTransactionSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update', () => {
    const result = updateTransactionSchema.safeParse({ amount: 75.00 });
    expect(result.success).toBe(true);
  });

  it('still validates types on provided fields', () => {
    const result = updateTransactionSchema.safeParse({ type: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('listTransactionsQuerySchema', () => {
  it('applies defaults when empty', () => {
    const result = listTransactionsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe('transaction_date');
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('coerces page and limit from strings', () => {
    const result = listTransactionsQuerySchema.safeParse({ page: '2', limit: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it('rejects limit over 100', () => {
    const result = listTransactionsQuerySchema.safeParse({ limit: '200' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sortBy', () => {
    const result = listTransactionsQuerySchema.safeParse({ sortBy: 'name' });
    expect(result.success).toBe(false);
  });

  it('accepts valid date filters', () => {
    const result = listTransactionsQuerySchema.safeParse({
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date format in filters', () => {
    const result = listTransactionsQuerySchema.safeParse({ startDate: '01/01/2026' });
    expect(result.success).toBe(false);
  });
});
