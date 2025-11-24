# ADR-002: Zod for Validation

## Status
Accepted

## Context
We need a validation library for:
- Request validation (query params, request body)
- Type inference for TypeScript
- Runtime type safety at API boundaries
- Clear error messages for validation failures

Common options:
- **class-validator** - Decorator-based, popular in NestJS
- **Zod** - Schema-first, TypeScript-first
- **Joi** - Mature, widely used
- **Yup** - Similar to Joi, TypeScript support

## Decision
We will use **Zod** for all validation at API boundaries.

### Rationale:
1. **Type Inference** - Automatically generates TypeScript types from schemas
2. **TypeScript-First** - Built specifically for TypeScript projects
3. **Composability** - Easy to combine and reuse schemas
4. **Developer Experience** - Excellent error messages and IDE support
5. **Runtime Safety** - Validates at runtime, not just compile time

## Consequences

### Positive:
- ✅ Type inference eliminates duplicate type definitions
- ✅ Single source of truth (schema = type)
- ✅ Better error messages than class-validator
- ✅ No decorators needed (works with plain objects)
- ✅ Easy to test (schemas are just functions)

### Negative:
- ⚠️ Newer library - Smaller ecosystem than class-validator
- ⚠️ Less common in enterprise Node.js projects
- ⚠️ Requires learning Zod API (though intuitive)

### Trade-offs:
- Less familiar to some developers, but better DX
- Smaller ecosystem, but sufficient for our needs
- Newer library, but actively maintained and growing

## Implementation Details

### Example Usage:
```typescript
// Define schema
const getForecastQuerySchema = z.object({
  city: z.string().min(1),
  state: z.string().min(1),
  date: z.string().optional(),
});

// Infer type
type GetForecastQuery = z.infer<typeof getForecastQuerySchema>;

// Validate
const result = getForecastQuerySchema.parse(req.query);
```

### Validation Middleware:
- Validates request data against Zod schemas
- Returns field-level error messages
- Stores validated data in `req.validated` for controllers

## References
- [Zod Documentation](https://zod.dev/)
- [TypeScript-first validation](https://github.com/colinhacks/zod)

