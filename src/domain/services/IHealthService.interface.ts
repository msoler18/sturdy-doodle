/**
 * Interface for health check service.
 * Defines contract for checking system health including database and external APIs.
 * 
 * @interface IHealthService
 * @author msoler18
 */
export interface IHealthService {
  /**
   * Checks the overall health of the system including database and external APIs.
   * 
   * @returns Promise with health status including uptime, database, and external API checks
   */
  checkHealth(): Promise<HealthStatus>;
}

/**
 * Overall health status of the system.
 */
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  database: HealthCheck;
  externalApis: {
    openWeather: HealthCheck;
  };
}

/**
 * Individual health check result.
 */
export interface HealthCheck {
  status: 'ok' | 'error';
  message?: string;
  responseTime?: number;
}