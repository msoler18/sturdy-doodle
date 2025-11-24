# ADR-001: Hexagonal Architecture

## Status
Accepted

## Context
We need to choose an architecture pattern for the Weather API backend that:
- Enables easy testing (unit and integration)
- Allows swapping implementations (e.g., different weather APIs, databases)
- Maintains clear separation of concerns
- Demonstrates senior-level architectural thinking

## Decision
We will use **Hexagonal Architecture** (also known as Ports & Adapters) with the following layer structure:

```
src/
├── domain/          # Core business logic (no dependencies)
├── application/     # Use cases and business services
├── infrastructure/  # External adapters (database, APIs)
└── api/            # HTTP layer (Express controllers, routes)
```

### Key Principles:
1. **Domain Layer** contains entities, interfaces, and business rules (zero dependencies)
2. **Application Layer** orchestrates use cases using domain interfaces
3. **Infrastructure Layer** implements domain interfaces (repositories, external clients)
4. **API Layer** handles HTTP concerns (validation, serialization)

## Consequences

### Positive:
- ✅ High testability - Easy to mock dependencies at boundaries
- ✅ Flexibility - Can swap implementations without changing business logic
- ✅ Clear separation - Each layer has a single responsibility
- ✅ SOLID principles - Dependency inversion at every boundary
- ✅ Demonstrates architectural maturity

### Negative:
- ⚠️ More boilerplate - More files and interfaces than simple MVC
- ⚠️ Learning curve - Team needs to understand the pattern
- ⚠️ Might be over-engineering for very small projects

### Trade-offs:
- More initial setup time, but easier long-term maintenance
- More files to navigate, but clearer organization
- Slightly more complex than MVC, but much more testable

## Implementation Details

### Dependency Flow:
```
API → Application → Domain ← Infrastructure
```

- API depends on Application
- Application depends on Domain
- Infrastructure implements Domain interfaces
- Domain has zero dependencies

### Example:
```typescript
// Domain (interface)
interface IForecastRepository {
  findByLocationAndDate(...): Promise<Forecast | null>;
}

// Infrastructure (implementation)
class ForecastRepository implements IForecastRepository {
  // Knex implementation
}

// Application (uses interface)
class ForecastService {
  constructor(private repo: IForecastRepository) {}
}
```

## References
- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

