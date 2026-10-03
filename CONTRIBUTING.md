# Contributing

Use Node.js 24 and npm 11 with the committed lockfile. PostgreSQL 16 is the initial database baseline. Follow either quickstart in [README.md](README.md); Docker is optional for the application and required only for the container workflows.

## Development loop

1. Create a focused branch and describe the user-visible behavior you are changing.
2. Add or adjust meaningful tests for behavior changes. Keep domain tests independent of HTTP and PostgreSQL.
3. Follow [the architecture guide](docs/architecture.md), update the API specification when contracts change, and add reviewed migrations when schema changes.
4. Run `npm run format`, then `npm run check`.
5. Run `npm run test:docker` for database changes or use the native integration path below. Run `npm run test:coverage` with that isolated database configured; complete coverage includes PostgreSQL integration tests. Container/configuration changes also need their documented Docker startup smoke test.
6. Open a pull request describing the problem, resulting behavior, verification, and any migration or compatibility implications.

Do not commit `.env` files, credentials, personal tool configuration, dependencies, build output, or coverage reports. Commit changes to `package-lock.json` alongside dependency changes. Test fixtures must use synthetic data.

## Database tests

Unit and HTTP tests do not need PostgreSQL. Integration tests require an explicitly selected disposable database and refuse ordinary application configuration. Copy `.env.test.example` to `.env.test` and set `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_USERNAME`, `TEST_DB_PASSWORD`, and `TEST_DB_NAME`. Provision that separate database first. Its name must end in `_test`. The integration command loads `.env.test` only, sets `NODE_ENV=test`, and never falls back to application `DB_*` credentials. Explicit environment variables take precedence.

```bash
cp .env.test.example .env.test
# Edit .env.test for a separately provisioned disposable database.
npm run test:integration
```

The exact integration environment variables and Docker test commands are documented in [development workflows](docs/development-workflow.md). The Docker runner uses its own Compose project/database and propagates test failures. Never remove a development or production volume to make a test pass.

## Review expectations

Keep validation, domain rules, application orchestration, and persistence responsibilities separate. Use the shared Result/error contract for expected failures, avoid dependency injection casts that conceal mismatches, and keep infrastructure dependencies out of the domain. Add regression coverage for fixes, especially around input validation, uniqueness, failure mapping, migrations, and request lifecycle.

Document checks that could not run. A compilation pass does not establish runtime or database correctness. Do not mark release checklist items verified without evidence from the required workflow. CI results, repository settings, and supported platforms should be reported accurately.

## Maintenance and compatibility

The initial supported baseline is Node.js 24, npm 11, and PostgreSQL 16. Other Node/PostgreSQL major versions and package managers are not part of the initial verification contract. Platform verification is recorded in [the release checklist](docs/release-checklist.md); POSIX command examples do not constitute Windows/macOS test evidence.

Maintainers target the latest published release; no older release line or response-time commitment is implied. Record API/schema/environment changes and upgrade steps in [CHANGELOG.md](CHANGELOG.md).

Review dependency update pull requests through the full relevant CI checks. Group routine compatible updates where useful, but review runtime/database major updates explicitly. A dependency scan is one input to review, not proof that the application is secure.

Report suspected vulnerabilities through [SECURITY.md](SECURITY.md), not a public issue containing exploit details or secrets. The maintainer release procedure is in [operations](docs/operations.md).
