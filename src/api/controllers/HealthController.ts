import { Request, Response, NextFunction } from 'express';

import { HealthService } from '../../application/services/HealthService';

/**
 * Controller for health check HTTP endpoint.
 *
 * @author msoler18
 * @description Handles HTTP requests for system health checks. Delegates to
 * HealthService and returns health status. This controller follows the "thin
 * controller" principle - no business logic, only HTTP concerns.
 *
 * @remarks
 * Controller responsibilities:
 * - Call HealthService.checkHealth()
 * - Format HTTP response with appropriate status code
 * - Let errors propagate to error handler middleware
 */
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * @swagger
   * /api/v1/health:
   *   get:
   *     summary: Check system health
   *     description: |
   *       Returns overall system health including database and external API connectivity.
   *       Status codes: 200 for all systems operational, 503 for degraded or down.
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: All systems operational
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthStatus'
   *             example:
   *               status: "ok"
   *               timestamp: "2025-11-24T10:30:00.000Z"
   *               uptime: 3600
   *               database:
   *                 status: "ok"
   *                 responseTime: 5
   *               externalApis:
   *                 openWeather:
   *                   status: "ok"
   *                   responseTime: 120
   *       503:
   *         description: System degraded or down
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthStatus'
   *             example:
   *               status: "degraded"
   *               timestamp: "2025-11-24T10:30:00.000Z"
   *               uptime: 3600
   *               database:
   *                 status: "ok"
   *                 responseTime: 5
   *               externalApis:
   *                 openWeather:
   *                   status: "error"
   *                   message: "API key invalid"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  /**
   * GET /health - Check system health.
   *
   * @author msoler18
   * @description Returns overall system health including database and external
   * API connectivity. Status codes:
   * - 200: All systems operational (status: "ok")
   * - 503: System degraded or down (status: "degraded" or "down")
   *
   * @param _req - Express request (unused)
   * @param res - Express response
   * @param next - Express next function for error propagation
   *
   * @remarks
   * Response format:
   * {
   *   status: "ok" | "degraded" | "down",
   *   timestamp: string (ISO 8601),
   *   uptime: number (seconds),
   *   database: { status: "ok" | "error", responseTime?: number, message?: string },
   *   externalApis: { openWeather: { status: "ok" | "error", responseTime?: number, message?: string } }
   * }
   *
   * Errors are caught by error handler middleware and returned as:
   * { success: false, error: { message, code, statusCode } }
   */
  async getHealth(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const healthStatus = await this.healthService.checkHealth();

      const statusCode = healthStatus.status === 'ok' ? 200 : 503;

      res.status(statusCode).json(healthStatus);
    } catch (error: unknown) {
      next(error);
    }
  }
}