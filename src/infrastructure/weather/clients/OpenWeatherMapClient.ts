import axios, { AxiosInstance } from 'axios';

import { logger } from '../../../config/logger.config';
import { Forecast } from '../../../domain/entities/Forecast.entity';
import { IWeatherClient } from '../../../domain/services/IWeatherClient.interface';

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

  getForecast(city: string, state: string, days: number): Promise<Forecast[]> {
    logger.debug('getForecast called', { 
      city, 
      state, 
      days,
      clientConfigured: !!this.client 
    });
    throw new Error('Not implemented yet');
  }
}