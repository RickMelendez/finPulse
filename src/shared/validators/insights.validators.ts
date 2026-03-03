import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const insightsQuerySchema = z.object({
  periodStart: z.string().regex(dateRegex, 'periodStart must be YYYY-MM-DD').optional(),
  periodEnd: z.string().regex(dateRegex, 'periodEnd must be YYYY-MM-DD').optional(),
});

export const askQuestionSchema = z.object({
  question: z
    .string()
    .min(3, 'question must be at least 3 characters')
    .max(500, 'question must be under 500 characters'),
});

export type InsightsQuery = z.infer<typeof insightsQuerySchema>;
export type AskQuestionInput = z.infer<typeof askQuestionSchema>;
