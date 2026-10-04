# TypeScript Clean Architecture API Starter

A small Express API foundation with TypeScript, PostgreSQL, TypeORM, Awilix, Zod, Pino, and Vitest. Use native Node.js or Docker for development and deployment. Docker is optional when you supply PostgreSQL yourself.

**Stable baseline:** `1.0.1`. [The release checklist](docs/release-checklist.md) records verification evidence; [GitHub releases](https://github.com/asrulazwan0/node-ts-clean-api-base/releases) records published versions.

## Included

- Domain/application/infrastructure separation and dependency injection.
- One complete user-profile creation example with validation and database uniqueness.
- Explicit database migrations, structured errors, request logging, and correlation IDs.
- Liveness and database readiness endpoints, graceful shutdown, and configurable HTTP middleware.
- Native and container workflows, automated tests, quality checks, and CI configuration.

This starter has **no authentication or authorization**. The user example stores a profile, not login credentials. Queues, email, caching, file storage, and full CRUD are outside the initial scope. Review [the API specification](openapi.json) before extending the example.

## Native quickstart

Requirements: Node.js 24, npm 11, and a reachable PostgreSQL 16 database. Install/provision PostgreSQL and create a database owned by your application role first; no Docker commands are needed for this path.

```bash
git clone https://github.com/asrulazwan0/node-ts-clean-api-base.git
cd node-ts-clean-api-base
npm ci
cp .env.example .env
```

Edit `.env` with your database settings. `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` select the database. `DATABASE_URL` is not supported. Shell/deployment environment variables take precedence over values loaded from `.env`.

```bash
npm run migration:run
npm run dev
```

Source edits restart the development server. In a second terminal:

```bash
curl --fail http://localhost:3000/health/ready
curl --fail -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","name":"Example User"}'
```

A successful creation returns HTTP 201:

```json
{
  "success": true,
  "data": {
    "id": "a-generated-uuid",
    "email": "user@example.com",
    "name": "Example User",
    "createdAt": "2026-10-03T00:00:00.000Z",
    "updatedAt": "2026-10-03T00:00:00.000Z"
  }
}
```

Repeating the same email returns a conflict. Errors use `{ "success": false, "error": { "code": "...", "message": "...", "details": [] }, "requestId": "..." }`; `details` and `requestId` are optional. Invalid input is HTTP 400, duplicate email is HTTP 409, and unknown routes return JSON with HTTP 404.

For a compiled native run, stop the development server first:

```bash
npm run build
NODE_ENV=production npm run migration:run:prod
NODE_ENV=production npm start
```

These shell examples use POSIX syntax. On other shells, set `NODE_ENV` using that shell's environment syntax.

## Docker workflows

Requirements: Docker Engine and the Compose v2 plugin. The Compose configuration is a local reference deployment. Its example database credentials are **local-only**, and its database volume persists across ordinary shutdowns. Configure real deployment credentials and networking separately.

For a native API with only PostgreSQL in Docker, use the native quickstart with:

```bash
docker compose up -d db
```

Set `.env` to the Compose database's host-published address, port, database name, and credentials, then run the native migration and development commands.

For development entirely in Docker:

```bash
docker compose -f docker-compose.yml -f compose.dev.yml up --build
```

For the production image and an initially empty local database:

```bash
docker compose up --build -d
curl --fail http://localhost:3000/health/ready
docker compose logs app migrate
```

The application waits for database readiness and successful migration completion. Run only one API workflow at a time on the default port. To stop the production stack while retaining data:

```bash
docker compose down
```

For the development stack, use the same two `-f` options when stopping it. Do not add `--volumes` unless you intentionally want to delete that stack's data. See [operations](docs/operations.md) for migrations, image usage, recovery, and troubleshooting.

## Tests and quality checks

Unit and controlled HTTP tests run without PostgreSQL or Docker:

```bash
npm run check
```

Integration tests and the complete coverage run require a separate disposable PostgreSQL database. Follow [contributing](CONTRIBUTING.md), then run `npm run test:integration` and `npm run test:coverage`. Never point integration tests at development or production data.

With Docker available, run the isolated database test workflow:

```bash
npm run test:docker
```

| Command                                           | Purpose                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`                                     | Start development mode with source reload                                 |
| `npm run build` / `npm start`                     | Compile / run production JavaScript                                       |
| `npm run typecheck`                               | Check TypeScript without emitting files                                   |
| `npm run lint`                                    | Check code conventions                                                    |
| `npm run format:check` / `npm run format`         | Check / apply formatting                                                  |
| `npm run test:run`                                | Run unit tests once                                                       |
| `npm run test:http`                               | Run HTTP tests with controlled dependencies                               |
| `npm run test:integration`                        | Run tests against an explicitly selected test database                    |
| `npm run test:coverage`                           | Report coverage and enforce thresholds                                    |
| `npm run audit`                                   | Check dependencies with the documented, expiring advisory exception       |
| `npm run check`                                   | Run local checks, tests, and build                                        |
| `npm run migration:run`                           | Apply pending source migrations                                           |
| `npm run migration:run:prod`                      | Apply compiled migrations                                                 |
| `npm run migration:revert -- --allow-destructive` | Revert the latest migration outside production; explicit data-loss opt-in |
| `npm run migration:generate -- Name`              | Generate a migration for review                                           |

## Make this your project

After using this repository as a template, update the package name, description, repository/bugs/homepage URLs, author details, changelog, and documentation links. Regenerate lockfile metadata when changing package metadata. Review the license and retain required notices. Supply your own deployment configuration and private vulnerability-reporting channel.

Read [architecture and adding a feature](docs/architecture.md), [contributor guidance](CONTRIBUTING.md), [security policy](SECURITY.md), and [operations/release procedure](docs/operations.md). Maintainer implementation history lives in [development tracking](development.md); ECC is not required to use or contribute to the starter.

Dependency audit status and the current upstream exception are documented in [dependency security](docs/dependency-security.md).

Licensed under [ISC](LICENSE).
