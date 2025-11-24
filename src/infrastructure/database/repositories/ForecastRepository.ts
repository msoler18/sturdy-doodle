import { Knex } from 'knex';

import { Forecast } from '../../../domain/entities/Forecast.entity';
import { IForecastRepository } from '../../../domain/repositories/IForecastRepository.interface';
import { DatabaseError } from '../../../shared/errors/DatabaseError';

/**
 * Database row type matching PostgreSQL forecasts table schema.
 * 
 * @author msoler18
 * @description Type definition for raw database rows from the forecasts table.
 * Uses snake_case naming to match PostgreSQL column conventions. Numeric fields
 * are returned as strings by pg driver and need parsing. This type ensures
 * type safety when mapping between database and domain layers.
 */
interface ForecastRow {
  id: number;
  city: string;
  state: string;
  forecast_date: string;
  temperature: string;
  feels_like: string | null;
  conditions: string;
  description: string | null;
  precipitation_chance: string | null;
  humidity: number | null;
  wind_speed: string | null;
  icon_code: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Knex implementation of IForecastRepository.
 * 
 * @author msoler18
 * @description Concrete adapter implementing forecast persistence using Knex
 * query builder and PostgreSQL. Handles bidirectional mapping between domain
 * entities (camelCase, readonly) and database rows (snake_case, mutable).
 * All database errors are caught and wrapped in DatabaseError for consistent
 * error handling across the application. Uses upsert strategy (INSERT ... ON
 * CONFLICT) to handle cache updates efficiently.
 */
export class ForecastRepository implements IForecastRepository {
  private readonly tableName = 'forecasts';

  constructor(private readonly db: Knex) {}

  async findByLocationAndDate(
    city: string,
    state: string,
    date: Date
  ): Promise<Forecast | null> {
    try {
      const row = await this.db<ForecastRow>(this.tableName)
        .where({
          city: city.toLowerCase(),
          state: state.toLowerCase(),
          forecast_date: this.formatDate(date),
        })
        .first();

      return row ? this.mapToDomain(row) : null;
    } catch (error) {
      throw DatabaseError.fromKnexError(error as Error);
    }
  }

  async findByLocation(city: string, state: string): Promise<Forecast[]> {
    try {
      const rows = await this.db<ForecastRow>(this.tableName)
        .where({
          city: city.toLowerCase(),
          state: state.toLowerCase(),
        })
        .orderBy('forecast_date', 'asc');

      return rows.map((row) => this.mapToDomain(row));
    } catch (error) {
      throw DatabaseError.fromKnexError(error as Error);
    }
  }

  async save(forecast: Forecast): Promise<Forecast> {
    try {
      const dbRow = this.mapToDatabase(forecast);

      const [savedRow] = await this.db<ForecastRow>(this.tableName)
        .insert(dbRow)
        .onConflict(['city', 'state', 'forecast_date'])
        .merge() // Update if exists
        .returning('*');

      return this.mapToDomain(savedRow);
    } catch (error) {
      throw DatabaseError.fromKnexError(error as Error);
    }
  }

  async saveMany(forecasts: Forecast[]): Promise<Forecast[]> {
    try {
      const dbRows = forecasts.map((f) => this.mapToDatabase(f));

      const savedRows = await this.db<ForecastRow>(this.tableName)
        .insert(dbRows)
        .onConflict(['city', 'state', 'forecast_date'])
        .merge()
        .returning('*');

      return savedRows.map((row) => this.mapToDomain(row));
    } catch (error) {
      throw DatabaseError.fromKnexError(error as Error);
    }
  }

  /**
   * Map database row (snake_case) to domain entity (camelCase).
   * 
   * @author msoler18
   * @description Converts PostgreSQL row into domain entity format. Handles
   * naming convention transformation (snake_case → camelCase), type conversions
   * (string decimals → numbers, string dates → Date objects), and null handling
   * (null → undefined for optional fields). This separation ensures domain layer
   * remains independent of database implementation details.
   * 
   * @param {ForecastRow} row - Raw database row
   * @returns {Forecast} Domain entity with readonly properties
   */
  private mapToDomain(row: ForecastRow): Forecast {
    return {
      id: row.id,
      city: row.city,
      state: row.state,
      forecastDate: new Date(row.forecast_date),
      temperature: parseFloat(row.temperature),
      feelsLike: row.feels_like ? parseFloat(row.feels_like) : undefined,
      conditions: row.conditions,
      description: row.description || undefined,
      precipitationChance: row.precipitation_chance
        ? parseFloat(row.precipitation_chance)
        : undefined,
      humidity: row.humidity || undefined,
      windSpeed: row.wind_speed ? parseFloat(row.wind_speed) : undefined,
      iconCode: row.icon_code || undefined,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  /**
   * Map domain entity (camelCase) to database row (snake_case).
   * 
   * @author msoler18
   * @description Converts domain entity into database row format for INSERT/UPDATE
   * operations. Handles naming convention transformation (camelCase → snake_case),
   * type conversions (numbers → strings for DECIMAL columns), normalization
   * (lowercase city/state for case-insensitive matching), and undefined → null
   * mapping required by PostgreSQL. Returns Partial<ForecastRow> to exclude
   * auto-generated fields (id, created_at, updated_at).
   * 
   * @param {Forecast} forecast - Domain entity to persist
   * @returns {Partial<ForecastRow>} Database row ready for INSERT/UPDATE
   */
  private mapToDatabase(forecast: Forecast): Partial<ForecastRow> {
    return {
      city: forecast.city.toLowerCase(),
      state: forecast.state.toLowerCase(),
      forecast_date: this.formatDate(forecast.forecastDate),
      temperature: forecast.temperature.toString(),
      feels_like: forecast.feelsLike?.toString() || null,
      conditions: forecast.conditions,
      description: forecast.description || null,
      precipitation_chance: forecast.precipitationChance?.toString() || null,
      humidity: forecast.humidity || null,
      wind_speed: forecast.windSpeed?.toString() || null,
      icon_code: forecast.iconCode || null,
    };
  }

  /**
   * Format Date to YYYY-MM-DD for PostgreSQL DATE column.
   * 
   * @author msoler18
   * @description Converts JavaScript Date object to ISO 8601 date string
   * (YYYY-MM-DD) required by PostgreSQL DATE column type. Uses UTC to avoid
   * timezone-related bugs where dates shift by ±1 day. This format ensures
   * consistent date handling regardless of server timezone configuration.
   * 
   * @param {Date} date - JavaScript Date object
   * @returns {string} Date string in YYYY-MM-DD format
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
