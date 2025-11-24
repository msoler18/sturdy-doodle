import { Forecast } from '../entities/Forecast.entity';

/**
 * Port (interface) for forecast data persistence.
 * 
 * @author msoler18
 * @description Defines contract for forecast repository following Hexagonal
 * Architecture principles. This interface belongs to the domain layer and has
 * no dependencies on infrastructure (no Knex, PostgreSQL, etc). Concrete
 * implementations are provided in the infrastructure layer as adapters,
 * allowing easy swapping of database implementations without affecting
 * business logic.
 */
export interface IForecastRepository {
  /**
   * Find forecast by location and specific date.
   * 
   * @author msoler18
   * @description Retrieves a single forecast for given city, state, and date.
   * Used primarily for cache lookups before fetching from external API.
   * 
   * @param {string} city - City name (case-insensitive)
   * @param {string} state - State name (case-insensitive)
   * @param {Date} date - Forecast date
   * @returns {Promise<Forecast | null>} Forecast if found, null otherwise
   */
  findByLocationAndDate(
    city: string,
    state: string,
    date: Date
  ): Promise<Forecast | null>;

  /**
   * Find all forecasts for a location.
   * 
   * @author msoler18
   * @description Retrieves all forecasts for a given location, ordered by date.
   * Useful for retrieving multi-day forecast history. Returns empty array if
   * no forecasts exist for the location.
   * 
   * @param {string} city - City name (case-insensitive)
   * @param {string} state - State name (case-insensitive)
   * @returns {Promise<Forecast[]>} Array of forecasts, empty if none found
   */
  findByLocation(city: string, state: string): Promise<Forecast[]>;

  /**
   * Save a single forecast.
   * 
   * @author msoler18
   * @description Saves forecast to database. If a forecast already exists for
   * the same city, state, and date (unique constraint), it will be updated
   * instead of creating a duplicate. This upsert behavior ensures cache
   * freshness when APIs return updated data.
   * 
   * @param {Forecast} forecast - Forecast to save
   * @returns {Promise<Forecast>} Saved forecast with generated ID and timestamps
   * @throws {DatabaseError} When database operation fails
   */
  save(forecast: Forecast): Promise<Forecast>;

  /**
   * Save multiple forecasts in a single transaction.
   * 
   * @author msoler18
   * @description Batch saves multiple forecasts atomically. More efficient than
   * multiple individual saves as it uses a single database transaction. All
   * forecasts succeed or all fail together. Uses same upsert logic as save()
   * to handle duplicate entries.
   * 
   * @param {Forecast[]} forecasts - Array of forecasts to save
   * @returns {Promise<Forecast[]>} Array of saved forecasts
   * @throws {DatabaseError} When database operation fails
   */
  saveMany(forecasts: Forecast[]): Promise<Forecast[]>;
}