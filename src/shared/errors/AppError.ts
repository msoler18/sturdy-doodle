/**
 * Base error class for all application errors.
 * 
 * @author msoler18
 * @description Provides consistent error structure across the application
 * with error codes, HTTP status codes, and operational flags. All custom
 * errors should extend this class to ensure uniform error handling in
 * middleware and logging. The isOperational flag distinguishes between
 * expected errors (e.g., validation failures) and programmer errors (bugs).
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}