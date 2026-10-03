# Operations and release procedure

This document describes the source starter and its buildable container. It does not claim that a public image, deployed service, or tagged release exists. [The release checklist](release-checklist.md) records actual verification and external settings.

## Configuration

Use [`.env.example`](../.env.example) as the complete supported setting reference. Local commands load `.env`; explicit environment variables take precedence. Inject production values at runtime rather than copying `.env` into an image.

| Setting                                            | Purpose                                                                     |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| `NODE_ENV`                                         | Runtime mode: development, test, or production                              |
| `PORT`                                             | HTTP listening port                                                         |
| `LOG_LEVEL`                                        | Structured logging level                                                    |
| `DB_HOST` / `DB_PORT`                              | PostgreSQL host and port                                                    |
| `DB_USERNAME` / `DB_PASSWORD`                      | PostgreSQL role credentials                                                 |
| `DB_CONNECT_TIMEOUT_MS`                            | PostgreSQL connection timeout in milliseconds                               |
| `CORS_ORIGINS`                                     | Comma-separated allowed browser origins; empty disables cross-origin access |
| `TRUST_PROXY`                                      | Trusted reverse-proxy hop count; default zero                               |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` | Per-process request limit window and maximum                                |
| `SHUTDOWN_TIMEOUT_MS`                              | Maximum HTTP draining time before forced shutdown                           |
| `DB_NAME`                                          | Application database                                                        |

`DATABASE_URL` and `DB_USER` are not supported. Database settings are validated at startup. Production requires an explicitly supplied `DB_PASSWORD`; development defaults are never silently substituted for a missing production password. A Compose service reaches PostgreSQL at its service hostname; a host process uses the host-published address. `localhost` inside an application container refers to that container, not the database service.

Configure CORS and trusted-proxy settings from `.env.example` for your actual ingress. Trust only the proxy topology you operate. CORS restricts browser behavior; it does not protect an otherwise public endpoint. The built-in rate limiter uses process-local memory, so each replica maintains its own counters. Add a shared store or upstream enforcement when a deployment requires a global limit.

The local Compose database uses convenience credentials. Replace them for real deployments, restrict database connectivity, and terminate TLS at the ingress. The starter does not configure a managed database, certificate service, or external secret manager.

## Native production process

Provision PostgreSQL and an application database. Supply environment configuration, install dependencies, and build:

```bash
npm ci
npm run build
NODE_ENV=production npm run migration:run:prod
NODE_ENV=production npm start
```

The compiled migration command must run after the build and before serving the new application version. A deployment can retain compiled output and runtime dependencies only; build tools belong in the build stage. Use a process supervisor appropriate to your deployment and route traffic only after readiness succeeds.

## Container usage

Build the production target locally:

```bash
docker build --target runtime -t clean-api:local .
```

The image contains compiled application code and production dependencies and runs as a non-root user. Its default command invokes Node directly; use the compiled Node migration command when overriding the image command. No local `.env` file is baked into the image. It receives database/network settings at runtime. The default Compose stack demonstrates database readiness, a one-shot migration service, and application startup:

```bash
docker compose up --build -d
docker compose ps
docker compose logs app migrate
```

To deploy the image with an externally managed PostgreSQL service, inject the database settings and run `node dist/infrastructure/database/cli.js run` once using the same image before starting application replicas. With an explicitly prepared production environment file and a database reachable from the container, the basic sequence is:

```bash
docker run --rm --env-file /secure/path/api.env clean-api:local node dist/infrastructure/database/cli.js run
docker run --detach --name clean-api --env-file /secure/path/api.env -p 3000:3000 clean-api:local
```

Set `PORT=3000` for this port mapping and `NODE_ENV=production` in the deployment environment. Adapt network, resource limits, restart policy, and ingress configuration to your platform. Mount/provide secret material at runtime; do not commit it.

Do not let multiple replicas race to execute migrations. A single deployment migration job should finish successfully before the application rollout. `docker compose down` retains named database volumes. Deleting volumes is destructive and is not a routine recovery step.

## Health and shutdown

- `GET /health/live`: process liveness; does not require PostgreSQL availability.
- `GET /health/ready`: database readiness; use it to decide whether to route application traffic.
- `GET /health`: compatibility alias for readiness.

A ready response is HTTP 200; unavailable readiness is HTTP 503. Poll for readiness when starting a stack rather than assuming that a running process is ready to serve requests. Health endpoints are operational probes, not a substitute for an endpoint smoke test.

On termination, the application stops accepting new traffic, drains active HTTP work within its configured shutdown timeout, and then closes the database connection. Set your platform's termination grace period longer than the application shutdown timeout. Inspect logs for forced shutdowns and in-flight request failures.

Request logs contain a correlation ID that can be matched to error responses. Do not rely on clients to provide trustworthy audit identity through that ID. Configure log retention and access policies for the data your consuming application emits.

## Migrations, backup, and recovery

Development commands:

```bash
npm run migration:generate -- DescribeChange
npm run migration:run
```

Review generated SQL, lock behavior, data transformations, and rollback consequences. Commit migrations with the code that requires them. Test on a disposable database before deployment. Schema synchronization must remain disabled.

**Existing databases:** the initial migration refuses an existing example table. A database previously created with automatic synchronization may contain credential columns or a different schema. Inspect and back up that database, decide data retention explicitly, and write a reviewed adoption migration. Do not drop the table, delete its rows, or mark an unverified migration as applied to bypass the refusal.

Before production schema changes, take a backup appropriate to the database platform and confirm that its restore procedure works. A backup command succeeding does not establish recoverability. Store backups outside the application instance and apply appropriate access and retention controls.

If a migration fails:

1. Stop the rollout and keep traffic on the compatible application version where possible.
2. Inspect the migration error and current schema/migration history. Establish whether the transaction rolled back and whether any nontransactional steps changed state.
3. Restore from a verified backup or prepare a reviewed forward repair according to the actual failure. Validate recovery on a separate database first.
4. Re-run the deployment migration step only after the schema and history are understood.

`npm run migration:revert -- --allow-destructive` reverts the latest migration when its `down` operation is supported. The CLI requires the explicit destructive-operation flag and refuses rollback when `NODE_ENV=production`. Review it before use: reverting the initial schema removes the example table and its data. A code rollback and a schema rollback are separate decisions. Do not automate destructive production rollback.

## Troubleshooting

| Symptom                                           | Check                                                                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Database connection refused                       | PostgreSQL readiness, address/port, network access, and host versus container hostname                                |
| Authentication/database does not exist            | Match role/password/database to `.env`; provision the database explicitly                                             |
| Compose credentials changed but login still fails | Existing volumes preserve PostgreSQL initialization state; changing environment values does not reset a database role |
| Relation/table missing                            | Run migrations against the same selected database as the application                                                  |
| Initial migration refuses existing table          | Follow the reviewed adoption procedure above; preserve existing data                                                  |
| Address already in use                            | Stop the other native/container API or choose a different host port                                                   |
| Integration runner refuses settings               | Use only `TEST_DB_*` settings and a disposable database name ending in `_test`                                        |
| Repeat example request returns 409                | The email already exists; use another synthetic email                                                                 |
| Production process cannot find compiled modules   | Build first; use the documented production target and commands                                                        |
| Browser cannot call API                           | Check configured CORS origins and ingress; verify separately with a direct HTTP request                               |

For Docker development, use both Compose files for `up`, `logs`, and `down`: `docker compose -f docker-compose.yml -f compose.dev.yml ...`. Only `src` is bind-mounted; dependencies stay inside the development image. If dependencies or build configuration change, rebuild with `up --build` so the image receives them.

## Preparing a release

1. Finish [the release checklist](release-checklist.md). Record the exact candidate commit and verify it from a clean checkout; a passing dirty worktree is not exact-candidate evidence.
2. Run quality checks, coverage, isolated PostgreSQL tests, and the native/Docker startup and shutdown smoke tests. Verify the corresponding remote CI checks when available. Record unsupported or untested platforms explicitly.
3. Review runtime/dependency security findings and tracked files for secrets or personal tooling. Confirm that private vulnerability reporting, branch protection, and CI permissions are configured in the hosting repository.
4. Choose a version consistent with the actual compatibility contract. Update package and lockfile versions together, move verified changelog entries into a dated version section, and update upgrade instructions. `npm version <version> --no-git-tag-version` updates package metadata without publishing or tagging.
5. Review and commit the release candidate. Re-run candidate verification if code/configuration changes after the last successful checks. Record the final commit, tool versions, commands, and results.
6. When publication is authorized, create a version tag on that verified commit and publish release notes describing behavior, compatibility, migration steps, and known limitations. Publish a container image only if an image distribution channel has been configured and verified; pin release artifacts to the candidate commit and record the image digest.
7. Verify the published source archive and any image artifact against the documented quickstart. Do not publish this source template to npm merely because it has `package.json` metadata.

The preparation steps do not publish or deploy anything. Remote push, tag/release publication, container publication, and production deployment are separate actions. Do not claim repository settings or remote CI passed when they have not been inspected.
