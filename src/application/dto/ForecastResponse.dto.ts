/**
 * Data Transfer Object for forecast responses to API layer.
 * 
 * @remarks
 * This DTO represents the standardized forecast data returned to clients.
 * All numeric values use metric units (Celsius, km/h, percentage).
 * This structure matches both database-cached and external API responses.
 * 
 * @example
 * {
 *   date: "2025-11-25",
 *   temperature: 18.5,
 *   feelsLike: 17.2,
 *   conditions: "Partly Cloudy",
 *   description: "Partly cloudy with light winds",
 *   precipitationChance: 10,
 *   humidity: 45,
 *   windSpeed: 12.5,
 *   city: "fresno",
 *   state: "california"
 * }
 */
export interface ForecastResponseDTO {
  /**
   * Forecast date in ISO 8601 format (YYYY-MM-DD)
   */
  date: string;

  /**
   * Temperature in Celsius
   */
  temperature: number;

  /**
   * Feels-like temperature in Celsius
   */
  feelsLike: number;

  /**
   * Short weather condition summary (e.g., "Partly Cloudy")
   */
  conditions: string;

  /**
   * Detailed weather description
   */
  description: string;

  /**
   * Precipitation probability as percentage (0-100)
   */
  precipitationChance: number;

  /**
   * Relative humidity as percentage (0-100)
   */
  humidity: number;

  /**
   * Wind speed in km/h
   */
  windSpeed: number;

  /**
   * City name (normalized to lowercase)
   */
  city: string;

  /**
   * State name (normalized to lowercase)
   */
  state: string;
}