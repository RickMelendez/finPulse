import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { createRecurringSchema, updateRecurringSchema } from '../../shared/validators/recurring.validators';
import { listRecurring } from '../../usecases/ListRecurring';
import { createRecurring } from '../../usecases/CreateRecurring';
import { updateRecurring } from '../../usecases/UpdateRecurring';
import { deleteRecurring } from '../../usecases/DeleteRecurring';
import { reconcileRecurring } from '../../usecases/ReconcileRecurring';
import { ValidationError } from '../../shared/errors/ValidationError';

const router = Router();
router.use(authMiddleware);

// GET /api/v1/recurring
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const rules = await listRecurring(user.id);
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/recurring
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = createRecurringSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const rule = await createRecurring({ userId: user.id, ...result.data });
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/recurring/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = updateRecurringSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const rule = await updateRecurring(req.params.id as string, user.id, result.data);
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/recurring/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await deleteRecurring(req.params.id as string, user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/recurring/reconcile  — trigger manual reconciliation
router.post('/reconcile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.body as { date?: string };
    const result = await reconcileRecurring(date);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
