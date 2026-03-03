import { z } from 'zod';

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'name is required').optional(),
  categoryId: z.string().uuid('categoryId must be a valid UUID').optional(),
  amount: z.number().positive('amount must be greater than 0'),
  period: z.enum(['weekly', 'monthly', 'yearly'], {
    errorMap: () => ({ message: 'period must be weekly, monthly, or yearly' }),
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD').optional(),
}).refine((data) => !data.endDate || data.startDate <= data.endDate, {
  message: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('amount must be greater than 0').optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isActive: z.boolean().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
