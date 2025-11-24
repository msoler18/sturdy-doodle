import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

import { AppError } from '../../shared/errors/AppError';

/**
 * Validates request data against a Zod schema.
 *
 * @author msoler18
 * @description Middleware factory that creates a validator for Express requests.
 * Parses the specified part of the request (query, body, or params) against
 * a Zod schema. On success, replaces the request data with validated/transformed
 * data. On validation failure, transforms Zod errors into a structured AppError
 * with field-level error messages for better client feedback.
 *
 * @param schema - Zod schema to validate against
 * @param source - Which part of the request to validate ('query' | 'body' | 'params')
 * @returns Express middleware function
 */
export const validateRequest = (
  schema: z.ZodSchema,
  source: 'query' | 'body' | 'params' = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req[source]);
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(
          new AppError(
            'Validation failed',
            'VALIDATION_ERROR',
            400,
            true,
            { errors: formattedErrors }
          )
        );
      } else {
        next(error);
      }
    }
  };
};