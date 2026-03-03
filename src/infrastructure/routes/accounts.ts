import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { createAccountSchema, updateAccountSchema } from '../../shared/validators/account.validators';
import { listAccounts } from '../../usecases/ListAccounts';
import { getAccount } from '../../usecases/GetAccount';
import { createAccount } from '../../usecases/CreateAccount';
import { updateAccount } from '../../usecases/UpdateAccount';
import { deleteAccount } from '../../usecases/DeleteAccount';
import { ValidationError } from '../../shared/errors/ValidationError';

const router = Router();
router.use(authMiddleware);

// GET /api/v1/accounts
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const accounts = await listAccounts(user.id);
    res.json({ success: true, data: accounts });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/accounts/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const account = await getAccount(req.params.id as string, user.id);
    res.json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/accounts
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = createAccountSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const account = await createAccount({ userId: user.id, ...result.data });
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/accounts/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const result = updateAccountSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.');
        errors[key] = [...(errors[key] || []), e.message];
      });
      throw new ValidationError('Validation failed', errors);
    }
    const account = await updateAccount(req.params.id as string, user.id, result.data);
    res.json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/accounts/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    await deleteAccount(req.params.id as string, user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
