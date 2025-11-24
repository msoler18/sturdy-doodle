import { AppError } from './AppError';

/**
 * Error thrown when database operations fail.
 * @author msoler18
 * @description Wraps database-specific errors (connection failures, constraint 
 * violations, query errors) into a consistent application error format.
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    code: string = 'DATABASE_ERROR',
    metadata?: Record<string, unknown>
  ) {
    super(message, code, 500, true, metadata);
  }

  static fromKnexError(error: Error): DatabaseError {
    if (error.message.includes('unique constraint')) {
      return new DatabaseError(
        'A record with these values already exists',
        'DATABASE_UNIQUE_VIOLATION',
        { originalError: error.message }
      );
    }

    if (error.message.includes('foreign key')) {
      return new DatabaseError(
        'Referenced record does not exist',
        'DATABASE_FOREIGN_KEY_VIOLATION',
        { originalError: error.message }
      );
    }

    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      return new DatabaseError(
        'Unable to connect to database',
        'DATABASE_CONNECTION_ERROR',
        { originalError: error.message }
      );
    }

  }
}