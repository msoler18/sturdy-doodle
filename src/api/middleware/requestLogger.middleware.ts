import { NextFunction, Request, Response } from 'express';

import { logger } from '../../config/logger.config';

/**
 * Request logging middleware for Express.
 *
 * @author msoler18
 * @description Logs all incoming HTTP requests with structured metadata including
 * method, URL, status code, response time, and IP address. Logs at 'info' level
 * for successful requests (2xx, 3xx) and 'warn' level for client errors (4xx).
 * Server errors (5xx) are logged by the error handler middleware. This provides
 * comprehensive request tracing for debugging and monitoring in production.
 *
 * @remarks
 * Why log requests:
 * - Debugging: Track which endpoints are called and their performance
 * - Monitoring: Identify slow endpoints or unusual traffic patterns
 * - Security: Audit trail of all API access attempts
 * - Analytics: Understand API usage patterns
 *
 * Response time is calculated from request start to response finish, providing
 * accurate performance metrics for each endpoint.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 400 && res.statusCode < 500) {
      logger.warn('Client error request', logData);
    } else {
      logger.info('HTTP request', logData);
    }
  });

  next();
};