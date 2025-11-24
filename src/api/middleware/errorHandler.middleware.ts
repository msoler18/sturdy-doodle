import { NextFunction, Request, Response } from 'express';

import { logger } from '../../config/logger.config';
import { AppError } from '../../shared/errors/AppError';

/**
 * Global error handler middleware for Express.
 *
 * @author msoler18
 * @description Centralized error handling that catches all errors thrown in
 * controllers, services, or other middleware. Transforms application errors
 * (AppError and its subclasses like DatabaseError, ExternalApiError) into
 * structured JSON responses with appropriate HTTP status codes. Logs all errors
 * with context for debugging. Unknown errors are treated as 500 Internal Server
 * Error to prevent leaking implementation details to clients.
 *
 * @remarks
 * Error handling strategy:
 * - Operational errors (AppError.isOperational = true): Return user-friendly messages
 * - Programming errors (bugs): Log full stack trace, return generic 500 message
 * - Database errors: Map to appropriate HTTP status (409 for conflicts, 500 for others)
 * - External API errors: Preserve original status code when available
 * - Validation errors: Return 400 with field-level error details
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const logContext = {
    method: req.method,
    url: req.url,
    statusCode: error instanceof AppError ? error.statusCode : 500,
    errorCode: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
    stack: error.stack,
    metadata: error instanceof AppError ? error.metadata : undefined,
  };

  if (error instanceof AppError && error.isOperational) {
    logger.warn('Operational error occurred', logContext);
  } else {
    logger.error('Unexpected error occurred', logContext);
  }

  if (error instanceof AppError) {
    const response = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...(error.metadata && { metadata: error.metadata }),
      },
    };

    res.status(error.statusCode).json(response);
    return;
  }

  logger.error('Unhandled error - this is a bug', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    },
  });
};