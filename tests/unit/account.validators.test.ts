import { createAccountSchema, updateAccountSchema } from '../../src/shared/validators/account.validators';

describe('createAccountSchema', () => {
  const valid = { name: 'Chase Checking', type: 'checking' as const };

  it('accepts valid account', () => {
    expect(createAccountSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults balance to 0', () => {
    const result = createAccountSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.balance).toBe(0);
  });

  it('defaults currency to USD', () => {
    const result = createAccountSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.currency).toBe('USD');
  });

  it('rejects empty name', () => {
    expect(createAccountSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects invalid type', () => {
    expect(createAccountSchema.safeParse({ ...valid, type: 'wallet' }).success).toBe(false);
  });

  it('accepts all valid types', () => {
    for (const type of ['checking', 'savings', 'credit_card', 'cash', 'investment'] as const) {
      expect(createAccountSchema.safeParse({ ...valid, type }).success).toBe(true);
    }
  });

  it('rejects currency not 3 chars', () => {
    expect(createAccountSchema.safeParse({ ...valid, currency: 'US' }).success).toBe(false);
  });
});

describe('updateAccountSchema', () => {
  it('accepts empty object', () => {
    expect(updateAccountSchema.safeParse({}).success).toBe(true);
  });

  it('accepts partial name update', () => {
    expect(updateAccountSchema.safeParse({ name: 'New Name' }).success).toBe(true);
  });

  it('still validates type on update', () => {
    expect(updateAccountSchema.safeParse({ type: 'wallet' }).success).toBe(false);
  });
});
