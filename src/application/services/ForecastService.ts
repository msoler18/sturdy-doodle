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
    private readonly forecastRepository: IForecastRepository,
    private readonly weatherClient: IWeatherClient,
    private readonly logger: Logger
  ) {
    this.logger.info('ForecastService initialized', {
      service: 'ForecastService',
      repository: forecastRepository.constructor.name,
      weatherClient: weatherClient.constructor.name,
    });
  }

  /**
   * Get forecast data using cache-first strategy.
   * 
   * @param city - City name (will be normalized to lowercase)
   * @param state - State name (will be normalized to lowercase)
   * @param date - Optional specific date for cached forecast lookup
   * @returns Array of Forecast entities (1 if date specified, 3 if not)
   * 
   * @remarks
   * Cache-First Strategy:
   * 1. If date is provided → Check database first (cache hit/miss)
   * 2. If cache miss or no date → Call external weather API
   * 3. Never auto-save API responses (explicit POST /forecast required)
   * 
   * Why this approach:
   * - Reduces external API calls (cost optimization)
   * - Faster response for cached data
   * - Explicit control over what gets persisted
   * - Better observability with structured logging
   * 
   * @throws {DatabaseError} If database query fails
   * @throws {ExternalApiError} If weather API call fails
   */
  async getForecast(
    city: string,
    state: string,
    date?: Date
  ): Promise<Forecast[]> {
    const normalizedCity = city.toLowerCase().trim();
    const normalizedState = state.toLowerCase().trim();

    if (date) {
      this.logger.info('Checking cache for specific date', {
        city: normalizedCity,
        state: normalizedState,
        date: date.toISOString(),
      });

      const cachedForecast = await this.forecastRepository.findByLocationAndDate(
        normalizedCity,
        normalizedState,
        date
      );

      if (cachedForecast) {
        this.logger.info('Cache HIT - Returning cached forecast', {
          city: normalizedCity,
          state: normalizedState,
          date: date.toISOString(),
          forecastId: cachedForecast.id,
        });

        return [cachedForecast];
      }

      this.logger.info('Cache MISS - Forecast not found in database', {
        city: normalizedCity,
        state: normalizedState,
        date: date.toISOString(),
      });
    }

    this.logger.info('Fetching forecast from external API', {
      city: normalizedCity,
      state: normalizedState,
      reason: date ? 'cache_miss' : 'no_date_specified',
    });

    const forecasts = await this.weatherClient.getForecast(
      normalizedCity,
      normalizedState,
      3
    );

    this.logger.info('Successfully fetched forecast from external API', {
      city: normalizedCity,
      state: normalizedState,
      forecastCount: forecasts.length,
    });

    if (date) {
      const dateString = date.toISOString().split('T')[0];
      const matchingForecast = forecasts.find(
        (f: Forecast) => f.forecastDate.toISOString().split('T')[0] === dateString
      );

      if (matchingForecast) {
        return [matchingForecast];
      }

      this.logger.warn('Requested date not found in API response', {
        city: normalizedCity,
        state: normalizedState,
        requestedDate: dateString,
        availableDates: forecasts.map((f: Forecast) =>
          f.forecastDate.toISOString().split('T')[0]
        ),
      });

      return [];
    }

    return forecasts;
  }
}