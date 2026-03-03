import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuerySchema,
} from '../../shared/validators/transaction.validators';
import { createTransaction } from '../../usecases/CreateTransaction';
import { getTransaction } from '../../usecases/GetTransaction';
import { listTransactions } from '../../usecases/ListTransactions';
import { updateTransaction } from '../../usecases/UpdateTransaction';
import { deleteTransaction } from '../../usecases/DeleteTransaction';
import { getTransactionSummary } from '../../usecases/GetTransactionSummary';
import { ValidationError } from '../../shared/errors/ValidationError';

const router = Router();

// All transaction routes require authentication
router.use(authMiddleware);

// GET /api/v1/transactions/summary  — must be before /:id
router.get('/summary', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const summary = await getTransactionSummary(req.user.id, startDate, endDate);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/transactions
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = listTransactionsQuerySchema.safeParse(req.query);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.') || 'query';
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Invalid query parameters', errors);
    }
    const paginated = await listTransactions(req.user.id, result.data);
    res.json({ success: true, ...paginated });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/transactions/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const transaction = await getTransaction(req.params.id, req.user.id);
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/transactions
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = createTransactionSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const transaction = await createTransaction({ userId: req.user.id, ...result.data });
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/transactions/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = updateTransactionSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const transaction = await updateTransaction(req.params.id, req.user.id, result.data);
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/transactions/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await deleteTransaction(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
