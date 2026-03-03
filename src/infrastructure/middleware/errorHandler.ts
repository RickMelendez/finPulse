import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { ValidationError } from '../../shared/errors/ValidationError';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Unexpected error
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}
