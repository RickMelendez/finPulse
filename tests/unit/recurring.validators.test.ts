import { createRecurringSchema, updateRecurringSchema } from '../../src/shared/validators/recurring.validators';

const validCreate = {
  accountId: '123e4567-e89b-12d3-a456-426614174000',
  categoryId: '123e4567-e89b-12d3-a456-426614174001',
  type: 'expense' as const,
  amount: 120,
  description: 'Netflix subscription',
  frequency: 'monthly' as const,
  nextRun: '2026-04-01',
};

describe('createRecurringSchema', () => {
  it('accepts valid recurring rule', () => {
    expect(createRecurringSchema.safeParse(validCreate).success).toBe(true);
  });

  it('rejects invalid accountId UUID', () => {
    expect(createRecurringSchema.safeParse({ ...validCreate, accountId: 'not-uuid' }).success).toBe(false);
  });

  it('rejects invalid type', () => {
    expect(createRecurringSchema.safeParse({ ...validCreate, type: 'transfer' }).success).toBe(false);
  });

  it('rejects zero amount', () => {
    expect(createRecurringSchema.safeParse({ ...validCreate, amount: 0 }).success).toBe(false);
  });

  it('rejects negative amount', () => {
    expect(createRecurringSchema.safeParse({ ...validCreate, amount: -50 }).success).toBe(false);
  });

  it('rejects invalid frequency', () => {
    expect(createRecurringSchema.safeParse({ ...validCreate, frequency: 'quarterly' }).success).toBe(false);
  });

  it('accepts all valid frequencies', () => {
    for (const frequency of ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const) {
      expect(createRecurringSchema.safeParse({ ...validCreate, frequency }).success).toBe(true);
    }
  });

  it('rejects invalid nextRun date format', () => {
    expect(createRecurringSchema.safeParse({ ...validCreate, nextRun: '04/01/2026' }).success).toBe(false);
  });

  it('rejects empty description', () => {
    expect(createRecurringSchema.safeParse({ ...validCreate, description: '' }).success).toBe(false);
  });
});

describe('updateRecurringSchema', () => {
  it('accepts empty object', () => {
    expect(updateRecurringSchema.safeParse({}).success).toBe(true);
  });

  it('accepts isActive flag', () => {
    expect(updateRecurringSchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it('accepts partial amount update', () => {
    expect(updateRecurringSchema.safeParse({ amount: 150 }).success).toBe(true);
  });

  it('still validates frequency on update', () => {
    expect(updateRecurringSchema.safeParse({ frequency: 'quarterly' }).success).toBe(false);
  });
});
