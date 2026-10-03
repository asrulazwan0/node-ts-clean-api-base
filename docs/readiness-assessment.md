# Starter readiness assessment

Assessment date: 2026-10-03. Baseline: commit `b4244c2` plus the working-tree changes present during review.

**Verdict: not ready for a stable, immediately reusable starter release.** The architecture is a useful foundation, but the documented startup path and implemented endpoints do not work as promised. This assessment records the initial evidence; task completion belongs in [the release checklist](release-checklist.md).

## Purpose and scope

Provide a reusable TypeScript, Express, PostgreSQL, and TypeORM API starter. A new project should be able to install, configure, migrate, run, test, build, and deploy it using documented commands. Both Docker and native Node.js operation are first-class requirements.

The review covered local source, configuration, package scripts, documentation, build output, tests, and isolated runtime probes. It did not verify a full Docker deployment, a real PostgreSQL integration flow, GitHub repository settings, dependency vulnerability status, or the complete Git history for secrets.

## Existing foundation

| Area                 | Included                                                                   | Initial condition                                       |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| Runtime              | TypeScript strict mode, Express 5, CommonJS, path aliases                  | Compilation passes                                      |
| Architecture         | Domain, application, infrastructure, use cases, repository adapter, mapper | Separation exists; duplicate contracts remain           |
| Dependency injection | Awilix registrations                                                       | Constructor and injection styles do not match           |
| Persistence          | PostgreSQL driver, TypeORM connection and user entity                      | No migration lifecycle                                  |
| API                  | `POST /users`, `GET /health`                                               | Runtime wiring causes failures                          |
| Validation           | Zod schemas and domain rules                                               | Error details and HTTP mapping are inconsistent         |
| Errors               | Result types and global middleware                                         | Two Result implementations and several response formats |
| Logging              | Pino, development pretty printing, request duration                        | No request correlation or explicit redaction policy     |
| Security             | Helmet, CORS, rate limiting                                                | Middleware exists; credentials are unsafe               |
| Operations           | Signal handlers, health controller                                         | Shutdown ordering and readiness are incomplete          |
| Containers           | Multi-stage Dockerfile, non-root runtime, Compose PostgreSQL               | Fresh production database setup is incomplete           |
| Tests                | Vitest and V8 coverage                                                     | Two domain tests; no HTTP or database integration suite |
| Automation           | Build/start/test scripts                                                   | No checked-in CI, lint, format, or release workflow     |
| Documentation        | README and environment example                                             | Setup and API examples are inaccurate                   |

Login, password-change, and user-update schemas or methods are present, but corresponding HTTP features are not implemented. There is no complete authentication or CRUD subsystem.

## Verified evidence

| Check                                               | Observation                                                                       |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `npm run build`                                     | Passed on Node 24.13.1 and npm 11.8.0                                             |
| `npm run test:run`                                  | Two tests passed in one test file                                                 |
| `npm run test:coverage`                             | 51.16% statement coverage over the two reported files; not whole-project coverage |
| Compiled app with a database stub                   | `GET /health` and valid `POST /users` returned 500                                |
| Invalid user request                                | Returned 400 without field-level issues                                           |
| Direct Awilix repository resolution                 | Failed with `Could not resolve 'getDataSource'`                                   |
| Creation use case with a repository stub            | Original password passed unchanged to persistence                                 |
| Domain password-change probe                        | Incorrect current password accepted; this method is not exposed by a route        |
| Whitespace-only name with manually wired controller | Domain rejection became HTTP 500                                                  |
| Unknown route                                       | Returned Express's default HTML 404                                               |
| Build output inspection                             | Test files were compiled into `dist`                                              |

Database stubs isolated runtime wiring without touching a real database. These checks do not establish PostgreSQL or container correctness.

## Findings

