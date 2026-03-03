import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(1, 'name is required').max(100),
  type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment'], {
    errorMap: () => ({ message: 'type must be checking, savings, credit_card, cash, or investment' }),
  }),
  balance: z.number().default(0),
  currency: z.string().length(3, 'currency must be a 3-letter ISO code').default('USD'),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment']).optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
