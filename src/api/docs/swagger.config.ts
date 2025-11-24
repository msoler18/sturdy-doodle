import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI configuration.
 * 
 * @author msoler18
 * @description Generates OpenAPI 3.0 specification from JSDoc comments
 * in controllers and route files. Serves as API documentation for the
 * Weather API service.
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather API',
      version: '1.0.0',
      description: 'Backend service for weather forecasts using OpenWeatherMap API',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Forecast',
        description: 'Weather forecast operations',
      },
      {
        name: 'Health',
        description: 'System health checks',
      },
    ],
    components: {
      schemas: {
        ForecastResponse: {
          type: 'object',
          required: [
            'date',
            'temperature',
            'feelsLike',
            'conditions',
            'description',
            'precipitationChance',
            'humidity',
            'windSpeed',
            'city',
            'state',
          ],
          properties: {
            date: {
              type: 'string',
              format: 'date',
              example: '2025-11-25',
              description: 'Forecast date in ISO 8601 format (YYYY-MM-DD)',
            },
            temperature: {
              type: 'number',
              example: 18.5,
              description: 'Temperature in Celsius',
            },
            feelsLike: {
              type: 'number',
              example: 17.2,
              description: 'Feels-like temperature in Celsius',
            },
            conditions: {
              type: 'string',
              example: 'Partly Cloudy',
              description: 'Short weather condition summary',
            },
            description: {
              type: 'string',
              example: 'Partly cloudy with light winds',
              description: 'Detailed weather description',
            },
            precipitationChance: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 10,
              description: 'Precipitation probability as percentage (0-100)',
            },
            humidity: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 45,
              description: 'Relative humidity as percentage (0-100)',
            },
            windSpeed: {
              type: 'number',
              minimum: 0,
              example: 12.5,
              description: 'Wind speed in km/h',
            },
            city: {
              type: 'string',
              example: 'fresno',
              description: 'City name (normalized to lowercase)',
            },
            state: {
              type: 'string',
              example: 'california',
              description: 'State name (normalized to lowercase)',
            },
          },
        },
        ForecastRequest: {
          type: 'object',
          required: ['city', 'state', 'date', 'temperature', 'feelsLike', 'conditions', 'description', 'precipitationChance', 'humidity', 'windSpeed'],
          properties: {
            city: {
              type: 'string',
              example: 'fresno',
              description: 'City name (will be normalized to lowercase)',
            },
            state: {
              type: 'string',
              example: 'california',
              description: 'State name (will be normalized to lowercase)',
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2025-11-25',
              description: 'Forecast date in ISO 8601 format (YYYY-MM-DD)',
            },
            temperature: {
              type: 'number',
              minimum: -100,
              maximum: 100,
              example: 18.5,
              description: 'Temperature in Celsius',
            },
            feelsLike: {
              type: 'number',
              minimum: -100,
              maximum: 100,
              example: 17.2,
              description: 'Feels-like temperature in Celsius',
            },
            conditions: {
              type: 'string',
              maxLength: 100,
              example: 'Partly Cloudy',
              description: 'Short weather condition summary',
            },
            description: {
              type: 'string',
              maxLength: 500,
              example: 'Partly cloudy with light winds',
              description: 'Detailed weather description',
            },
            precipitationChance: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 10,
              description: 'Precipitation probability as percentage (0-100)',
            },
            humidity: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 45,
              description: 'Relative humidity as percentage (0-100)',
            },
            windSpeed: {
              type: 'number',
              minimum: 0,
              maximum: 500,
              example: 12.5,
              description: 'Wind speed in km/h',
            },
          },
        },
        HealthStatus: {
          type: 'object',
          required: ['status', 'timestamp', 'uptime', 'database', 'externalApis'],
          properties: {
            status: {
              type: 'string',
              enum: ['ok', 'degraded', 'down'],
              example: 'ok',
              description: 'Overall system health status',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-24T10:30:00.000Z',
              description: 'ISO 8601 timestamp of health check',
            },
            uptime: {
              type: 'number',
              example: 3600,
              description: 'Server uptime in seconds',
            },
            database: {
              type: 'object',
              required: ['status'],
              properties: {
                status: {
                  type: 'string',
                  enum: ['ok', 'error'],
                  example: 'ok',
                },
                message: {
                  type: 'string',
                  example: 'Connection refused',
                },
                responseTime: {
                  type: 'number',
                  example: 5,
                  description: 'Response time in milliseconds',
                },
              },
            },
            externalApis: {
              type: 'object',
              required: ['openWeather'],
              properties: {
                openWeather: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['ok', 'error'],
                      example: 'ok',
                    },
                    message: {
                      type: 'string',
                      example: 'API key invalid',
                    },
                    responseTime: {
                      type: 'number',
                      example: 120,
                      description: 'Response time in milliseconds',
                    },
                  },
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              required: ['message', 'code', 'statusCode'],
              properties: {
                message: {
                  type: 'string',
                  example: 'Validation error',
                },
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                statusCode: {
                  type: 'number',
                  example: 400,
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              oneOf: [
                {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ForecastResponse',
                  },
                },
                {
                  $ref: '#/components/schemas/ForecastResponse',
                },
              ],
            },
          },
        },
      },
      responses: {
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'Validation failed',
                  code: 'VALIDATION_ERROR',
                  statusCode: 400,
                  details: [
                    {
                      field: 'city',
                      message: 'City is required',
                    },
                  ],
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'Forecast not found',
                  code: 'NOT_FOUND',
                  statusCode: 404,
                },
              },
            },
          },
        },
        TooManyRequests: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'Too many requests, please try again later',
                  code: 'RATE_LIMIT_EXCEEDED',
                  statusCode: 429,
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'An unexpected error occurred',
                  code: 'INTERNAL_ERROR',
                  statusCode: 500,
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    './src/api/controllers/*.ts',
    './src/api/routes/*.ts',
  ],
};

export const swaggerSpec: swaggerJsdoc.OAS3Definition = swaggerJsdoc(options) as swaggerJsdoc.OAS3Definition;