| ID  | Priority            | Finding and consequence                                                                                                                                                                     | Source                                                                                                                                                                                                                                                                                       |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | Blocker             | Awilix defaults to proxy injection, but constructors expect individual dependencies. `database` also differs from the repository parameter `databaseConnection`. Endpoints fail at runtime. | [Composition root](../src/index.ts), [repository](../src/infrastructure/repositories/typeorm-user.repository.ts)                                                                                                                                                                             |
| F02 | Blocker             | `dev` only watches compilation; the following alias command normally never runs, and no server starts.                                                                                      | [Package scripts](../package.json)                                                                                                                                                                                                                                                           |
| F03 | Blocker             | No supplied command or application loader reads `.env`. Copying the example does not configure the process as documented.                                                                   | [README](../README.md), [bootstrap](../src/index.ts)                                                                                                                                                                                                                                         |
| F04 | Blocker             | Plaintext passwords flow into the database entity. The password-change method does not verify the stored password.                                                                          | [Use case](../src/application/user/use-cases/create-user-use-case.ts), [mapper](../src/infrastructure/mappers/user.mapper.ts), [entity](../src/domain/entities/User.ts)                                                                                                                      |
| F05 | Blocker             | Compose uses production mode, which disables synchronization, but there are no migrations to create a fresh schema.                                                                         | [Database](../src/infrastructure/database/database-connection.ts), [Compose](../docker-compose.yml)                                                                                                                                                                                          |
| F06 | Blocker             | Validated configuration uses `DB_USER`, persistence reads `DB_USERNAME`, and `DATABASE_URL` is unused. Defaults differ; database settings are absent from `.env.example`.                   | [Configuration](../src/infrastructure/config/app-config.ts), [environment example](../.env.example)                                                                                                                                                                                          |
| F07 | High                | Validation middleware reads `error.errors` instead of Zod's `issues`. Domain failures can become 500; HTTP errors have incompatible formats.                                                | [Validation middleware](../src/infrastructure/middleware/validation.middleware.ts), [controller](../src/infrastructure/http/controllers/user-controller.ts)                                                                                                                                  |
| F08 | High                | Two Result implementations and incompatible repository contracts make extension ambiguous. Broad `any` casts conceal mismatches.                                                            | [Domain Result](../src/domain/shared/Result.ts), [utility Result](https://github.com/asrulazwan0/node-ts-clean-api-base/blob/b4244c2/src/utils/result.ts), [interface](../src/domain/repositories/IUserRepository.ts), [active contract](../src/domain/user/repositories/user-repository.ts) |
| F09 | High                | Duplicate-email precheck does not map a concurrent database uniqueness violation to a predictable conflict.                                                                                 | [Use case](../src/application/user/use-cases/create-user-use-case.ts), [repository](../src/infrastructure/repositories/typeorm-user.repository.ts)                                                                                                                                           |
| F10 | High                | Health checks do not check database readiness. Shutdown disconnects the database before draining HTTP requests and has no deadline.                                                         | [Health controller](../src/infrastructure/http/controllers/health-controller.ts), [bootstrap](../src/index.ts)                                                                                                                                                                               |
| F11 | High                | Two happy-path domain tests miss bootstrap, HTTP, persistence, migration, and failure behavior. Coverage excludes unexercised application files.                                            | [Tests](../src/domain/user/entities/User.test.ts), [Vitest configuration](https://github.com/asrulazwan0/node-ts-clean-api-base/blob/b4244c2/vitest.config.ts)                                                                                                                               |
| F12 | High                | No CI workflow, lint/format checks, or verified release procedure is checked in.                                                                                                            | Repository inventory                                                                                                                                                                                                                                                                         |
| F13 | High                | No `.dockerignore`; `COPY . .` includes local files such as `.env` in the builder context. Database startup is not health-gated.                                                            | [Dockerfile](../Dockerfile), [Compose](../docker-compose.yml)                                                                                                                                                                                                                                |
| F14 | Medium              | README advertises Node 18 although installed test tooling requires newer versions. API example omits required fields and shows a different response.                                        | [README](../README.md), [package](../package.json)                                                                                                                                                                                                                                           |
| F15 | Medium              | `updatedAt` is not persisted and is recreated when loading a domain user.                                                                                                                   | [Domain entity](../src/domain/entities/User.ts), [database entity](../src/infrastructure/database/entities/user.entity.ts), [mapper](../src/infrastructure/mappers/user.mapper.ts)                                                                                                           |
| F16 | Medium              | CORS/proxy policy, logging correlation/redaction, and scaling limits of in-memory rate limiting are undocumented.                                                                           | [Bootstrap](../src/index.ts), [logging](../src/infrastructure/logging/logger.ts)                                                                                                                                                                                                             |
| F17 | Release requirement | ISC is declared, but license text, contributor guidance, security reporting instructions, and a release history are missing.                                                                | [Package](../package.json), repository inventory                                                                                                                                                                                                                                             |

Priority describes release impact, not a claim that every issue is remotely exploitable. Existing uncommitted work must be preserved during implementation.

## Technical references

- [Awilix injection modes](https://github.com/jeffijoe/awilix#injection-modes): proxy versus positional constructor injection.
- [Zod error documentation](https://zod.dev/error-customization): validation details are available through `issues`.
- [TypeORM migrations](https://typeorm.io/docs/migrations/why/): managing schema changes explicitly.

## Tracking

The [release checklist](release-checklist.md) maps each finding to actionable work and required evidence. The [initial development checklist](archive/development-checklist-initial.md) is preserved only as history; its checked boxes are not release verification.
