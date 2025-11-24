import { Forecast } from '../entities/Forecast.entity';

/**
 * Port (interface) for forecast data persistence.
 * @author msoler18
 * @description Defines contract for forecast repository without coupling to
 * specific database implementation. Infrastructure layer provides
 * concrete implementation (adapter).
 */
export interface IForecastRepository {
  /**
   * Find forecast by location and specific date.
   * 
   * @returns Forecast if found, null otherwise
   */
  findByLocationAndDate(
    city: string,
    state: string,
    date: Date
  ): Promise<Forecast | null>;

  /**
   * Find all forecasts for a location.
   * 
   * Useful for retrieving multi-day forecasts.
   * @returns Array of forecasts, empty if none found
   */
  findByLocation(city: string, state: string): Promise<Forecast[]>;

  /**
   * Save a single forecast.
   * 
   * Creates new record or updates existing one based on
   * unique constraint (city, state, date).
   * 
   * @returns Saved forecast with generated ID and timestamps
   */
  save(forecast: Forecast): Promise<Forecast>;

  /**
   * Save multiple forecasts in a single transaction.
   * 
   * More efficient than multiple individual saves.
   * All succeed or all fail (atomic operation).
   * 
   * @returns Array of saved forecasts
   */
  saveMany(forecasts: Forecast[]): Promise<Forecast[]>;
}