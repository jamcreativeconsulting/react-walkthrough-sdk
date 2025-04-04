import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { AuthError } from './authMiddleware';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | AuthError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', err);

  if (err instanceof AuthError) {
    return res.status(err.status).json({
      status: 'fail',
      error: err.message
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err.message
    });
  }

  // Handle database errors
  if (err.message.includes('database') || err.message.includes('SQL')) {
    return res.status(500).json({
      status: 'error',
      error: 'Database error occurred'
    });
  }

  // Default error
  return res.status(500).json({
    status: 'error',
    error: 'Something went wrong'
  });
}; 