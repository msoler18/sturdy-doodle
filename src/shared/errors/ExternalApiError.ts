import { AppError } from './AppError';

/**
 * Error class for external API failures.
 * 
 * @author msoler18
 * @description Specialized error for failures when communicating with external
 * weather APIs (OpenWeatherMap, WeatherAPI, etc.). Captures provider-specific
 * information including HTTP status codes and raw API responses for debugging.
 * Used to distinguish external service failures from internal application errors.
 */
export class ExternalApiError extends AppError {
  public readonly provider: string;
  public readonly apiResponse?: unknown;

  constructor(
    message: string,
    provider: string,
    statusCode: number = 500,
    apiResponse?: unknown
  ) {
    super(
      message,
      'EXTERNAL_API_ERROR',
      statusCode,
      true 
    );
    this.provider = provider;
    this.apiResponse = apiResponse;
  }
}