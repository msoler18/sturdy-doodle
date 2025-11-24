import { Logger } from 'winston';

import { Forecast } from '../../../src/domain/entities/Forecast.entity';
import { IForecastRepository } from '../../../src/domain/repositories/IForecastRepository.interface';
import { IWeatherClient } from '../../../src/domain/services/IWeatherClient.interface';
import { ForecastService } from '../../../src/application/services/ForecastService';

describe('ForecastService', () => {
  let service: ForecastService;
  let mockRepository: jest.Mocked<IForecastRepository>;
  let mockWeatherClient: jest.Mocked<IWeatherClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRepository = {
      findByLocationAndDate: jest.fn(),
      findByLocation: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
    } as jest.Mocked<IForecastRepository>;

    mockWeatherClient = {
      getForecast: jest.fn(),
    } as jest.Mocked<IWeatherClient>;

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    service = new ForecastService(
      mockRepository,
      mockWeatherClient,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize service and log initialization', () => {
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ForecastService initialized',
        expect.objectContaining({
          service: 'ForecastService',
        })
      );
    });
  });

  describe('getForecast', () => {
    describe('with date specified (cache-first strategy)', () => {
      it('should return cached forecast when found in database (cache HIT)', async () => {
        const date = new Date('2025-11-25');
        const cachedForecast: Forecast = {
          id: 1,
          city: 'fresno',
          state: 'california',
          forecastDate: date,
          temperature: 18.5,
          conditions: 'Clear',
        };

        mockRepository.findByLocationAndDate.mockResolvedValue(cachedForecast);

        const result = await service.getForecast('Fresno', 'California', date);

        expect(result).toEqual([cachedForecast]);
        expect(mockRepository.findByLocationAndDate).toHaveBeenCalledWith(
          'fresno',
          'california',
          date
        );
        expect(mockWeatherClient.getForecast).not.toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Cache HIT - Returning cached forecast',
          expect.objectContaining({
            city: 'fresno',
            state: 'california',
          })
        );
      });

      it('should fetch from API when not in cache (cache MISS)', async () => {
        const date = new Date('2025-11-25');
        const apiForecasts: Forecast[] = [
          {
            city: 'fresno',
            state: 'california',
            forecastDate: new Date('2025-11-25'),
            temperature: 18.5,
            conditions: 'Clear',
          },
          {
            city: 'fresno',
            state: 'california',
            forecastDate: new Date('2025-11-26'),
            temperature: 20.0,
            conditions: 'Sunny',
          },
        ];

        mockRepository.findByLocationAndDate.mockResolvedValue(null);
        mockWeatherClient.getForecast.mockResolvedValue(apiForecasts);

        const result = await service.getForecast('Fresno', 'California', date);

        expect(result).toHaveLength(1);
        expect(result[0].forecastDate).toEqual(new Date('2025-11-25'));
        expect(mockRepository.findByLocationAndDate).toHaveBeenCalledWith(
          'fresno',
          'california',
          date
        );
        expect(mockWeatherClient.getForecast).toHaveBeenCalledWith(
          'fresno',
          'california',
          3
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Cache MISS - Forecast not found in database',
          expect.objectContaining({
            city: 'fresno',
            state: 'california',
          })
        );
      });

      it('should return empty array if requested date not in API response', async () => {
        const requestedDate = new Date('2025-12-01');
        const apiForecasts: Forecast[] = [
          {
            city: 'fresno',
            state: 'california',
            forecastDate: new Date('2025-11-25'),
            temperature: 18.5,
            conditions: 'Clear',
          },
        ];

        mockRepository.findByLocationAndDate.mockResolvedValue(null);
        mockWeatherClient.getForecast.mockResolvedValue(apiForecasts);

        const result = await service.getForecast(
          'Fresno',
          'California',
          requestedDate
        );

        expect(result).toEqual([]);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Requested date not found in API response',
          expect.objectContaining({
            requestedDate: '2025-12-01',
          })
        );
      });
    });

    describe('without date specified (API fetch)', () => {
      it('should fetch 3-day forecast from API directly', async () => {
        const apiForecasts: Forecast[] = [
          {
            city: 'fresno',
            state: 'california',
            forecastDate: new Date('2025-11-25'),
            temperature: 18.5,
            conditions: 'Clear',
          },
          {
            city: 'fresno',
            state: 'california',
            forecastDate: new Date('2025-11-26'),
            temperature: 20.0,
            conditions: 'Sunny',
          },
          {
            city: 'fresno',
            state: 'california',
            forecastDate: new Date('2025-11-27'),
            temperature: 19.0,
            conditions: 'Cloudy',
          },
        ];

        mockWeatherClient.getForecast.mockResolvedValue(apiForecasts);

        const result = await service.getForecast('Fresno', 'California');

        expect(result).toEqual(apiForecasts);
        expect(result).toHaveLength(3);
        expect(mockRepository.findByLocationAndDate).not.toHaveBeenCalled();
        expect(mockWeatherClient.getForecast).toHaveBeenCalledWith(
          'fresno',
          'california',
          3
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Fetching forecast from external API',
          expect.objectContaining({
            reason: 'no_date_specified',
          })
        );
      });
    });

    describe('input normalization', () => {
      it('should normalize city and state to lowercase', async () => {
        mockWeatherClient.getForecast.mockResolvedValue([]);

        await service.getForecast('FRESNO', 'CALIFORNIA');

        expect(mockWeatherClient.getForecast).toHaveBeenCalledWith(
          'fresno',
          'california',
          3
        );
      });

      it('should trim whitespace from city and state', async () => {
        mockWeatherClient.getForecast.mockResolvedValue([]);

        await service.getForecast('  Fresno  ', '  California  ');

        expect(mockWeatherClient.getForecast).toHaveBeenCalledWith(
          'fresno',
          'california',
          3
        );
      });
    });

    describe('error handling', () => {
      it('should propagate repository errors', async () => {
        const date = new Date('2025-11-25');
        const dbError = new Error('Database connection failed');
        mockRepository.findByLocationAndDate.mockRejectedValue(dbError);

        await expect(
          service.getForecast('fresno', 'california', date)
        ).rejects.toThrow('Database connection failed');
      });

      it('should propagate weather client errors', async () => {
        const apiError = new Error('API rate limit exceeded');
        mockWeatherClient.getForecast.mockRejectedValue(apiError);

        await expect(
          service.getForecast('fresno', 'california')
        ).rejects.toThrow('API rate limit exceeded');
      });
    });

    describe('logging', () => {
      it('should log all major operations', async () => {
        const date = new Date('2025-11-25');
        mockRepository.findByLocationAndDate.mockResolvedValue(null);
        mockWeatherClient.getForecast.mockResolvedValue([
          {
            city: 'fresno',
            state: 'california',
            forecastDate: date,
            temperature: 18.5,
            conditions: 'Clear',
          },
        ]);

        await service.getForecast('Fresno', 'California', date);

        expect(mockLogger.info).toHaveBeenCalledWith(
          'Checking cache for specific date',
          expect.any(Object)
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Cache MISS - Forecast not found in database',
          expect.any(Object)
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Fetching forecast from external API',
          expect.any(Object)
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Successfully fetched forecast from external API',
          expect.any(Object)
        );
      });
    });
  });

  describe('saveForecast', () => {
    it('should save forecast via repository', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      const savedForecast: Forecast = {
        ...forecast,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.save.mockResolvedValue(savedForecast);

      await service.saveForecast(forecast);

      expect(mockRepository.save).toHaveBeenCalledWith(forecast);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should log save operation', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      const savedForecast: Forecast = {
        ...forecast,
        id: 1,
      };

      mockRepository.save.mockResolvedValue(savedForecast);

      await service.saveForecast(forecast);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Saving forecast to database',
        expect.objectContaining({
          city: 'fresno',
          state: 'california',
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully saved forecast to database',
        expect.objectContaining({
          city: 'fresno',
          state: 'california',
        })
      );
    });

    it('should propagate repository save errors', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      const dbError = new Error('Database write failed');
      mockRepository.save.mockRejectedValue(dbError);

      await expect(service.saveForecast(forecast)).rejects.toThrow(
        'Database write failed'
      );
    });
  });
});