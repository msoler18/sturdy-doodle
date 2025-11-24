/**
 * Base error class for all application errors.
 * @author msoler18
 * @description Provides consistent error structure across the application
 * with error codes, HTTP status codes, and operational flags.
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