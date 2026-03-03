import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { insightsQuerySchema, askQuestionSchema } from '../../shared/validators/insights.validators';
import { generateSpendingInsights } from '../../usecases/GenerateSpendingInsights';
import { getSpendingTrends } from '../../usecases/GetSpendingTrends';
import { askFinanceQuestion } from '../../usecases/AskFinanceQuestion';
import { ValidationError } from '../../shared/errors/ValidationError';

const router = Router();
router.use(authMiddleware);

function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

// GET /api/v1/insights
// Returns AI-generated spending insights for the current month (or specified period)
// Served from cache if available (24h TTL)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const queryResult = insightsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      throw new ValidationError('Invalid query parameters', {});
    }

    const { start, end } = getCurrentMonthRange();
    const periodStart = queryResult.data.periodStart ?? start;
    const periodEnd = queryResult.data.periodEnd ?? end;

    const insight = await generateSpendingInsights(user.id, periodStart, periodEnd);
    res.json({ success: true, data: insight });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/insights/trends
// Returns AI trend analysis over the last 3 months (always fresh — no cache)
router.get('/trends', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const trends = await getSpendingTrends(user.id);
    res.json({ success: true, data: trends });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/insights/ask
// Ask Claude a natural language question about your finances
router.post('/ask', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = askQuestionSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const answer = await askFinanceQuestion(user.id, result.data.question);
    res.json({ success: true, data: { answer } });
  } catch (err) {
    next(err);
  }
});

export default router;
