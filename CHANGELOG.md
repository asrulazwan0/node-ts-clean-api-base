# Changelog

Changes are recorded here before a release is tagged. The existing package version is not evidence of a published or verified stable release. See [the release checklist](docs/release-checklist.md) for implementation and verification status.

## Unreleased

### Fixed

- Reject NUL characters in profile names at HTTP/domain boundaries and in domain email validation before persistence.
- Include the unchanged ISC application license in the production Docker image.
- Provide safe mounted-router completion logging through `logRouter`, including nested routes, errors, and fallthrough.

Regression and PostgreSQL verification for these adoption findings are tracked in [the adoption audit](docs/adoption-audit-2026-10-04.md). These changes are committed locally and await remote CI and a patch release.

## 1.0.0 — 2026-10-03

The first stable source/template baseline promotes the verified `1.0.0-rc.1` application without changing runtime behavior. Release-candidate CI, native/Docker checks, published archive, and template adoption evidence are recorded in [verification evidence](docs/verification-evidence.md). The tagged stable commit passed all seven GitHub checks; its published archive passed native/Docker adoption checks.

The features, fixes, compatibility notes, and dependency exception below apply to this stable baseline. No npm package, public registry image, or hosted application is distributed.

## 1.0.0-rc.1 — 2026-10-03

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
- Full native PostgreSQL installation/runtime smoke on macOS and Windows is unverified; native tests/types/build pass in CI on those platforms.

### Compatibility notes

- The user example accepts `email` and `name`; credentials and authentication scaffolding are outside the starter's scope.
- `DB_USERNAME` is the database username setting. `DB_USER` and `DATABASE_URL` are not supported configuration aliases.
- Database schema changes require migrations; automatic schema synchronization is disabled.
- Existing databases created through automatic synchronization require a reviewed adoption migration and data-retention decision. Do not drop tables or data to force the initial migration to run.
- HTTP clients must use the documented success/error envelopes in [the API specification](openapi.json).

This release candidate establishes the first verified baseline. Consult the release tracker for candidate CI and publication evidence.
