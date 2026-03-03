import { createBudgetSchema, updateBudgetSchema } from '../../src/shared/validators/budget.validators';

const validCreate = {
  amount: 500,
  period: 'monthly' as const,
  startDate: '2026-03-01',
  endDate: '2026-03-31',
};

describe('createBudgetSchema', () => {
  it('accepts valid budget', () => {
    expect(createBudgetSchema.safeParse(validCreate).success).toBe(true);
  });

  it('accepts with optional categoryId', () => {
    const result = createBudgetSchema.safeParse({
      ...validCreate,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative amount', () => {
    expect(createBudgetSchema.safeParse({ ...validCreate, amount: -100 }).success).toBe(false);
  });

  it('rejects zero amount', () => {
    expect(createBudgetSchema.safeParse({ ...validCreate, amount: 0 }).success).toBe(false);
  });

  it('rejects invalid period', () => {
    expect(createBudgetSchema.safeParse({ ...validCreate, period: 'daily' }).success).toBe(false);
  });

  it('rejects invalid date format', () => {
    expect(createBudgetSchema.safeParse({ ...validCreate, startDate: '03/01/2026' }).success).toBe(false);
  });

  it('rejects endDate before startDate', () => {
    const result = createBudgetSchema.safeParse({
      ...validCreate,
      startDate: '2026-03-31',
      endDate: '2026-03-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const endDateError = result.error.errors.find((e) => e.path.includes('endDate'));
      expect(endDateError).toBeDefined();
    }
  });

  it('accepts all valid periods', () => {
    for (const period of ['weekly', 'monthly', 'yearly'] as const) {
      expect(createBudgetSchema.safeParse({ ...validCreate, period }).success).toBe(true);
    }
  });
});

describe('updateBudgetSchema', () => {
  it('accepts empty object', () => {
    expect(updateBudgetSchema.safeParse({}).success).toBe(true);
  });

  it('accepts isActive flag', () => {
    expect(updateBudgetSchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it('accepts partial amount update', () => {
    expect(updateBudgetSchema.safeParse({ amount: 750 }).success).toBe(true);
  });

  it('still validates amount is positive', () => {
    expect(updateBudgetSchema.safeParse({ amount: -50 }).success).toBe(false);
  });
});
