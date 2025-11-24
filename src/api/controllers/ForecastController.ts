import { NextFunction, Request, Response } from 'express';

import { ForecastMapper } from '../../application/mappers/ForecastMapper';
import { ForecastService } from '../../application/services/ForecastService';
import { Forecast } from '../../domain/entities/Forecast.entity';
import {
  GetForecastQuery,
  PostForecastBody,
} from '../validators/forecast.validator';

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


   /**
   * POST /forecast - Save a forecast to the database.
   *
   * @author msoler18
   * @description Persists a forecast entity to the database. If a forecast
   * already exists for the same city, state, and date, it will be updated
   * (handled by database UNIQUE constraint). This endpoint allows explicit
   * control over what forecasts are cached, preventing automatic database
   * pollution from external API responses.
   *
   * @param req - Express request with validated body
   * @param res - Express response
   * @param next - Express next function for error propagation
   *
   * @remarks
   * Request body (validated by Zod):
   * - city: string (required)
   * - state: string (required)
   * - date: string (required, YYYY-MM-DD format)
   * - temperature: number (required, -100 to 100)
   * - feelsLike: number (required, -100 to 100)
   * - conditions: string (required, max 100 chars)
   * - description: string (required, max 500 chars)
   * - precipitationChance: number (required, 0-100)
   * - humidity: number (required, 0-100)
   * - windSpeed: number (required, 0-500)
   *
   * Response format:
   * { success: true, data: ForecastResponseDTO }
   *
   * Status codes:
   * - 201: Forecast created/updated successfully
   * - 400: Validation error (handled by validation middleware)
   * - 500: Database error (handled by error handler middleware)
   */
  async saveForecast(
    req: Request<unknown, unknown, PostForecastBody, unknown>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const forecastData: PostForecastBody = req.body;

      const forecast: Forecast = {
        city: forecastData.city.toLowerCase().trim(),
        state: forecastData.state.toLowerCase().trim(),
        forecastDate: new Date(forecastData.date),
        temperature: forecastData.temperature,
        feelsLike: forecastData.feelsLike,
        conditions: forecastData.conditions,
        description: forecastData.description,
        precipitationChance: forecastData.precipitationChance,
        humidity: forecastData.humidity,
        windSpeed: forecastData.windSpeed,
      };

      await this.forecastService.saveForecast(forecast);
      const forecastDTO = ForecastMapper.toDTO(forecast);

      res.status(201).json({
        success: true,
        data: forecastDTO,
      });
    } catch (error: unknown) {
      next(error);
    }
  }


}