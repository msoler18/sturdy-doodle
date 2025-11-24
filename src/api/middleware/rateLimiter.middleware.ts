import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { logger } from '../../config/logger.config';

/**
 * Rate limiter middleware configuration.
 *
 * @author msoler18
 * @description Protects API endpoints from abuse by limiting the number of
 * requests per IP address within a time window. Prevents DDoS attacks, brute
 * force attempts, and excessive API usage. When limit is exceeded, returns
 * 429 Too Many Requests with retry-after information.
 *
 * @remarks
 * Configuration:
 * - Window: 15 minutes (900,000 ms)
 * - Max requests: 100 per window per IP
 * - Standard headers: X-RateLimit-* headers included
 * - Skip successful requests: Only counts requests that complete (not errors)
 *
 * Why 100 requests/15 min:
 * - Allows normal usage patterns (multiple forecasts, testing)
 * - Prevents abuse without blocking legitimate users
 * - Balances security with usability
 *
 * Production considerations:
 * - For distributed systems, use Redis store instead of memory
 * - Adjust limits based on actual usage patterns
 * - Monitor rate limit hits to detect attacks
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip || req.socket.remoteAddress,
      url: req.url,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
      },
    });
  },
});