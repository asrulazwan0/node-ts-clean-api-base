# Architecture and extending the starter

The starter keeps business rules independent of Express and TypeORM. A complete example creates a user profile with an email address and display name. It is not an authentication account and stores no password.

## Responsibilities

| Layer                                 | Owns                                                                    | Does not own                                 |
| ------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------- |
| Domain (`src/domain`)                 | Entities, invariants, shared Result/error types, repository contracts   | Express requests, SQL, environment variables |
| Application (`src/application`)       | Use cases that orchestrate domain behavior and repository calls         | HTTP status codes, TypeORM queries           |
| Infrastructure (`src/infrastructure`) | HTTP adapters, validation, persistence, mapping, configuration, logging | Independent copies of business rules         |
| Composition/startup                   | Dependency wiring, listener startup, process lifecycle                  | Business decisions                           |

An HTTP request passes through request correlation/logging and validation into a controller. The controller invokes a use case. The use case works with domain entities and a repository interface; the infrastructure repository persists data with TypeORM. The HTTP adapter maps the shared error contract into the public JSON envelope.

Domain results are internal contracts. The public response format is defined by [OpenAPI](../openapi.json); do not create competing response conventions in individual controllers. Expected conflicts should have stable error codes. Unexpected failures must be logged safely and return a generic response.

Application composition is separate from listener startup so tests can construct the application with controlled dependencies without opening ports or installing process handlers. Dependency registrations and constructor injection must use one consistent Awilix style. Keep wiring visible and cover the production composition in regression tests.

## Add a feature

For example, to add a project-creation endpoint:

1. Define a domain `Project` entity, its invariants, and a minimal repository contract. Return shared typed errors for expected invalid states.
2. Implement an application use case that accepts input and depends on that repository interface. Unit-test the domain rules and use-case decisions with an in-memory repository.
3. Add a TypeORM entity, mapper, and repository implementation. Preserve stored identity and timestamps when reconstituting entities. Translate database constraint failures into appropriate shared errors.
4. Generate and review a migration using `npm run migration:generate -- AddProjects`. Run it against a disposable database and verify both schema and persistence behavior. Include migration files in the change.
5. Add a Zod request schema, controller, and route. Reject NUL (`U+0000`) in text destined for PostgreSQL in both the request schema and domain invariants. Validate the transport input and rely on domain invariants for business correctness. Map expected errors through the common HTTP mechanism.
6. Register the use case, repository, and controller in the application's dependency container. Add an HTTP test proving the route resolves and executes through that wiring.
7. Update [OpenAPI](../openapi.json), add a working request example, and test malformed input, domain rejection, persistence failure, and applicable uniqueness races.
8. Run contributor checks and database integration tests. Record migration/compatibility notes in the changelog.

Choose dependency names deliberately; a constructor parameter and its container registration must agree under the selected injection style. Do not cast through `any` to silence a wiring mismatch.

## Mounted route logging

Wrap mounted routers with `logRouter` from `src/infrastructure/middleware/request-logger.middleware.ts`:

```typescript
app.use('/projects', logRouter('/projects', projectsRouter));
```

Pass the configured mount pattern. For a nested router mounted under `/teams/:teamId/projects`, pass that full pattern to its wrapper. Completion logs then record `/teams/:teamId/projects/:id`, preserving route parameters as placeholders. Never pass `req.baseUrl`, `req.originalUrl`, or other request input as the pattern: those can contain identifiers and secrets. Direct application routes keep their configured patterns; unwrapped routers retain Express's local route pattern.

The wrapper captures patterns before router context unwinds, including forwarded errors. Nested wrappers preserve the innermost complete pattern, and a router that falls through leaves later routes' logging intact. Request IDs, generic errors, and omission of raw URLs, query strings, headers, and bodies remain part of the logging contract.

## Persistence boundaries

Database uniqueness is the final authority. A pre-insert lookup may improve an error message but cannot prevent two concurrent requests from racing. Keep a database constraint and translate its violation predictably.

Migrations are the schema lifecycle in every environment. Automatic synchronization is disabled. Existing auto-synchronized databases need an explicit reviewed adoption plan; see [operations](operations.md). The initial migration is for an empty schema and refuses an existing example table.

Keep test data isolated. Unit and HTTP tests use controlled dependencies; PostgreSQL integration tests prove behavior that mocks cannot, including constraint errors, transaction behavior, migrations, and timestamp round-trips.

## Scope and extension decisions

Authentication, authorization, queues, email, caching, file storage, and additional CRUD operations are project decisions. Add them when a consuming project needs them. Do not treat the example's `/users` route as a protected account-management endpoint.

Configuration is validated once and shared with infrastructure. Avoid reading `process.env` independently inside repositories or controllers. Logging should use the common logger and request identifier; never serialize entire requests, authorization values, or database credentials.
