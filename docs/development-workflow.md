# Development and testing workflows

The native and Docker workflows are implemented. Linux verification results and final release gates are recorded in [the release checklist](release-checklist.md) and [verification evidence](verification-evidence.md). The API requires Node.js and PostgreSQL; Docker and ECC are optional for native use.

## Supported modes

| Mode               | API                       | PostgreSQL                   | Requirement                                            |
| ------------------ | ------------------------- | ---------------------------- | ------------------------------------------------------ |
| Native             | Host Node.js              | Separately supplied instance | Node 24, npm 11, reachable PostgreSQL 16               |
| Hybrid             | Host Node.js              | Compose database service     | Native tools plus Docker for the database              |
| Docker development | Development container     | Compose database service     | Docker/Compose; source reload enabled                  |
| Docker testing     | Disposable test container | Isolated PostgreSQL service  | Docker/Compose; no host dependencies or database ports |
| Docker production  | Runtime image             | Configured PostgreSQL        | Docker; migrations precede API startup                 |

Verification ran on Linux/WSL. The native API used a separately provisioned PostgreSQL 16 server; that server was provisioned in Docker for isolation. Installing a native PostgreSQL server was not part of the check. Windows/macOS CI jobs are configured but have not yet run remotely.

## npm commands

| Command                                            | Behavior                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                           | Reproducible dependency installation from the lockfile                                                        |
| `npm run dev`                                      | Load optional `.env`, start TypeScript, restart on source changes                                             |
| `npm run build`                                    | Clean and compile production source; resolve aliases; exclude tests                                           |
| `npm start`                                        | Load optional `.env` and run compiled JavaScript                                                              |
| `npm run typecheck`                                | Check source, tests, and tooling without emitting files                                                       |
| `npm run lint`                                     | Enforce code conventions and domain import boundaries                                                         |
| `npm run format:check` / `npm run format`          | Check/apply formatting                                                                                        |
| `npm run test:run`                                 | Noninteractive unit/regression suite                                                                          |
| `npm run test:http`                                | HTTP tests with controlled dependencies                                                                       |
| `npm run test:integration`                         | Migration/persistence tests on explicit isolated PostgreSQL                                                   |
| `npm run test:coverage`                            | All suites with 80% statement/branch/function/line thresholds                                                 |
| `npm run test:docker`                              | Full coverage inside a uniquely named disposable Docker project                                               |
| `npm run migration:generate -- Name`               | Generate a migration in the migrations directory; name must be alphanumeric and start with a letter           |
| `npm run migration:run` / `npm run migration:show` | Apply/check source migrations                                                                                 |
| `npm run migration:run:prod`                       | Apply compiled migrations without development dependencies                                                    |
| `npm run migration:revert -- --allow-destructive`  | Explicitly revert locally; refused in production                                                              |
| `npm run check`                                    | Formatting, lint, types, unit/HTTP tests, production build; no database needed                                |
| `npm run smoke`                                    | Verify a running API; creates synthetic profiles in the selected database                                     |
| `npm run audit`                                    | Dependency audit with the exact expiring exception described in [dependency security](dependency-security.md) |

If migration generation finds no schema difference, TypeORM reports no changes and exits 1; it does not create a dummy migration. Review generated SQL before applying it.

## Native and hybrid use

Follow [README](../README.md). Provision an empty database, copy `.env.example` to `.env`, set `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME`, then run:

```bash
npm ci
npm run migration:run
npm run dev
```

For hybrid use, `docker compose up -d db` supplies PostgreSQL; native commands are identical. Shell variables take precedence over `.env`. `DATABASE_URL` and `DB_USER` are not supported.

For production JavaScript, stop development mode, run `npm run build`, and run the compiled migration/start commands with `NODE_ENV=production`. `.env` is optional when deployment injects configuration directly.

## Docker commands

Production-shaped local stack:

```bash
docker compose up --build --wait
# Logs include a one-shot migration service.
docker compose logs app migrate
docker compose down
```

Development stack:

```bash
docker compose -f docker-compose.yml -f compose.dev.yml up --build --wait
docker compose -f docker-compose.yml -f compose.dev.yml logs app
docker compose -f docker-compose.yml -f compose.dev.yml down
```

Only `src` is bind-mounted, read-only; dependencies belong to the image and source edits trigger restart. Rebuild when dependencies or configuration files change. API/database host ports bind to loopback. Use distinct Compose project names and ports for simultaneous workflows.

Disposable tests:

```bash
npm run test:docker
```

The runner chooses a unique project, creates an isolated database without host ports/persistent volumes, propagates failures, and removes only that project's resources in cleanup. Ordinary application `down` commands preserve named volumes. Adding `--volumes` deletes data and is only appropriate for explicitly disposable stacks.

## Configuration and operational behavior

See [operations](operations.md) for every environment variable. Configuration is parsed once and shared by infrastructure. Ports, timeouts, log levels, rate limits, CORS URLs, and trusted-proxy hop counts are validated at startup.

- `/health/live` reports process liveness.
- `/health/ready` and `/health` report database connectivity as 200/503.
- Probe routes bypass business-request rate limits.
- Business failures, malformed JSON, oversized bodies, missing routes, and rate limits use JSON errors. Production responses never include stack traces.
- Each request receives a server-generated correlation ID. Logs record matched route, method, status, and duration, without request bodies, raw query strings, or credentials.
- Shutdown stops accepting traffic, drains HTTP requests, then disconnects PostgreSQL. A deadline forces connection closure and a failing exit if shutdown stalls.
- Database migrations are explicit; schema synchronization is disabled.

CORS is browser policy, not authorization. Configure trusted proxies for the actual network topology. The default rate-limit store is process-local; multiple API instances need coordinated enforcement when a global limit is required.

## Integration isolation and CI

Copy `.env.test.example` to `.env.test` and supply all five `TEST_DB_*` variables. Tests set `NODE_ENV=test`, require a database name ending in `_test`, never fall back to application `DB_*`, and refuse an existing application schema. Use synthetic data only.

The suite verifies migrations/revert/reapply, timestamp round-trips, sequential/concurrent uniqueness, database failure mapping, readiness, and the real HTTP creation flow. Unit/HTTP suites also cover wiring, configuration failures, input errors, logging/redaction, JSON 404/429, and bounded shutdown.

CI configuration runs clean installation, quality checks, isolated PostgreSQL coverage, dependency auditing, production image smoke checks, disposable Docker tests, and a local secret scan. Native unit/build jobs are configured for Linux/macOS/Windows. Remote execution remains a release gate until these files are committed and pushed.
