/**
 * Data Transfer Object for forecast requests from API layer.
 * 
 * @remarks
 * This DTO represents the input parameters for forecast queries.
 * The date field is optional - when omitted, returns next 3 days forecast.
 * When provided, attempts to retrieve cached forecast from database first.
 * 
 * @example
 * // Get next 3 days
 * { city: "fresno", state: "california" }
 * 
 * @example
 * // Get specific date (cache-first)
 * { city: "fresno", state: "california", date: "2025-11-25" }
 */
export interface ForecastRequestDTO {
  /**
   * City name (lowercase, will be normalized)
   */
  city: string;

  /**
   * State name (lowercase, will be normalized)
   */
  state: string;

  /**
   * Optional date for specific forecast lookup.
   * ISO 8601 date string (YYYY-MM-DD) or Unix timestamp.
   * When provided, triggers cache-first strategy.
   */
  date?: string;
}