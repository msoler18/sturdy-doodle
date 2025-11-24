import { NextFunction, Request, Response } from 'express';

import { ForecastMapper } from '../../application/mappers/ForecastMapper';
import { ForecastService } from '../../application/services/ForecastService';
import { GetForecastQuery } from '../validators/forecast.validator';

/**
 * Controller for forecast-related HTTP endpoints.
 *
 * @author msoler18
 * @description Handles HTTP requests for forecast operations. Delegates business
 * logic to ForecastService and converts domain entities to DTOs for API responses.
 * All errors are allowed to propagate to the error handler middleware for consistent
 * error formatting. This controller follows the "thin controller" principle - no
 * business logic, only HTTP concerns (request parsing, response formatting).
 *
 * @remarks
 * Controller responsibilities:
 * - Parse and validate HTTP request data (query params, body)
 * - Call appropriate service methods
 * - Convert domain entities to DTOs
 * - Format HTTP responses
 * - Let errors propagate to error handler middleware
 */
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  /**
   * GET /forecast - Retrieve weather forecast for a location.
   *
   * @author msoler18
   * @description Fetches forecast data using cache-first strategy. If date is
   * provided, checks database cache first. If no date or cache miss, calls
   * external weather API. Returns 3-day forecast by default, or single day
   * if date parameter is specified.
   *
   * @param req - Express request with validated query params
   * @param res - Express response
   * @param next - Express next function for error propagation
   *
   * @remarks
   * Query parameters (validated by Zod):
   * - city: string (required)
   * - state: string (required)
   * - date: string (optional, YYYY-MM-DD format)
   *
   * Response format:
   * { success: true, data: ForecastResponseDTO[] }
   *
   * Errors are caught by error handler middleware and returned as:
   * { success: false, error: { message, code, statusCode } }
   */
  async getForecast(
    req: Request<unknown, unknown, unknown, GetForecastQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { city, state, date } = req.query;

      const dateObj = date ? new Date(date) : undefined;

      const forecasts = await this.forecastService.getForecast(
        city,
        state,
        dateObj
      );

      const forecastDTOs = ForecastMapper.toDTOArray(forecasts);

      res.status(200).json({
        success: true,
        data: forecastDTOs,
      });
    } catch (error: unknown) {
      next(error);
    }
  }
}