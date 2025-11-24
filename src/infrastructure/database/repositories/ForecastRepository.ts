import { Knex } from 'knex';
import { IForecastRepository } from '../../../domain/repositories/IForecastRepository.interface';
import { Forecast } from '../../../domain/entities/Forecast.entity';
import { DatabaseError } from '../../../shared/errors/DatabaseError';

/**
 * Knex implementation of IForecastRepository.
 * 
 * @author msoler18
 * @description Handles mapping between domain entities (camelCase) and
 * database rows. All database errors are wrapped
 * in DatabaseError for consistent error handling.
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
      const row = await this.db(this.tableName)
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
      const rows = await this.db(this.tableName)
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

      const [savedRow] = await this.db(this.tableName)
        .insert(dbRow)
        .onConflict(['city', 'state', 'forecast_date'])
        .merge()
        .returning('*');

      return this.mapToDomain(savedRow);
    } catch (error) {
      throw DatabaseError.fromKnexError(error as Error);
    }
  }

  async saveMany(forecasts: Forecast[]): Promise<Forecast[]> {
    try {
      const dbRows = forecasts.map((f) => this.mapToDatabase(f));

      const savedRows = await this.db(this.tableName)
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
   */
  private mapToDomain(row: any): Forecast {
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
   */
  private mapToDatabase(forecast: Forecast): any {
    return {
      city: forecast.city.toLowerCase(),
      state: forecast.state.toLowerCase(),
      forecast_date: this.formatDate(forecast.forecastDate),
      temperature: forecast.temperature,
      feels_like: forecast.feelsLike,
      conditions: forecast.conditions,
      description: forecast.description,
      precipitation_chance: forecast.precipitationChance,
      humidity: forecast.humidity,
      wind_speed: forecast.windSpeed,
      icon_code: forecast.iconCode,
    };
  }

  /**
   * Format Date to YYYY-MM-DD for PostgreSQL DATE column.
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}