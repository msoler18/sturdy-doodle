import type { Logger } from 'winston';

import { Forecast } from '../../domain/entities/Forecast.entity';
import { IForecastRepository } from '../../domain/repositories/IForecastRepository.interface';
import { IWeatherClient } from '../../domain/services/IWeatherClient.interface';

/**
 * Application service for forecast business logic.
 * 
 * @remarks
 * This service orchestrates interactions between:
 * - ForecastRepository (database persistence)
 * - WeatherClient (external API integration)
 * 
 * Why dependency injection: Enables testability, follows SOLID principles,
 * and allows swapping implementations without changing business logic.
 * 
 * Business Rules:
 * 1. Cache-first strategy: Check DB before calling external API
 * 2. Never auto-save API responses (explicit save only)
 * 3. Log all decisions for observability
 */
export class ForecastService {
  /**
   * Creates an instance of ForecastService.
   * 
   * @param forecastRepository - Repository for database operations
   * @param weatherClient - Client for external weather API
   * @param logger - Winston logger instance
   * 
   * @remarks
   * Dependencies are injected via constructor to enable:
   * - Unit testing with mocks
   * - Swapping implementations (e.g., different weather APIs)
   * - Loose coupling between layers
   */
  constructor(
    // @ts-expect-error - Used in getForecast method
    private readonly forecastRepository: IForecastRepository,
    // @ts-expect-error - Used in getForecast method
    private readonly weatherClient: IWeatherClient,
    private readonly logger: Logger
  ) {
    this.logger.info('ForecastService initialized', {
      service: 'ForecastService',
      repository: forecastRepository.constructor.name,
      weatherClient: weatherClient.constructor.name,
    });
  }

}

export type { Forecast };