import { Forecast } from '../entities/Forecast.entity';

/**
 * Interface for external weather API clients.
 * Defines contract for fetching weather forecasts from any provider.
 * 
 * @interface IWeatherClient
 * @author msoler18
 */
export interface IWeatherClient {
  /**
   * Fetches weather forecast for the specified location and number of days.
   * 
   * @param city - City name (e.g., "fresno")
   * @param state - State name (e.g., "california")
   * @param days - Number of days to forecast (default: 3)
   * @returns Promise with array of Forecast entities
   * @throws ExternalApiError if API request fails
   */
  getForecast(city: string, state: string, days: number): Promise<Forecast[]>;
}