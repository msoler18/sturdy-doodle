import { NextFunction, Request, Response, Router } from 'express';

import { ForecastController } from '../controllers/ForecastController';
import { validateRequest } from '../middleware/validation.middleware';
import {
  GetForecastQuery,
  PostForecastBody,
  getForecastQuerySchema,
  postForecastBodySchema,
} from '../validators/forecast.validator';

/**
 * Forecast routes configuration.
 *
 * @author msoler18
 * @description Defines HTTP routes for forecast operations. Each route is
 * protected by validation middleware that ensures request data matches
 * the expected schema before reaching the controller. Routes follow RESTful
 * conventions with clear separation between GET (read) and POST (create/update).
 *
 * @param forecastController - Controller instance with business logic handlers
 * @returns Express router configured with forecast routes
 *
 * @remarks
 * Route structure:
 * - GET /forecast - Retrieve forecast (with optional date filter)
 * - POST /forecast - Save forecast to database
 *
 * Validation strategy:
 * - Query params validated for GET requests
 * - Request body validated for POST requests
 * - All validation errors return 400 with field-level details
 */
export const createForecastRoutes = (
  forecastController: ForecastController
): Router => {
  const router = Router();

  router.get(
    '/forecast',
    validateRequest(getForecastQuerySchema, 'query'),
    (req: Request<unknown, unknown, unknown, GetForecastQuery>, res: Response, next: NextFunction) => {
      forecastController.getForecast(req, res, next).catch(next);
    }
  );

  router.post(
    '/forecast',
    validateRequest(postForecastBodySchema, 'body'),
    (req: Request<unknown, unknown, PostForecastBody, unknown>, res: Response, next: NextFunction) => {
      forecastController.saveForecast(req, res, next).catch(next);
    }
  );

  return router;
};