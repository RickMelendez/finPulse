import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { createCategorySchema, updateCategorySchema } from '../../shared/validators/category.validators';
import { listCategories } from '../../usecases/ListCategories';
import { createCategory } from '../../usecases/CreateCategory';
import { updateCategory } from '../../usecases/UpdateCategory';
import { deleteCategory } from '../../usecases/DeleteCategory';
import { ValidationError } from '../../shared/errors/ValidationError';

const router = Router();
router.use(authMiddleware);

// GET /api/v1/categories
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const categories = await listCategories(user.id);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = createCategorySchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const category = await createCategory({ userId: user.id, ...result.data });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/categories/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = updateCategorySchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const category = await updateCategory(req.params.id as string, user.id, result.data);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/categories/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await deleteCategory(req.params.id as string, user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
