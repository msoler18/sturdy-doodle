import { AppError } from './AppError';

/**
 * Error thrown when database operations fail.
 * 
 * @author msoler18
 * @description Wraps database-specific errors (connection failures, constraint
 * violations, query errors) into a consistent application error format.
 * Provides factory method fromKnexError() to automatically categorize
 * PostgreSQL errors into specific error codes for better error handling
 * and user feedback.
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    code: string = 'DATABASE_ERROR',
    metadata?: Record<string, unknown>
  ) {
    super(message, code, 500, true, metadata);
  }

  /**
   * Factory method to convert Knex/PostgreSQL errors into DatabaseError.
   * 
   * @author msoler18
   * @description Analyzes error messages from Knex to categorize them into
   * specific error types (unique violations, foreign key violations, connection
   * errors). This allows controllers to provide appropriate HTTP status codes
   * and user-friendly messages instead of exposing raw database errors.
   * 
   * @param {Error} error - Raw error from Knex/PostgreSQL
   * @returns {DatabaseError} Categorized database error with specific code
   */
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

    return new DatabaseError(
      'Database operation failed',
      'DATABASE_ERROR',
      { originalError: error.message }
    );
  }
}