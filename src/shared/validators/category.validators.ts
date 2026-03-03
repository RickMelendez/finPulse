import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'name is required').max(50),
  type: z.enum(['income', 'expense'], { errorMap: () => ({ message: 'type must be income or expense' }) }),
  icon: z.string().max(30).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color must be a valid hex color (e.g. #ff0000)').optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
