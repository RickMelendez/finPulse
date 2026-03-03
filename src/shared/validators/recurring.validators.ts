import { z } from 'zod';

export const createRecurringSchema = z.object({
  accountId: z.string().uuid('accountId must be a valid UUID'),
  categoryId: z.string().uuid('categoryId must be a valid UUID'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'type must be income or expense' }),
  }),
  amount: z.number().positive('amount must be greater than 0'),
  description: z.string().min(1, 'description is required').max(255),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly'], {
    errorMap: () => ({ message: 'frequency must be daily, weekly, biweekly, monthly, or yearly' }),
  }),
  nextRun: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'nextRun must be YYYY-MM-DD'),
});

export const updateRecurringSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(255).optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']).optional(),
  nextRun: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isActive: z.boolean().optional(),
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;
