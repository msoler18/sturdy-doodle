# ADR-004: Knex Only (No ORMs)

## Status
Accepted

## Context
We need a database access layer. Options include:
- **TypeORM** - Full-featured ORM with decorators
- **Prisma** - Modern ORM with excellent TypeScript support
- **Sequelize** - Mature ORM, less TypeScript-friendly
- **Knex** - SQL query builder (not an ORM)
- **Raw SQL** - Maximum control, but verbose

## Decision
We will use **Knex** query builder only, without an ORM.

### Rationale:
1. **Requirement** - Explicitly required in project specifications
2. **Control** - Full control over SQL queries
3. **Migrations** - Excellent migration system
4. **Flexibility** - Can write raw SQL when needed
5. **Type Safety** - Can achieve type safety with TypeScript interfaces

## Consequences

### Positive:
- ✅ Full SQL control - Can optimize queries as needed
- ✅ Excellent migrations - Version-controlled schema changes
- ✅ No magic - Explicit queries, easier to debug
- ✅ Meets requirements - Aligns with project specifications
- ✅ Lightweight - Less abstraction overhead

### Negative:
- ⚠️ Less type safety than Prisma - Manual type definitions
- ⚠️ More boilerplate - Manual mapping between DB and domain
- ⚠️ No automatic relationships - Must handle joins manually
- ⚠️ More SQL knowledge required - Team needs SQL expertise

### Trade-offs:
- Less type safety, but more control and flexibility
- More boilerplate, but clearer what's happening
- Manual relationships, but explicit and understandable
- Requires SQL knowledge, but that's a valuable skill

## Implementation Details

### Repository Pattern:
```typescript
// Domain interface
interface IForecastRepository {
  findByLocationAndDate(...): Promise<Forecast | null>;
}

// Knex implementation
class ForecastRepository implements IForecastRepository {
  constructor(private db: Knex) {}
  
  async findByLocationAndDate(...) {
    const row = await this.db('forecasts')
      .where({ city, state, forecast_date })
      .first();
    
    return this.mapToDomain(row);
  }
}
```

### Type Mapping:
- Database rows use `snake_case` (PostgreSQL convention)
- Domain entities use `camelCase` (TypeScript convention)
- Mappers handle conversion between layers

### Migrations:
- All schema changes via Knex migrations
- Version-controlled in `src/infrastructure/database/migrations/`
- Can rollback and re-apply migrations

## References
- [Knex Documentation](https://knexjs.org/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

