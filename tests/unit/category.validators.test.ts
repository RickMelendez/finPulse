import { createCategorySchema, updateCategorySchema } from '../../src/shared/validators/category.validators';

const validCreate = {
  name: 'Coffee',
  type: 'expense' as const,
  color: '#6f4e37',
  icon: 'coffee',
};

describe('createCategorySchema', () => {
  it('accepts valid category', () => {
    expect(createCategorySchema.safeParse(validCreate).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(createCategorySchema.safeParse({ ...validCreate, name: '' }).success).toBe(false);
  });

  it('rejects invalid type', () => {
    expect(createCategorySchema.safeParse({ ...validCreate, type: 'other' }).success).toBe(false);
  });

  it('rejects invalid hex color', () => {
    expect(createCategorySchema.safeParse({ ...validCreate, color: 'red' }).success).toBe(false);
  });

  it('accepts valid hex color', () => {
    expect(createCategorySchema.safeParse({ ...validCreate, color: '#FF5733' }).success).toBe(true);
  });

  it('accepts without optional fields', () => {
    expect(createCategorySchema.safeParse({ name: 'Books', type: 'expense' }).success).toBe(true);
  });

  it('accepts income type', () => {
    expect(createCategorySchema.safeParse({ name: 'Bonus', type: 'income' }).success).toBe(true);
  });
});

describe('updateCategorySchema', () => {
  it('accepts empty object', () => {
    expect(updateCategorySchema.safeParse({}).success).toBe(true);
  });

  it('accepts partial update', () => {
    expect(updateCategorySchema.safeParse({ name: 'Updated' }).success).toBe(true);
  });

  it('still validates color format on partial update', () => {
    expect(updateCategorySchema.safeParse({ color: 'not-a-hex' }).success).toBe(false);
  });
});
