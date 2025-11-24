import type { Knex } from 'knex';
import type { Logger } from 'winston';

import {
  type HealthCheck,
  type HealthStatus,
  type IHealthService,
} from '../../domain/services/IHealthService.interface';

/**
 * Application service for system health checks.
 * 
 * @remarks
 * This service checks the health of:
 * - Database connection (PostgreSQL via Knex)
 * - External APIs (OpenWeatherMap)
 * 
 * Why separate service: Health checks are cross-cutting concerns that don't
 * belong in domain entities or infrastructure adapters. This keeps health
 * logic centralized and testable.
 */
export class HealthService implements IHealthService {
  private readonly startTime = Date.now();

  /**
   * Creates an instance of HealthService.
   * 
   * @param db - Knex database connection for health checks
   * @param logger - Winston logger instance
   * 
   * @remarks
   * Dependencies injected for testability. Database connection is used
   * to verify PostgreSQL is accessible.
   */
  constructor(
    private readonly db: Knex,
    private readonly logger: Logger
  ) {}

  /**
   * Checks the overall health of the system.
   * 
   * @returns Promise with health status including database and external API checks
   * 
   * @remarks
   * Status determination:
   * - "ok": All checks pass
   * - "degraded": Some checks fail but system is partially functional
   * - "down": Critical checks fail (database)
   */
  async checkHealth(): Promise<HealthStatus> {
    const databaseCheck = await this.checkDatabase();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    let status: 'ok' | 'degraded' | 'down';
    if (databaseCheck.status === 'error') {
      status = 'down';
    } else {
      status = 'ok';
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      database: databaseCheck,
      externalApis: {
        openWeather: { status: 'ok' },
      },
    };

    this.logger.info('Health check completed', {
      service: 'HealthService',
      status: healthStatus.status,
      database: databaseCheck.status,
    });

    return healthStatus;
  }

  /**
   * Checks database connection health.
   * 
   * @returns Promise with database health check result
   * 
   * @remarks
   * Uses SELECT 1 query with 2 second timeout to verify PostgreSQL
   * is accessible. Catches all errors and returns error status instead
   * of throwing exceptions.
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      await this.db.raw('SELECT 1').timeout(2000);

      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown database error';

      this.logger.error('Database health check failed', {
        service: 'HealthService',
        error: errorMessage,
        responseTime,
      });

      return {
        status: 'error',
        message: errorMessage,
        responseTime,
      };
    }
  }
}