# ADR-003: Winston for Logging

## Status
Accepted

## Context
We need structured logging for:
- Production observability
- Debugging and troubleshooting
- Performance monitoring
- Error tracking

Common options:
- **console.log** - Simple, but not production-ready
- **Winston** - Mature, feature-rich
- **Pino** - Fast, JSON-first
- **Bunyan** - JSON logging, less popular now

## Decision
We will use **Winston** for all application logging.

### Rationale:
1. **Structured Logging** - JSON format for easy parsing
2. **Multiple Transports** - Console, file, remote logging
3. **Log Levels** - Error, warn, info, debug, verbose
4. **Production-Ready** - Battle-tested in enterprise environments
5. **Rich Ecosystem** - Many plugins and integrations

## Consequences

### Positive:
- ✅ Structured JSON logs - Easy to parse and search
- ✅ Multiple transports - Can log to console, files, or external services
- ✅ Log levels - Control verbosity per environment
- ✅ Metadata support - Add context to logs
- ✅ Widely used - Large community and support

### Negative:
- ⚠️ More complex than console.log - Requires configuration
- ⚠️ Slightly slower than Pino - But negligible for our use case
- ⚠️ More dependencies - Larger node_modules

### Trade-offs:
- More setup than console.log, but essential for production
- Slightly slower than Pino, but more features and ecosystem
- More dependencies, but provides critical observability

## Implementation Details

### Configuration:
```typescript
// Development: Pretty console output
// Production: JSON format for log aggregation
```

### Log Format:
```json
{
  "level": "info",
  "message": "Forecast retrieved",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "service": "ForecastService",
  "city": "fresno",
  "state": "california"
}
```

### Usage:
- All services log structured data
- Include context (user ID, request ID, etc.)
- Use appropriate log levels
- Never log sensitive data (passwords, tokens)

## References
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Structured Logging Best Practices](https://www.datadoghq.com/blog/log-management-best-practices/)

