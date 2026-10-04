# Independent task-demo adoption audit

Date: 2026-10-04. Verdict: **functional reuse confirmed; A01–A03 fixed and verified locally**.

The original audit below describes demo commit `19e63cc`. The subsequent repair and verification are recorded in the follow-up section; the published `v1.0.0` tag remains unchanged.

The demo is a working task-tracker API built on the released starter. Independent execution confirmed installation-era dependency consistency, quality checks, real PostgreSQL tests, native and Docker HTTP behavior, persistence across restarts, and Docker development source reload. This supports the starter's reuse claim within its documented scope. It does not establish a complete authenticated production product.

## Scope and provenance

- Demo: `/home/hyperzecter/projects/starter-task-demo`.
- Audited demo commit: `19e63cc` (`feat: adopt v1.0.0 starter as verified task tracker demo`).
- Starter ancestor: `c2acdfaf3ec1cf6df8c1457244b5e907a335c3c4`, the exact `v1.0.0` tag target.
- Demo Git history is preserved and its working tree was clean before and after review.
- The audit used ECC's `production-audit` evidence/risk lenses, scoped to adoption and runtime verification.
- No demo source, committed evidence, configuration, dependency versions, or thresholds were changed. Builds wrote only ignored output; the reload probe touched a source file's modification time without changing its content.
- No remote writes, commits, publication, deployment, or changes to unrelated services were performed by this audit.

## What was actually added

The demo implements task creation, listing, retrieval, partial update, and deletion through a Task domain entity, repository contract, application use cases, TypeORM adapter, controller/router, and explicit migration. It reuses the existing Awilix container, app composition, Zod middleware, error handling, Pino logging, database connection, and operational lifecycle.

The dependency lockfile differs only in project-name metadata. Existing tests were retained; migration expectations/cleanup were adjusted for the added migration, and task tests were added. Coverage settings, thresholds, database safety guards, CI, Compose workflows, and startup scripts remain unchanged. Extending the shared error union with `NOT_FOUND` required updating the existing user-controller mapping; this is an ordinary feature extension.

The demo also improved runtime packaging by copying `LICENSE` into the production image. The original starter README and ISC notice were preserved. Its OpenAPI contains the original routes and both task paths, with all 35 local schema references resolving.

## Independent verification

