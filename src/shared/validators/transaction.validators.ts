import { z } from 'zod';

export const createTransactionSchema = z.object({
  accountId: z.string().uuid('accountId must be a valid UUID'),
  categoryId: z.string().uuid('categoryId must be a valid UUID'),
  type: z.enum(['income', 'expense'], { errorMap: () => ({ message: 'type must be income or expense' }) }),
  amount: z.number().positive('amount must be greater than 0'),
  description: z.string().min(1, 'description is required').max(255),
  notes: z.string().max(2000).optional(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'transactionDate must be YYYY-MM-DD'),
  isRecurring: z.boolean().default(false),
  recurringId: z.string().uuid().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const listTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.enum(['transaction_date', 'amount', 'created_at']).default('transaction_date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
