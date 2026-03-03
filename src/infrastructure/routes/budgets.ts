import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { createBudgetSchema, updateBudgetSchema } from '../../shared/validators/budget.validators';
import { listBudgets } from '../../usecases/ListBudgets';
import { getBudget } from '../../usecases/GetBudget';
import { createBudget } from '../../usecases/CreateBudget';
import { updateBudget } from '../../usecases/UpdateBudget';
import { deleteBudget } from '../../usecases/DeleteBudget';
import { ValidationError } from '../../shared/errors/ValidationError';

const router = Router();
router.use(authMiddleware);

// GET /api/v1/budgets
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const budgets = await listBudgets(user.id);
    res.json({ success: true, data: budgets });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/budgets/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const budget = await getBudget(req.params.id as string, user.id);
    res.json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/budgets
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = createBudgetSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const budget = await createBudget({ userId: user.id, ...result.data });
    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/budgets/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = updateBudgetSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const budget = await updateBudget(req.params.id as string, user.id, result.data);
    res.json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/budgets/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await deleteBudget(req.params.id as string, user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
