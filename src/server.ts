import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import helmet from 'helmet';
import knex, { Knex } from 'knex';
import swaggerUi from 'swagger-ui-express';

import { ForecastController } from './api/controllers/ForecastController';
import { HealthController } from './api/controllers/HealthController';
import { swaggerSpec } from './api/docs/swagger.config';
import { errorHandler } from './api/middleware/errorHandler.middleware';
import { rateLimiter } from './api/middleware/rateLimiter.middleware';
import { requestLogger } from './api/middleware/requestLogger.middleware';
import { createForecastRoutes } from './api/routes/forecast.routes';
import { ForecastService } from './application/services/ForecastService';
import { HealthService } from './application/services/HealthService';
import databaseConfig from './config/database.config';
import { logger } from './config/logger.config';
import { ForecastRepository } from './infrastructure/database/repositories/ForecastRepository';
import { OpenWeatherMapClient } from './infrastructure/weather/clients/OpenWeatherMapClient';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv.config({ path: envFile });

/**
 * Application server setup and configuration.
 *
 * @author msoler18
 * @description Main entry point for the Weather API server. Configures Express
 * application with security middlewares (CORS, Helmet), request logging, rate
 * limiting, and routes. Initializes all dependencies using dependency injection
 * following hexagonal architecture principles. All errors are handled by the
 * centralized error handler middleware.
 *
 * @remarks
 * Middleware order (critical):
 * 1. Security (CORS, Helmet) - First line of defense
 * 2. Body parsing - Required before routes
 * 3. Request logger - Log all requests
 * 4. Rate limiter - Protect from abuse
 * 5. Routes - Application endpoints
 * 6. Swagger UI - API documentation (development only)
 * 7. Error handler - MUST be last
 */
function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  app.use('/api', rateLimiter);

  const db: Knex = knex(
    databaseConfig[process.env.NODE_ENV as keyof typeof databaseConfig] ||
      databaseConfig.development
  );

  const forecastRepository = new ForecastRepository(db);
  const weatherClient = new OpenWeatherMapClient(
    process.env.OPENWEATHER_API_KEY || '',
    'https://api.openweathermap.org/data/2.5',
    5000
  );
  const forecastService = new ForecastService(
    forecastRepository,
    weatherClient,
    logger
  );
  const forecastController = new ForecastController(forecastService);

  const healthService = new HealthService(db, weatherClient, logger);
  const healthController = new HealthController(healthService);

  app.use('/api/v1', createForecastRoutes(forecastController));

  app.get('/api/v1/health', (req, res, next) => {
    void healthController.getHealth(req, res, next);
  });

  // Swagger UI - API documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Weather API Documentation',
  }));

  // Swagger JSON endpoint
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use(errorHandler);

  return app;
}

/**
 * Start the server.
 *
 * @author msoler18
 * @description Initializes Express application and starts listening on configured
 * port. Handles graceful shutdown on SIGTERM/SIGINT signals. Logs startup
 * information including environment and port.
 */
function startServer(): void {
  const app = createApp();
  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, () => {
    logger.info('Weather API server started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
    });
    logger.info('Swagger UI available at http://localhost:' + PORT + '/api/docs');
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

if (require.main === module) {
  startServer();
}

export { createApp };