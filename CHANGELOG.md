# Changelog

Changes are recorded here before a release is tagged. The existing package version is not evidence of a published or verified stable release. See [the release checklist](docs/release-checklist.md) for implementation and verification status.

## Unreleased

### Added

- Standardized the supported baseline on Node.js 24, npm 11, and PostgreSQL 16.
- Native startup/source reload, Docker development, isolated PostgreSQL testing, and a non-root production image.
- Profile-only user creation, typed results, consistent JSON errors, explicit migrations, database readiness, and bounded graceful shutdown.
- Contributor/security/architecture/operations documentation, ISC license text, OpenAPI specification, pinned CI actions/images, and dependency maintenance.
- Meaningful unit, HTTP, and PostgreSQL regression coverage with enforced 80% coverage thresholds.

### Fixed

- Awilix runtime wiring failures and the development script that did not start a server.
- Environment loading and inconsistent database configuration names.
- Validation issue extraction, duplicate-email races, timestamp rehydration, and HTTP shutdown ordering.
- Removed plaintext password handling and unused authentication scaffolding from the example.

### Known limitations

- One unpatched upstream glob-parser advisory has a reviewed, expiring exception; see [dependency security](docs/dependency-security.md).
- Remote CI and repository release settings must be verified on the committed candidate before publication.

### Compatibility notes

- The user example accepts `email` and `name`; credentials and authentication scaffolding are outside the starter's scope.
- `DB_USERNAME` is the database username setting. `DB_USER` and `DATABASE_URL` are not supported configuration aliases.
- Database schema changes require migrations; automatic schema synchronization is disabled.
- Existing databases created through automatic synchronization require a reviewed adoption migration and data-retention decision. Do not drop tables or data to force the initial migration to run.
- HTTP clients must use the documented success/error envelopes in [the API specification](openapi.json).

Before tagging, replace this preparation entry with the actual verified changes, selected release version/date, and any additional upgrade instructions.
