import { Forecast } from '../../../src/domain/entities/Forecast.entity';
import { ForecastMapper } from '../../../src/application/mappers/ForecastMapper';
import { ForecastResponseDTO } from '../../../src/application/dto/ForecastResponse.dto';

describe('ForecastMapper', () => {
  describe('toDTO', () => {
    it('should convert domain entity to DTO with all fields', () => {
      const entity: Forecast = {
        id: 1,
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
        createdAt: new Date('2025-11-24T10:00:00Z'),
        updatedAt: new Date('2025-11-24T10:00:00Z'),
      };

      const dto = ForecastMapper.toDTO(entity);

      expect(dto).toEqual<ForecastResponseDTO>({
        date: '2025-11-25',
        temperature: 18.5,
        feelsLike: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy with light winds',
        precipitationChance: 10,
        humidity: 45,
        windSpeed: 12.5,
        city: 'fresno',
        state: 'california',
      });
    });

    it('should use defaults for optional fields when undefined', () => {
      const entity: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      const dto = ForecastMapper.toDTO(entity);

      expect(dto.feelsLike).toBe(18.5); 
      expect(dto.description).toBe('Clear'); 
      expect(dto.precipitationChance).toBe(0);
      expect(dto.humidity).toBe(0);
      expect(dto.windSpeed).toBe(0);
    });

    it('should format date as ISO string (YYYY-MM-DD)', () => {
      const entity: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25T14:30:00Z'),
        temperature: 20,
        conditions: 'Sunny',
      };

      const dto = ForecastMapper.toDTO(entity);

      expect(dto.date).toBe('2025-11-25');
      expect(dto.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('fromDatabase', () => {
    it('should convert database row to domain entity', () => {
      const row = {
        id: 1,
        city: 'fresno',
        state: 'california',
        forecast_date: '2025-11-25',
        temperature: 18.5,
        feels_like: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy with light winds',
        precipitation_chance: 10,
        humidity: 45,
        wind_speed: 12.5,
        icon_code: '02d',
        created_at: '2025-11-24T10:00:00Z',
        updated_at: '2025-11-24T10:00:00Z',
      };

      const entity = ForecastMapper.fromDatabase(row);

      expect(entity.id).toBe(1);
      expect(entity.city).toBe('fresno');
      expect(entity.state).toBe('california');
      expect(entity.forecastDate).toEqual(new Date('2025-11-25'));
      expect(entity.temperature).toBe(18.5);
      expect(entity.feelsLike).toBe(17.2);
      expect(entity.conditions).toBe('Partly Cloudy');
      expect(entity.description).toBe('Partly cloudy with light winds');
      expect(entity.precipitationChance).toBe(10);
      expect(entity.humidity).toBe(45);
      expect(entity.windSpeed).toBe(12.5);
      expect(entity.iconCode).toBe('02d');
      expect(entity.createdAt).toEqual(new Date('2025-11-24T10:00:00Z'));
      expect(entity.updatedAt).toEqual(new Date('2025-11-24T10:00:00Z'));
    });

    it('should handle optional fields as undefined when null', () => {
      const row = {
        id: 1,
        city: 'fresno',
        state: 'california',
        forecast_date: '2025-11-25',
        temperature: 18.5,
        feels_like: null,
        conditions: 'Clear',
        description: null,
        precipitation_chance: null,
        humidity: null,
        wind_speed: null,
        icon_code: null,
        created_at: null,
        updated_at: null,
      };

      const entity = ForecastMapper.fromDatabase(row);

      expect(entity.feelsLike).toBeUndefined();
      expect(entity.description).toBeUndefined();
      expect(entity.precipitationChance).toBeUndefined();
      expect(entity.humidity).toBeUndefined();
      expect(entity.windSpeed).toBeUndefined();
      expect(entity.iconCode).toBeUndefined();
      expect(entity.createdAt).toBeUndefined();
      expect(entity.updatedAt).toBeUndefined();
    });

    it('should convert string numbers to actual numbers', () => {
      const row = {
        id: 1,
        city: 'fresno',
        state: 'california',
        forecast_date: '2025-11-25',
        temperature: '18.5',
        feels_like: '17.2',
        conditions: 'Clear',
        description: null,
        precipitation_chance: '10',
        humidity: '45',
        wind_speed: '12.5',
        icon_code: null,
        created_at: null,
        updated_at: null,
      };

      const entity = ForecastMapper.fromDatabase(row);

      expect(typeof entity.temperature).toBe('number');
      expect(entity.temperature).toBe(18.5);
      expect(typeof entity.feelsLike).toBe('number');
      expect(entity.feelsLike).toBe(17.2);
    });
  });

  describe('toDatabase', () => {
    it('should convert domain entity to database row object', () => {
      const entity: Forecast = {
        id: 1,
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25T14:30:00Z'),
        temperature: 18.5,
        feelsLike: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy with light winds',
        precipitationChance: 10,
        humidity: 45,
        windSpeed: 12.5,
        iconCode: '02d',
        createdAt: new Date('2025-11-24T10:00:00Z'),
        updatedAt: new Date('2025-11-24T10:00:00Z'),
      };

      const row = ForecastMapper.toDatabase(entity);

      expect(row).toEqual({
        city: 'fresno',
        state: 'california',
        forecast_date: '2025-11-25',
        temperature: 18.5,
        feels_like: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy with light winds',
        precipitation_chance: 10,
        humidity: 45,
        wind_speed: 12.5,
        icon_code: '02d',
      });
    });

    it('should omit id, createdAt, and updatedAt fields', () => {
      const entity: Forecast = {
        id: 999, 
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
        createdAt: new Date(), 
        updatedAt: new Date(), 
      };

      const row = ForecastMapper.toDatabase(entity) as Record<string, unknown>;

      expect(row).not.toHaveProperty('id');
      expect(row).not.toHaveProperty('created_at');
      expect(row).not.toHaveProperty('updated_at');
    });

    it('should convert optional undefined fields to null', () => {
      const entity: Forecast = {
        city: 'fresno',
        state: 'california',
        forecastDate: new Date('2025-11-25'),
        temperature: 18.5,
        conditions: 'Clear',
      };

      const row = ForecastMapper.toDatabase(entity) as Record<string, unknown>;

      expect(row.feels_like).toBeNull();
      expect(row.description).toBeNull();
      expect(row.precipitation_chance).toBeNull();
      expect(row.humidity).toBeNull();
      expect(row.wind_speed).toBeNull();
      expect(row.icon_code).toBeNull();
    });
  });

  describe('fromDatabaseArray', () => {
    it('should convert array of rows to array of entities', () => {
      const rows = [
        {
          id: 1,
          city: 'fresno',
          state: 'california',
          forecast_date: '2025-11-25',
          temperature: 18.5,
          feels_like: 17.2,
          conditions: 'Clear',
          description: null,
          precipitation_chance: 10,
          humidity: 45,
          wind_speed: 12.5,
          icon_code: null,
          created_at: null,
          updated_at: null,
        },
        {
          id: 2,
          city: 'fresno',
          state: 'california',
          forecast_date: '2025-11-26',
          temperature: 20.0,
          feels_like: 19.5,
          conditions: 'Sunny',
          description: null,
          precipitation_chance: 0,
          humidity: 40,
          wind_speed: 10.0,
          icon_code: null,
          created_at: null,
          updated_at: null,
        },
      ];

      const entities = ForecastMapper.fromDatabaseArray(rows);

      expect(entities).toHaveLength(2);
      expect(entities[0].city).toBe('fresno');
      expect(entities[0].forecastDate).toEqual(new Date('2025-11-25'));
      expect(entities[1].forecastDate).toEqual(new Date('2025-11-26'));
    });

    it('should return empty array for empty input', () => {
      const entities = ForecastMapper.fromDatabaseArray([]);

      expect(entities).toEqual([]);
    });
  });

  describe('toDTOArray', () => {
    it('should convert array of entities to array of DTOs', () => {
      const entities: Forecast[] = [
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

      const dtos = ForecastMapper.toDTOArray(entities);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].date).toBe('2025-11-25');
      expect(dtos[0].temperature).toBe(18.5);
      expect(dtos[1].date).toBe('2025-11-26');
      expect(dtos[1].temperature).toBe(20.0);
    });

    it('should return empty array for empty input', () => {
      const dtos = ForecastMapper.toDTOArray([]);

      expect(dtos).toEqual([]);
    });
  });
});