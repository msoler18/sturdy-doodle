import { Knex } from 'knex';

import { Forecast } from '../../../src/domain/entities/Forecast.entity';
import { ForecastRepository } from '../../../src/infrastructure/database/repositories/ForecastRepository';
import { createTestDb, cleanDatabase } from '../../setup/test-db';

describe('ForecastRepository', () => {
  let db: Knex;
  let repository: ForecastRepository;

  beforeAll(async () => {
    db = createTestDb();
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.migrate.rollback();
    await db.destroy();
  });

  beforeEach(async () => {
    await cleanDatabase(db);
    repository = new ForecastRepository(db);
  });

  describe('findByLocationAndDate', () => {
    it('should return forecast when found', async () => {
      const forecast: Forecast = {
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
      };

      await repository.save(forecast);

      const result = await repository.findByLocationAndDate(
        'fresno',
        'california',
        new Date('2025-11-25')
      );

      expect(result).not.toBeNull();
      expect(result?.city).toBe('fresno');
      expect(result?.state).toBe('california');
      expect(result?.forecastDate).toEqual(new Date('2025-11-25'));
      expect(result?.temperature).toBe(18.5);
    });

    it('should return null when forecast not found', async () => {
      const result = await repository.findByLocationAndDate(
        'nonexistent',
        'state',
        new Date('2025-11-25')
      );

      expect(result).toBeNull();
    });

    it('should normalize city and state to lowercase', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        feelsLike: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy',
        precipitationChance: 10,
        humidity: 45,
        windSpeed: 12.5,
        iconCode: '02d',
      };

      await repository.save(forecast);

      const result = await repository.findByLocationAndDate(
        'FRESNO',
        'CALIFORNIA',
        new Date('2025-11-25')
      );

      expect(result).not.toBeNull();
      expect(result?.city).toBe('fresno');
      expect(result?.state).toBe('california');
    });

    it('should handle optional fields correctly', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
        // Optional fields omitted
      };

      await repository.save(forecast);

      const result = await repository.findByLocationAndDate(
        'fresno',
        'california',
        new Date('2025-11-25')
      );

      expect(result).not.toBeNull();
      expect(result?.feelsLike).toBeUndefined();
      expect(result?.description).toBeUndefined();
      expect(result?.precipitationChance).toBeUndefined();
      expect(result?.humidity).toBeUndefined();
      expect(result?.windSpeed).toBeUndefined();
      expect(result?.iconCode).toBeUndefined();
    });
  });

  describe('findByLocation', () => {
    it('should return all forecasts for a location ordered by date', async () => {
      const forecasts: Forecast[] = [
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
          conditions: 'Partly Cloudy',
        },
        {
          city: 'fresno',
          state: 'california',
          forecastDate: new Date('2025-11-27'),
          temperature: 19.5,
          conditions: 'Cloudy',
        },
      ];

      await repository.saveMany(forecasts);

      const results = await repository.findByLocation('fresno', 'california');

      expect(results).toHaveLength(3);
      expect(results[0].forecastDate).toEqual(new Date('2025-11-25'));
      expect(results[1].forecastDate).toEqual(new Date('2025-11-26'));
      expect(results[2].forecastDate).toEqual(new Date('2025-11-27'));
    });

    it('should return empty array when no forecasts found', async () => {
      const results = await repository.findByLocation('nonexistent', 'state');

      expect(results).toEqual([]);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should only return forecasts for the specified location', async () => {
      const fresnoForecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      const sfForecast: Forecast = {
        city: 'san francisco',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 15.0,
        conditions: 'Foggy',
      };

      await repository.save(fresnoForecast);
      await repository.save(sfForecast);

      const results = await repository.findByLocation('fresno', 'california');

      expect(results).toHaveLength(1);
      expect(results[0].city).toBe('fresno');
      expect(results[0].temperature).toBe(18.5);
    });

    it('should normalize city and state to lowercase', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      await repository.save(forecast);

      const results = await repository.findByLocation('FRESNO', 'CALIFORNIA');

      expect(results).toHaveLength(1);
      expect(results[0].city).toBe('fresno');
      expect(results[0].state).toBe('california');
    });
  });

  describe('save', () => {
    it('should save forecast and return it with generated ID', async () => {
      const forecast: Forecast = {
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
      };

      const saved = await repository.save(forecast);

      expect(saved).toHaveProperty('id');
      expect(typeof saved.id).toBe('number');
      expect(saved.city).toBe('fresno');
      expect(saved.state).toBe('california');
      expect(saved.temperature).toBe(18.5);
      expect(saved.createdAt).toBeDefined();
      expect(saved.updatedAt).toBeDefined();
    });

    it('should update existing forecast on conflict (upsert)', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      const firstSave = await repository.save(forecast);
      const firstId = firstSave.id;

      const updatedForecast: Forecast = {
        ...forecast,
        temperature: 20.0,
      };

      const secondSave = await repository.save(updatedForecast);

      expect(secondSave.id).toBe(firstId); // Same ID
      expect(secondSave.temperature).toBe(20.0); // Updated value
      expect(secondSave.updatedAt).not.toEqual(firstSave.updatedAt); // Updated timestamp
    });

    it('should normalize city and state to lowercase when saving', async () => {
      const forecast: Forecast = {
        city: 'FRESNO',
        state: 'CALIFORNIA',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      const saved = await repository.save(forecast);

      expect(saved.city).toBe('fresno');
      expect(saved.state).toBe('california');
    });

    it('should handle optional fields correctly', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      const saved = await repository.save(forecast);

      expect(saved.temperature).toBe(18.5);
      expect(saved.feelsLike).toBeUndefined();
      expect(saved.description).toBeUndefined();
    });

  });

  describe('saveMany', () => {
    it('should save multiple forecasts in a single transaction', async () => {
      const forecasts: Forecast[] = [
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
          conditions: 'Partly Cloudy',
        },
        {
          city: 'fresno',
          state: 'california',
          forecastDate: new Date('2025-11-27'),
          temperature: 19.5,
          conditions: 'Cloudy',
        },
      ];

      const saved = await repository.saveMany(forecasts);

      expect(saved).toHaveLength(3);
      saved.forEach((forecast) => {
        expect(forecast).toHaveProperty('id');
        expect(forecast.city).toBe('fresno');
        expect(forecast.state).toBe('california');
      });

      const allForecasts = await repository.findByLocation('fresno', 'california');
      expect(allForecasts).toHaveLength(3);
    });

    it('should handle upsert for existing forecasts in batch', async () => {
      const initialForecasts: Forecast[] = [
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
          conditions: 'Partly Cloudy',
        },
      ];

      await repository.saveMany(initialForecasts);

      const updatedForecasts: Forecast[] = [
        {
          city: 'fresno',
          state: 'california',
          forecastDate: new Date('2025-11-25'),
          temperature: 19.0,
          conditions: 'Clear',
        },
        {
          city: 'fresno',
          state: 'california',
          forecastDate: new Date('2025-11-27'),
          temperature: 21.0,
          conditions: 'Sunny',
        },
      ];

      const saved = await repository.saveMany(updatedForecasts);

      expect(saved).toHaveLength(2);

      const allForecasts = await repository.findByLocation('fresno', 'california');
      expect(allForecasts).toHaveLength(3);
      expect(allForecasts[0].temperature).toBe(19.0);
    });

    it('should return empty array when saving empty array', async () => {
      const saved = await repository.saveMany([]);

      expect(saved).toEqual([]);
      expect(Array.isArray(saved)).toBe(true);
    });

  });

  describe('data mapping', () => {
    it('should correctly map snake_case to camelCase', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        feelsLike: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy',
        precipitationChance: 10,
        humidity: 45,
        windSpeed: 12.5,
        iconCode: '02d',
      };

      await repository.save(forecast);
      const retrieved = await repository.findByLocationAndDate(
        'fresno',
        'california',
        new Date('2025-11-25')
      );

      expect(retrieved).not.toBeNull();
      expect(retrieved?.forecastDate).toBeInstanceOf(Date);
      expect(retrieved?.temperature).toBe(18.5);
      expect(retrieved?.feelsLike).toBe(17.2);
      expect(retrieved?.precipitationChance).toBe(10);
      expect(retrieved?.windSpeed).toBe(12.5);
    });

    it('should handle decimal precision correctly', async () => {
      const forecast: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.567,
        feelsLike: 17.234,
        windSpeed: 12.456,
        conditions: 'Clear',
      };

      await repository.save(forecast);
      const retrieved = await repository.findByLocationAndDate(
        'fresno',
        'california',
        new Date('2025-11-25')
      );

      expect(retrieved).not.toBeNull();
      expect(retrieved?.temperature).toBeCloseTo(18.567, 2);
      expect(retrieved?.feelsLike).toBeCloseTo(17.234, 2);
      expect(retrieved?.windSpeed).toBeCloseTo(12.456, 2);
    });
  });
});