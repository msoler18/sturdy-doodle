import axios, { AxiosError, AxiosInstance } from 'axios';

import { logger } from '../../../src/config/logger.config';
import { Forecast } from '../../../src/domain/entities/Forecast.entity';
import { OpenWeatherMapClient } from '../../../src/infrastructure/weather/clients/OpenWeatherMapClient';
import { ExternalApiError } from '../../../src/shared/errors/ExternalApiError';
import { WeatherResponseAdapter } from '../../../src/infrastructure/weather/adapters/WeatherResponseAdapter';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../../src/config/logger.config', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../../src/infrastructure/weather/adapters/WeatherResponseAdapter');

describe('OpenWeatherMapClient', () => {
  let client: OpenWeatherMapClient;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;
  const apiKey = 'test-api-key';
  const baseUrl = 'https://api.openweathermap.org/data/2.5';
  const timeout = 5000;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      get: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);

    client = new OpenWeatherMapClient(apiKey, baseUrl, timeout);
  });

  describe('constructor', () => {
    it('should initialize client with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
        timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(logger.info).toHaveBeenCalledWith(
        'OpenWeatherMapClient initialized',
        expect.objectContaining({
          baseUrl,
          timeout,
          hasApiKey: true,
        })
      );
    });
  });

  describe('getForecast', () => {
    const city = 'fresno';
    const state = 'california';
    const days = 3;

    const mockApiResponse = {
      list: [
        {
          dt: Math.floor(new Date('2025-11-25T12:00:00Z').getTime() / 1000),
          main: {
            temp: 18.5,
            feels_like: 17.2,
            humidity: 45,
          },
          weather: [
            {
              main: 'Partly Cloudy',
              description: 'Partly cloudy with light winds',
              icon: '02d',
            },
          ],
          wind: {
            speed: 12.5,
          },
          pop: 0.1,
        },
        {
          dt: Math.floor(new Date('2025-11-26T12:00:00Z').getTime() / 1000),
          main: {
            temp: 20.0,
            feels_like: 19.0,
            humidity: 50,
          },
          weather: [
            {
              main: 'Clear',
              description: 'Clear sky',
              icon: '01d',
            },
          ],
          wind: {
            speed: 10.0,
          },
          pop: 0.0,
        },
        {
          dt: Math.floor(new Date('2025-11-27T12:00:00Z').getTime() / 1000),
          main: {
            temp: 19.5,
            feels_like: 18.5,
            humidity: 48,
          },
          weather: [
            {
              main: 'Cloudy',
              description: 'Overcast clouds',
              icon: '04d',
            },
          ],
          wind: {
            speed: 11.0,
          },
          pop: 0.2,
        },
      ],
    };

    const mockForecasts: Forecast[] = [
      {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        feelsLike: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy with light winds',
        precipitationChance: 10,
        humidity: 45,
        windSpeed: 12.5,
        iconCode: '02d',
      },
    ];

    it('should successfully fetch and return forecasts', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

      (WeatherResponseAdapter.toDomain as jest.Mock).mockReturnValue(mockForecasts);

      const result = await client.getForecast(city, state, days);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/forecast', {
        params: {
          q: `${city},${state},US`,
          appid: apiKey,
          units: 'metric',
          cnt: 40,
        },
      });

      expect(WeatherResponseAdapter.toDomain).toHaveBeenCalledWith(
        mockApiResponse,
        city,
        state,
        days
      );

      expect(result).toEqual(mockForecasts);
      expect(logger.debug).toHaveBeenCalledWith(
        'Fetching forecast from OpenWeatherMap',
        { city, state, days }
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Successfully fetched forecast from OpenWeatherMap',
        expect.objectContaining({
          city,
          state,
          itemsReceived: mockApiResponse.list.length,
        })
      );
    });

    it('should throw ExternalApiError on 401 Unauthorized', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Invalid API key' },
        },
        config: {},
        name: 'AxiosError',
        message: 'Request failed with status code 401',
      } as AxiosError;

      mockAxiosInstance.get.mockRejectedValue(axiosError);
      (mockedAxios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await expect(client.getForecast(city, state, days)).rejects.toThrow(ExternalApiError);

      await expect(client.getForecast(city, state, days)).rejects.toThrow(
        'Invalid API key for weather service'
      );

      const error = await client.getForecast(city, state, days).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ExternalApiError);
      expect(error.provider).toBe('openweathermap');
      expect(error.statusCode).toBe(401);
      expect(error.apiResponse).toEqual({ message: 'Invalid API key' });
    });

    it('should throw ExternalApiError on 403 Forbidden', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 403,
          data: { message: 'Access forbidden' },
        },
        config: {},
        name: 'AxiosError',
        message: 'Request failed with status code 403',
      } as AxiosError;

      mockAxiosInstance.get.mockRejectedValue(axiosError);
      (mockedAxios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await expect(client.getForecast(city, state, days)).rejects.toThrow(ExternalApiError);

      const error = await client.getForecast(city, state, days).catch((e: unknown) => e);
      expect(error.statusCode).toBe(403);
      expect(error.provider).toBe('openweathermap');
    });

    it('should throw ExternalApiError on 404 Not Found', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'city not found' },
        },
        config: {},
        name: 'AxiosError',
        message: 'Request failed with status code 404',
      } as AxiosError;

      mockAxiosInstance.get.mockRejectedValue(axiosError);
      (mockedAxios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await expect(client.getForecast(city, state, days)).rejects.toThrow(ExternalApiError);

      const error = await client.getForecast(city, state, days).catch((e: unknown) => e);
      expect(error.statusCode).toBe(404);
      expect(error.provider).toBe('openweathermap');
      expect(error.message).toContain(`Location not found: ${city}, ${state}`);
    });

    it('should throw ExternalApiError on 429 Rate Limit', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 429,
          data: { message: 'API rate limit exceeded' },
        },
        config: {},
        name: 'AxiosError',
        message: 'Request failed with status code 429',
      } as AxiosError;

      mockAxiosInstance.get.mockRejectedValue(axiosError);
      (mockedAxios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await expect(client.getForecast(city, state, days)).rejects.toThrow(ExternalApiError);

      const error = await client.getForecast(city, state, days).catch((e: unknown) => e);
      expect(error.statusCode).toBe(429);
      expect(error.provider).toBe('openweathermap');
      expect(error.message).toContain('Weather API rate limit exceeded');
    });

    it('should throw ExternalApiError on timeout', async () => {
      const axiosError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
        config: {},
        name: 'AxiosError',
      } as AxiosError;

      mockAxiosInstance.get.mockRejectedValue(axiosError);
      (mockedAxios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await expect(client.getForecast(city, state, days)).rejects.toThrow(ExternalApiError);

      const error = await client.getForecast(city, state, days).catch((e: unknown) => e);
      expect(error.statusCode).toBe(408);
      expect(error.provider).toBe('openweathermap');
      expect(error.message).toContain('Weather API request timed out');

      expect(logger.error).toHaveBeenCalledWith(
        'OpenWeatherMap API timeout',
        { city, state }
      );
    });

    it('should throw ExternalApiError on network error', async () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Network Error',
        config: {},
        name: 'AxiosError',
      } as AxiosError;

      mockAxiosInstance.get.mockRejectedValue(axiosError);
      (mockedAxios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await expect(client.getForecast(city, state, days)).rejects.toThrow(ExternalApiError);

      const error = await client.getForecast(city, state, days).catch((e: unknown) => e);
      expect(error.statusCode).toBe(503);
      expect(error.provider).toBe('openweathermap');
      expect(error.message).toContain('Network error while contacting weather service');

      expect(logger.error).toHaveBeenCalledWith(
        'OpenWeatherMap network error',
        expect.objectContaining({
          message: 'Network Error',
          city,
          state,
        })
      );
    });

    it('should throw ExternalApiError on unexpected error', async () => {
      const unexpectedError = new Error('Unexpected error');

      mockAxiosInstance.get.mockRejectedValue(unexpectedError);
      (mockedAxios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(false);

      await expect(client.getForecast(city, state, days)).rejects.toThrow(ExternalApiError);

      const error = await client.getForecast(city, state, days).catch((e: unknown) => e);
      expect(error.statusCode).toBe(500);
      expect(error.provider).toBe('openweathermap');
      expect(error.message).toContain('Unexpected error while fetching weather data');

      expect(logger.error).toHaveBeenCalledWith(
        'Unexpected error in OpenWeatherMap client',
        expect.objectContaining({
          error: unexpectedError,
          city,
          state,
        })
      );
    });

    it('should throw ExternalApiError on other HTTP status codes', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
        config: {},
        name: 'AxiosError',
        message: 'Request failed with status code 500',
      } as AxiosError;

      mockAxiosInstance.get.mockRejectedValue(axiosError);
      (mockedAxios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await expect(client.getForecast(city, state, days)).rejects.toThrow(ExternalApiError);

      const error = await client.getForecast(city, state, days).catch((e: unknown) => e);
      expect(error.statusCode).toBe(500);
      expect(error.provider).toBe('openweathermap');
      expect(error.message).toContain('Weather API request failed with status 500');
    });
  });
});