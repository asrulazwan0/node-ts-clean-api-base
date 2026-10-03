# Stable starter release plan

Status: core implementation completed locally; final candidate and repository release gates remain. See the release checklist for verified evidence and pending work.

## Product contract

A new project using this stack can start from this repository without repairing framework wiring, inventing a database lifecycle, or depending on the author's machine. Docker is supported for development, testing, and production packaging. Native Node.js with a separately supplied PostgreSQL instance is equally supported and does not require Docker.

The source of truth for progress is [release-checklist.md](release-checklist.md). Initial evidence is in [readiness-assessment.md](readiness-assessment.md).

## Scope decisions

| Decision         | Direction for implementation                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Stack            | Retain TypeScript, Express, PostgreSQL, TypeORM, Awilix, Zod, Pino, and Vitest                                                         |
| Runtime          | Standardize on Node 24 for the initial supported baseline; align types, engine declaration, version file, container, and CI            |
| Package manager  | npm with committed lockfile and reproducible `npm ci`; do not claim other package managers are verified                                |
| Architecture     | Domain/application/infrastructure with one repository contract and one Result/error model                                              |
| Example resource | Keep one complete user-profile creation example; remove password fields and unused authentication scaffolding from the minimal release |
| Authentication   | Optional future extension; do not ship plaintext credentials or advertise login support                                                |
| Database schema  | Explicit migrations in every supported workflow; no dependency on automatic synchronization                                            |
| Environment      | One validated configuration object shared by infrastructure; document every supported variable                                         |
| Distribution     | A source/template repository with an optional container artifact; npm package publication is not required                              |
| Version          | Select an honest first verified release version; existing `1.0.0` metadata is not evidence of a validated release                      |

The user-profile decision keeps the base small while eliminating unsafe authentication examples. Any existing database containing credentials requires an explicit migration/data-retention decision before removing columns; never discard existing data automatically.

Authentication, RBAC, queues, Redis, email, file storage, billing, multi-tenancy, Kubernetes, and a full CRUD generator are outside the initial release. Adding them must not delay a reliable core.

## Milestones

### M1 — Reliable startup

Fix injection, application composition, environment loading, configuration, and development scripts. Separate application creation from process startup so tests can instantiate the app without opening a real listener or registering global handlers. Support automatic restart on source edits and runtime path aliases.

Exit: native development starts through documented commands, required invalid configuration fails clearly, and runtime wiring is covered by regression tests.

### M2 — Safe example and persistence

Remove credential handling from the default example, consolidate contracts, standardize API errors, add initial migrations, resolve duplicate-email races, and persist timestamps accurately. Document the actual request/response contract with an OpenAPI specification and a working request example.

Exit: a fresh PostgreSQL database can migrate and serve a successful create request; invalid input, duplicate requests, and persistence failures produce the documented behavior.

### M3 — Native and Docker parity

Implement the workflow matrix in [development-workflow.md](development-workflow.md). Add container development/test targets or services, a minimal production runtime, build-context exclusions, database readiness gating, liveness/readiness endpoints, and bounded graceful shutdown.

Exit: native-only, hybrid, and Docker workflows pass their smoke tests without relying on an existing database volume, local build output, or host `node_modules`.

### M4 — Automated verification

Add lint, formatting, type checks, unit/HTTP/database tests, comprehensive coverage configuration, and pull-request CI. Test migrations on an empty database and upgrades where applicable. Exercise the production build and container over HTTP.

Exit: a clean checkout passes the same checks locally and in CI. Passing domain tests alone cannot approve a release.

### M5 — Open-source release preparation

Complete the quickstart, architecture/extension guide, troubleshooting, license text, contribution and security guidance, changelog, release procedure, dependency maintenance, and final ECC review.

Exit: all required checklist items have evidence; no unresolved blocker or high-priority finding remains. Record the exact candidate commit and verification results.

## Definition of release-ready

- A newcomer can follow the README from a clean checkout in either native or Docker mode.
- The same application and migrations run in both modes; Docker-specific assumptions do not leak into application code.
- Tests prove the example API's successful and failed behavior against PostgreSQL.
- Credentials are absent from the minimal example, and logs/errors do not expose secrets.
- Production startup, readiness, shutdown, migration, and recovery behavior are documented and verified.
- All automated release checks pass on the candidate commit; public documentation matches that commit.
- License and contributor/security documentation are present.

Release-ready means the candidate is prepared and verified. Publishing a release, pushing commits, publishing images, or deploying are separate external actions and must follow the user's instructions at that stage.

## Execution

Use [ecc-workflow.md](ecc-workflow.md) for skill selection and evidence recording. Work in milestone order; keep changes reviewable and preserve unrelated local work. Resolve routine implementation details without repeated confirmation. Record material scope changes and their reasons here.
