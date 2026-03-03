import { insightsQuerySchema, askQuestionSchema } from '../../src/shared/validators/insights.validators';

describe('insightsQuerySchema', () => {
  it('accepts empty query (both fields optional)', () => {
    expect(insightsQuerySchema.safeParse({}).success).toBe(true);
  });

  it('accepts valid date range', () => {
    const result = insightsQuerySchema.safeParse({
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date format', () => {
    expect(insightsQuerySchema.safeParse({ periodStart: '01/01/2026' }).success).toBe(false);
  });

  it('accepts only periodStart', () => {
    expect(insightsQuerySchema.safeParse({ periodStart: '2026-01-01' }).success).toBe(true);
  });
});

describe('askQuestionSchema', () => {
  it('accepts valid question', () => {
    expect(askQuestionSchema.safeParse({ question: 'How much did I spend on food?' }).success).toBe(true);
  });

  it('rejects question under 3 chars', () => {
    expect(askQuestionSchema.safeParse({ question: 'Hi' }).success).toBe(false);
  });

  it('rejects missing question', () => {
    expect(askQuestionSchema.safeParse({}).success).toBe(false);
  });

  it('rejects question over 500 chars', () => {
    expect(askQuestionSchema.safeParse({ question: 'a'.repeat(501) }).success).toBe(false);
  });

  it('accepts question at max boundary', () => {
    expect(askQuestionSchema.safeParse({ question: 'a'.repeat(500) }).success).toBe(true);
  });
});