| Check                       | Observed result                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check` in the demo | Passed formatting, lint, types, 72 unit tests, 41 HTTP tests, and build                                                               |
| `npm run test:docker`       | Passed 123 tests in 16 files against fresh isolated PostgreSQL; success exit and scoped cleanup                                       |
| Container coverage          | Statements 95.12%, branches 92.61%, functions 94.35%, lines 94.64%; original 80% thresholds retained                                  |
| `npm run audit`             | Seven entries from the existing reviewed advisory, zero unreviewed/expired findings                                                   |
| Fresh production Compose    | Empty owned database migrated; readiness healthy; task CRUD and invalid-input/404 behavior passed over real HTTP                      |
| Docker restart              | A saved task, including both timestamps, survived API-container restart unchanged                                                     |
| Native compiled Node        | Real HTTP CRUD/validation passed against independently supplied PostgreSQL; saved task survived replacement of the entire API process |
| Native shutdown             | SIGTERM exited 0                                                                                                                      |
| Docker development          | Fresh database/migrations, healthy API, watched source restart, readiness, and persisted-task equality after reload passed            |
| Cleanup                     | All owned test containers/volumes and native processes removed; unrelated services preserved                                          |

The native/production runtime probe performed 49 real HTTP requests. The separate development probe independently filled the Docker-development verification gap that the demo's original verification record explicitly disclosed.

Local independent artifacts are under `/tmp`: `starter-task-demo-independent-docker.log`, `starter-task-demo-independent-runtime.log`, `starter-task-demo-independent-http.json`, `starter-task-demo-independent-runtime-result.json`, `starter-task-demo-independent-native.log`, `starter-task-demo-independent-dev.log`, `starter-task-demo-independent-dev-result.json`, and `starter-task-demo-independent-input-result.json`. These are local evidence, not published artifacts.

## Findings and follow-up tracker

### A01 — Reject NUL input before persistence (P2, starter and demo)

- [x] Add input/domain validation and meaningful regression coverage for unpersistable NUL characters in profile names and task titles.

Independently reproduced against a fresh database and real native listener:

```json
POST /tasks
{"title":"NUL\u0000title"}
```

```json
POST /users
{"email":"unique-audit@example.test","name":"NUL\u0000name"}
```

Both returned HTTP **500** with the safe `INTERNAL_ERROR` envelope. Validation accepts these strings and the failure is caught during insertion. Reject this input with HTTP **400** and `VALIDATION_ERROR` before querying persistence. The existing user schema/domain/repository are unchanged from the starter, so the profile-name gap is inherited by `v1.0.0`; the task-title gap is in the new feature. No stack, credentials, or database details were exposed in either response.

References: demo `src/application/validation/taskSchemas.ts:2`; starter `src/application/validation/userSchemas.ts:6`; relevant domain validation and repository insertion paths.

### A02 — Include the application license in the runtime image (P2, starter packaging)

- [x] Carry the demo's runtime `LICENSE` copy into the starter and verify the final image contains the unchanged notice.

The released starter Dockerfile copies `package.json` but not the application `LICENSE` into its final runtime stage. The demo changed this to `COPY --chown=node:node package.json LICENSE ./`. This is a concrete packaging improvement to carry upstream; it did not repair runtime behavior or introduce a dependency.

References: starter `Dockerfile:32`; demo `Dockerfile:32` and its recorded image inspection.

### A03 — Identify mounted routes in request logs (P3, starter observability)

- [x] Log a safe route pattern including the router mount, without raw URLs or query strings.

The starter logger records only `req.route?.path`. Task routes mounted at `/tasks` therefore appear as `/` or `/:id`, losing the resource prefix. This is visible in the demo's recorded server logs and follows from the unchanged logger code. It will become ambiguous as more routers are added. Preserve the current request ID and redaction behavior while recording patterns such as `/tasks/:id`.

Reference: starter `src/infrastructure/middleware/request-logger.middleware.ts:17`; demo `verification/native-server.log`.

## Interpretation and limits

No repair to starter startup, dependency injection, migration discovery, native execution, Docker workflows, or test infrastructure was needed to build the demo. The functional starter claim is supported by observed behavior, with the findings above addressed by the local follow-up below.

The demo intentionally excludes authentication, ownership, and pagination. Those are consuming-project requirements rather than failures of the requested task-demo scope. This audit did not run remote CI for the demo, native PostgreSQL installation, macOS/Windows runtime, load tests, or a production deployment. Native APIs ran on this Linux/WSL host with PostgreSQL supplied separately in Docker.

The existing dependency advisory exception remains a limitation; its deadline is 2026-11-03. A passing policy audit is not a clean raw dependency audit. The historical release checklist remains the record of checks performed for `v1.0.0`; A01–A03 track newly identified adoption feedback.

## Repair verification — 2026-10-04

The repairs are on local `fix/adoption-hardening` branches in both repositories. Remote `main` and the published `v1.0.0` release have not been updated. No package version, dependency resolution, schema migration, or coverage threshold changed.

A01 now rejects NUL at the HTTP and domain boundaries. Profile domain email validation also rejects NUL; task creation and partial updates share the title invariant. Invalid input returns `400 VALIDATION_ERROR` with a field detail before repository work. Real PostgreSQL tests confirm no rejected profile is inserted and a rejected task update leaves the entire stored record unchanged. Unicode and line breaks remain accepted in task titles. OpenAPI request and response schemas declare the NUL restriction.

A02 copies the application `LICENSE` into the starter's final runtime image. Fresh images for both projects contain byte-for-byte copies of their source license and run as UID 1000. The demo already included this file and required no Dockerfile repair.

A03 introduces `logRouter(configuredMountPattern, router)`. The demo mounts its task router through this wrapper. It records complete configured patterns, never actual mount URLs. Tests cover nested parameterized mounts, parameter-validation errors, forwarded errors, fallthrough, direct routes, unmatched requests, aliases, root mounts, trailing slashes, and request correlation. Future routers must use this wrapper with their full configured pattern; see [architecture](architecture.md#mounted-route-logging).

The initial regression runs failed as expected: three starter input cases and eight demo input/logging cases. A fresh pre-fix runtime image failed to read `/app/LICENSE` with `ENOENT`. Independent ECC code/security review caught a root/trailing-slash pattern defect; three additional regressions failed before the correction. The reviewer independently reran all 13 logging regressions in each project and approved the final diff.

| Final check                                                   | Starter                                                                                | Task demo                                                                                                                                      |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                                               | Passed; 66 unit / 30 HTTP tests, format/lint/types/build                               | Passed; 76 unit / 59 HTTP tests, format/lint/types/build                                                                                       |
| `npm run test:docker`                                         | 104 tests in 15 files, including 8 PostgreSQL tests                                    | 147 tests in 17 files, including 12 PostgreSQL tests                                                                                           |
| Container coverage: statements / branches / functions / lines | 92.50% / 89.28% / 92.94% / 92.14%                                                      | 95.23% / 92.42% / 94.69% / 95.00%                                                                                                              |
| Compiled native HTTP against fresh PostgreSQL                 | NUL profile rejected with 400; valid profile created with 201; SIGTERM exit 0          | Profile/title rejection with 400; valid Unicode/line-break title persisted; rejected patch preserved record; safe mounted logs; SIGTERM exit 0 |
| Fresh production image over real HTTP                         | Same profile behavior; read-only filesystem, UID 1000, exact license copy; stop exit 0 | Same profile/task behavior and safe mounted logs, including invalid UUIDs; read-only filesystem, UID 1000, exact license copy; stop exit 0     |
| `npm run audit`                                               | Seven entries from reviewed advisory; zero unreviewed/expired findings                 | Same result                                                                                                                                    |
| Cleanup                                                       | Owned test containers, PostgreSQL, networks, and native processes removed              | Same result                                                                                                                                    |

The first combined runtime probe lost database connectivity after changing Docker network attachments. Its failure log is retained; the corrected harness uses one owned network throughout and passed both projects without an application change for that harness issue.

Local evidence: `/tmp/starter-hardening-red.log`, `/tmp/demo-hardening-red.log`, `/tmp/starter-hardening-mount-red.log`, `/tmp/starter-hardening-image-before.log`, `/tmp/starter-hardening-check.log`, `/tmp/demo-hardening-check.log`, `/tmp/starter-hardening-docker.log`, `/tmp/demo-hardening-docker.log`, `/tmp/starter-hardening-image.log`, `/tmp/demo-hardening-image.log`, `/tmp/starter-hardening-audit.log`, `/tmp/demo-hardening-audit.log`, `/tmp/adoption-hardening-runtime-initial.log`, `/tmp/adoption-hardening-runtime.log`, and `/tmp/adoption-hardening-runtime-result.json`. Native/container request logs are `/tmp/{starter,demo}-hardening-native.log` and `/tmp/{starter,demo}-hardening-runtime-docker.log`. These local files are not release assets.

Local source commits: starter `031e13b` (validation), `dd0ceff` (logging), and `9b9de2e` (runtime license); demo `208ea6e` (validation) and `4e8980f` (logging). Documentation is committed separately so these implementation changes remain focused.

Next release work: submit the starter patch through its protected-branch PR/CI process, and publish a verified patch release. The existing dependency advisory exception and earlier platform-verification limits still apply.
