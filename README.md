# Weather API

Backend service for weather forecasts using TypeScript, Express, Knex, and PostgreSQL. Integrates with OpenWeatherMap API to provide 3-day weather forecasts with caching capabilities.

## 🚀 Features

- **RESTful API** - Clean REST endpoints for forecast operations
- **Cache-First Strategy** - Database caching for improved performance
- **External API Integration** - OpenWeatherMap API integration
- **Health Checks** - System health monitoring with database and API status
- **API Documentation** - Interactive Swagger UI documentation
- **Rate Limiting** - Protection against API abuse (100 requests/15 min)
- **Type Safety** - Full TypeScript with strict mode
- **Hexagonal Architecture** - Clean separation of concerns

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **OpenWeatherMap API Key** ([Get one here](https://openweathermap.org/api))

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd alloy_health/alloy_health
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup PostgreSQL database

```bash
# Create database and user
psql -U postgres

CREATE DATABASE weather_dev;
CREATE USER weather_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE weather_dev TO weather_user;
\q
```

### 4. Configure environment variables

Create `.env.development` file:

```env
# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weather_dev
DB_USER=weather_user
DB_PASSWORD=your_password

# External APIs
OPENWEATHER_API_KEY=your_openweather_api_key
```

### 5. Run database migrations

```bash
npm run migrate:latest
```

### 6. Start the server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs.json

## 🔌 API Endpoints

### GET /api/v1/forecast

Retrieve weather forecast for a location.

**Query Parameters:**
- `city` (required): City name (e.g., "fresno")
- `state` (required): State name (e.g., "california")
- `date` (optional): Specific date in YYYY-MM-DD format

**Example Request:**
```bash
curl "http://localhost:3000/api/v1/forecast?city=fresno&state=california"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-11-25",
      "temperature": 18.5,
      "feelsLike": 17.2,
      "conditions": "Partly Cloudy",
      "description": "Partly cloudy with light winds",
      "precipitationChance": 10,
      "humidity": 45,
      "windSpeed": 12.5,
      "city": "fresno",
      "state": "california"
    }
  ]
}
```

### POST /api/v1/forecast

Save a forecast to the database.

**Request Body:**
```json
{
  "city": "fresno",
  "state": "california",
  "date": "2025-11-25",
  "temperature": 18.5,
  "feelsLike": 17.2,
  "conditions": "Partly Cloudy",
  "description": "Partly cloudy with light winds",
  "precipitationChance": 10,
  "humidity": 45,
  "windSpeed": 12.5
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "city": "fresno",
    "state": "california",
    "date": "2025-11-25",
    "temperature": 18.5,
    "feelsLike": 17.2,
    "conditions": "Partly Cloudy",
    "description": "Partly cloudy with light winds",
    "precipitationChance": 10,
    "humidity": 45,
    "windSpeed": 12.5
  }'
```

### GET /api/v1/health

Check system health status.

**Example Request:**
```bash
curl http://localhost:3000/api/v1/health
```

**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "ok",
    "responseTime": 5
  },
  "externalApis": {
    "openWeather": {
      "status": "ok",
      "responseTime": 120
    }
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Test weather API integration manually
npm run test:weather
```

### Test Coverage

The project maintains high test coverage with the following metrics:

- **Statements**: 90.73%
- **Branches**: 81.96%
- **Functions**: 98.33%
- **Lines**: 90.39%

Coverage reports are generated in the `coverage/` directory. You can view the HTML report by opening `coverage/lcov-report/index.html` in your browser.

**Coverage Thresholds**: The project enforces minimum coverage thresholds of 80% for branches, functions, lines, and statements. These thresholds are configured in `jest.config.js`.

## 🏗️ Project Structure

```
src/
├── api/                           # API layer (controllers, routes, middleware)
│   ├── controllers/              # HTTP request handlers
│   │   ├── ForecastController.ts
│   │   └── HealthController.ts
│   ├── middleware/               # Express middlewares
│   │   ├── errorHandler.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   ├── requestLogger.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/                   # Route definitions
│   │   └── forecast.routes.ts
│   ├── validators/               # Zod validation schemas
│   │   └── forecast.validator.ts
│   └── docs/                     # Swagger/OpenAPI configuration
│       └── swagger.config.ts
├── application/                  # Application layer (use cases, DTOs, mappers)
│   ├── dto/                      # Data Transfer Objects
│   │   ├── ForecastRequest.dto.ts
│   │   └── ForecastResponse.dto.ts
│   ├── mappers/                  # Layer conversion mappers
│   │   └── ForecastMapper.ts
│   └── services/                 # Business logic services
│       ├── ForecastService.ts
│       └── HealthService.ts
├── domain/                       # Domain layer (entities, interfaces)
│   ├── entities/                 # Domain entities
│   │   └── Forecast.entity.ts
│   ├── repositories/             # Repository interfaces
│   │   └── IForecastRepository.interface.ts
│   └── services/                # Service interfaces
│       ├── IHealthService.interface.ts
│       └── IWeatherClient.interface.ts
├── infrastructure/               # Infrastructure layer (adapters)
│   ├── database/                 # Database adapters (Knex, repositories)
│   │   ├── migrations/           # Database migrations
│   │   │   ├── 20241124000001_create_forecasts.ts
│   │   │   └── 20241124000002_add_forecasts_indexes.ts
│   │   ├── repositories/         # Repository implementations
│   │   │   └── ForecastRepository.ts
│   │   └── seeds/                # Database seed files
│   └── weather/                  # External API clients
│       ├── adapters/             # API response adapters
│       │   └── WeatherResponseAdapter.ts
│       └── clients/              # External API clients
│           └── OpenWeatherMapClient.ts
├── shared/                       # Shared utilities
│   ├── errors/                   # Custom error classes
│   │   ├── AppError.ts
│   │   ├── DatabaseError.ts
│   │   └── ExternalApiError.ts
│   ├── types/                    # Shared TypeScript types
│   └── utils/                    # Utility functions
├── config/                       # Configuration files
│   ├── database.config.ts        # Knex database configuration
│   └── logger.config.ts          # Winston logger configuration
└── server.ts                     # Application entry point
```

## 🏛️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) principles:

- **Domain Layer**: Core business logic, entities, and interfaces (no dependencies)
- **Application Layer**: Use cases, DTOs, and business services
- **Infrastructure Layer**: External adapters (database, APIs)
- **API Layer**: HTTP controllers and routes

This architecture ensures:
- ✅ Testability (easy to mock dependencies)
- ✅ Maintainability (clear separation of concerns)
- ✅ Flexibility (easy to swap implementations)

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Compile TypeScript to JavaScript
npm start                 # Run production server

# Code Quality
npm run type-check        # TypeScript type checking
npm run lint              # ESLint code linting
npm run lint:fix          # Auto-fix linting issues
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting

# Testing
npm test                  # Run Jest tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate test coverage report

# Database
npm run migrate:latest    # Run pending migrations
npm run migrate:rollback  # Rollback last migration
npm run seed:run          # Run database seeds
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Zod schema validation for all requests
- **Error Handling**: Centralized error handling with proper status codes

## 📊 Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

Common error codes:
- `VALIDATION_ERROR` (400): Request validation failed
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `EXTERNAL_API_ERROR` (502): External API failure
- `DATABASE_ERROR` (500): Database operation failed
- `INTERNAL_ERROR` (500): Unexpected server error

## 🤝 Contributing

1. Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
2. Ensure all tests pass: `npm test`
3. Run linting: `npm run lint`
4. Check types: `npm run type-check`
5. Update documentation as needed

## 📄 License

MIT

## 👤 Author

msoler18

---

For detailed architecture decisions, see [docs/ADRs/](docs/ADRs/)

