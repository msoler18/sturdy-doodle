import axios, { AxiosInstance, AxiosError } from 'axios';

import { logger } from '../../../config/logger.config';
import { Forecast } from '../../../domain/entities/Forecast.entity';
import { IWeatherClient } from '../../../domain/services/IWeatherClient.interface';
import { ExternalApiError } from '../../../shared/errors/ExternalApiError';
import { WeatherResponseAdapter } from '../adapters/WeatherResponseAdapter';

/**
 * Type definition for OpenWeatherMap API response
 */
interface OpenWeatherMapResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    pop: number;
  }>;
}

/**
 * OpenWeatherMap API client implementation.
 * 
 * @author msoler18
 * @description Implements IWeatherClient interface for OpenWeatherMap API.
 * Handles HTTP requests to fetch weather forecasts with proper timeout
 * configuration and error handling. Uses metric units (Celsius) by default.
 */
export class OpenWeatherMapClient implements IWeatherClient {
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor(apiKey: string, baseUrl: string, timeout: number) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('OpenWeatherMapClient initialized', {
      baseUrl,
      timeout,
      hasApiKey: !!this.apiKey,
    });
  }

  async getForecast(city: string, state: string, days: number): Promise<Forecast[]> {
    logger.debug('Fetching forecast from OpenWeatherMap', { city, state, days });

    try {
      const response = await this.client.get<OpenWeatherMapResponse>('/forecast', {
        params: {
          q: `${city},${state},US`,
          appid: this.apiKey,
          units: 'metric',
          cnt: 40,
        },
      });

      logger.info('Successfully fetched forecast from OpenWeatherMap', {
        city,
        state,
        itemsReceived: response.data.list.length,
      });

      const forecasts = WeatherResponseAdapter.toDomain(response.data, city, state, days);

      return forecasts;
    } catch (error) {
      return this.handleApiError(error, city, state);
    }
  }

  /**
   * Handles errors from OpenWeatherMap API requests.
   * 
   * @param error - Error from axios request
   * @param city - City name for context
   * @param state - State name for context
   * @throws ExternalApiError with appropriate message and metadata
   */
  private handleApiError(error: unknown, city: string, state: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Timeout error
      if (axiosError.code === 'ECONNABORTED') {
        logger.error('OpenWeatherMap API timeout', { city, state });
        throw new ExternalApiError(
          'Weather API request timed out',
          'openweathermap',
          408,
          { city, state }
        );
      }

      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;

        logger.error('OpenWeatherMap API error response', {
          status,
          data,
          city,
          state,
        });

        if (status === 401 || status === 403) {
          throw new ExternalApiError(
            'Invalid API key for weather service',
            'openweathermap',
            status,
            data
          );
        }

        if (status === 404) {
          throw new ExternalApiError(
            `Location not found: ${city}, ${state}`,
            'openweathermap',
            status,
            data
          );
        }

        if (status === 429) {
          throw new ExternalApiError(
            'Weather API rate limit exceeded',
            'openweathermap',
            status,
            data
          );
        }

        throw new ExternalApiError(
          `Weather API request failed with status ${status}`,
          'openweathermap',
          status,
          data
        );
      }

      logger.error('OpenWeatherMap network error', {
        message: axiosError.message,
        city,
        state,
      });
      throw new ExternalApiError(
        'Network error while contacting weather service',
        'openweathermap',
        503,
        { city, state, originalError: axiosError.message }
      );
    }

    logger.error('Unexpected error in OpenWeatherMap client', {
      error,
      city,
      state,
    });
    throw new ExternalApiError(
      'Unexpected error while fetching weather data',
      'openweathermap',
      500,
      { city, state }
    );
  }
}