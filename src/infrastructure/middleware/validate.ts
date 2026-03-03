import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../../shared/errors/ValidationError';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.') || 'body';
        errors[key] = [...(errors[key] || []), e.message];
      });
      next(new ValidationError('Validation failed', errors));
      return;
    }
    req.body = result.data;
    next();
  };
}
