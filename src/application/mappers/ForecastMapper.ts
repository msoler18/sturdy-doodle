import { Forecast } from '../../domain/entities/Forecast.entity';
import { ForecastResponseDTO } from '../dto/ForecastResponse.dto';

/**
 * Type representing a database row from the forecasts table.
 * 
 * @remarks
 * Uses snake_case to match PostgreSQL naming convention.
 * This type enforces type safety when converting from database to domain layer.
 */
interface ForecastDatabaseRow {
  id: number;
  city: string;
  state: string;
  forecast_date: string | Date;
  temperature: number | string;
  feels_like?: number | string | null;
  conditions: string;
  description?: string | null;
  precipitation_chance?: number | string | null;
  humidity?: number | string | null;
  wind_speed?: number | string | null;
  icon_code?: string | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
}

/**
 * Mapper for converting between Domain entities, DTOs, and Database rows.
 * 
 * @remarks
 * This mapper enforces separation of concerns between layers:
 * - Domain layer uses camelCase and Date objects
 * - Database layer uses snake_case and timestamps
 * - API/DTO layer uses camelCase and ISO strings
 * 
 * Why static methods: Mappers are stateless utilities, no instance needed.
 */
export class ForecastMapper {
  /**
   * Convert Domain Entity to Response DTO for API layer.
   * 
   * @param entity - Forecast domain entity
   * @returns ForecastResponseDTO with ISO date string
   * 
   * @remarks
   * Optional fields are provided with sensible defaults (0 for numbers, empty string for text).
   * This ensures API consumers always receive complete, predictable data structures.
   */
  static toDTO(entity: Forecast): ForecastResponseDTO {
    return {
      date: entity.forecastDate.toISOString().split('T')[0], // YYYY-MM-DD
      temperature: entity.temperature,
      feelsLike: entity.feelsLike ?? entity.temperature,
      conditions: entity.conditions,
      description: entity.description ?? entity.conditions,
      precipitationChance: entity.precipitationChance ?? 0,
      humidity: entity.humidity ?? 0,
      windSpeed: entity.windSpeed ?? 0,
      city: entity.city,
      state: entity.state,
    };
  }

  /**
   * Convert database row (snake_case) to Domain Entity (camelCase).
   * 
   * @param row - Database row object
   * @returns Forecast domain entity
   * 
   * @remarks
   * Database timestamps are converted to Date objects.
   * Snake_case fields are mapped to camelCase properties.
   * Since Forecast is an interface, we return a plain object literal.
   */
  static fromDatabase(row: ForecastDatabaseRow): Forecast {
    return {
      id: row.id,
      city: row.city,
      state: row.state,
      forecastDate: new Date(row.forecast_date),
      temperature: Number(row.temperature),
      feelsLike: row.feels_like ? Number(row.feels_like) : undefined,
      conditions: row.conditions,
      description: row.description ?? undefined,
      precipitationChance: row.precipitation_chance ? Number(row.precipitation_chance) : undefined,
      humidity: row.humidity ? Number(row.humidity) : undefined,
      windSpeed: row.wind_speed ? Number(row.wind_speed) : undefined,
      iconCode: row.icon_code ?? undefined,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  /**
   * Convert Domain Entity to database row object (snake_case).
   * 
   * @param entity - Forecast domain entity
   * @returns Plain object with snake_case keys for Knex insert/update
   * 
   * @remarks
   * Omits id, created_at, updated_at - handled by database.
   * Date objects converted to ISO strings for PostgreSQL.
   * Optional fields are included only if they have values.
   */
  static toDatabase(entity: Forecast): object {
    return {
      city: entity.city,
      state: entity.state,
      forecast_date: entity.forecastDate.toISOString().split('T')[0],
      temperature: entity.temperature,
      feels_like: entity.feelsLike ?? null,
      conditions: entity.conditions,
      description: entity.description ?? null,
      precipitation_chance: entity.precipitationChance ?? null,
      humidity: entity.humidity ?? null,
      wind_speed: entity.windSpeed ?? null,
      icon_code: entity.iconCode ?? null,
    };
  }

  /**
   * Convert array of database rows to array of Domain Entities.
   * 
   * @param rows - Array of database rows
   * @returns Array of Forecast domain entities
   */
  static fromDatabaseArray(rows: ForecastDatabaseRow[]): Forecast[] {
    return rows.map((row) => ForecastMapper.fromDatabase(row));
  }

  /**
   * Convert array of Domain Entities to array of Response DTOs.
   * 
   * @param entities - Array of Forecast domain entities
   * @returns Array of ForecastResponseDTO
   */
  static toDTOArray(entities: Forecast[]): ForecastResponseDTO[] {
    return entities.map((entity) => ForecastMapper.toDTO(entity));
  }
}