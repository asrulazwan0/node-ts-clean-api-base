# Local verification evidence

Date: 2026-10-03. Context: working tree based on `b4244c2`, including the authorized starter-readiness changes. The initial evidence below was gathered before the local candidate commit. Subsequent candidate/remote verification is recorded at the end of this document.

Initial local evidence supports implementation readiness. The candidate verification section records the exact-commit evidence satisfying R32.

## Environment

- Linux/WSL host, Node.js 24.13.1, npm 11.8.0.
- Docker Engine 26.1.4 and Compose v2.27.1.
- Pinned Node image reports Node.js 24.21.0; pinned PostgreSQL image reports PostgreSQL 16.15.
- All databases, ports, and Compose projects used for checks were disposable and separate from pre-existing services.

## Commands and results

| Check                                     | Result                                                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm run check`                           | Format, lint, source/tooling types, unit/HTTP tests, clean production compilation passed                   |
| `TEST_DB_* npm run test:coverage`         | 86 tests passed; statements 92.08%, branches 89.16%, functions 93.58%, lines 91.40%                        |
| `npm run test:docker`                     | 84-test full PostgreSQL coverage passed in the non-root test image; disposable project removed             |
| Source migration run/show                 | Initial migration applied to empty isolated database; reported all migrations applied                      |
| Migration generation on equivalent schema | Reported no differences and exited 1, the documented TypeORM behavior; no dummy migration created          |
| Native TypeScript development             | API smoke and source reload passed; API ran on host with externally supplied PostgreSQL                    |
| Compiled native process                   | API smoke and successful SIGTERM exit passed                                                               |
| Production Compose on a fresh volume      | Migration completed before API startup; readiness healthy; API smoke passed                                |
| Development Compose on a fresh volume     | Migration completed; API smoke/source reload passed; dependencies stayed in image                          |
| Production image inspection               | UID 1000; no `.env`, test output, TypeScript compiler, or tsx in runtime                                   |
| `npm run audit`                           | Passed with only the exact reviewed/expiring advisory; raw `npm audit` still reports seven related entries |
| Offline Gitleaks history scan             | Nine commits and the clean candidate source scanned; no leaks found                                        |
| YAML/OpenAPI/local Markdown checks        | YAML parses; API JSON references/paths resolve; all local links in 15 Markdown documents resolve           |

The smoke script creates synthetic profiles and verifies liveness, readiness, successful creation, duplicate conflict, invalid input, and JSON 404. Unit/HTTP tests additionally verify malformed/oversized requests, correlation/redaction, rate limits, configuration errors, and bounded lifecycle behavior. PostgreSQL tests verify migration refusal/adoption safety, revert/reapply, timestamps, uniqueness races, and outages.

The final 86-test native/candidate run includes two additional configuration regression cases added after the 84-test Docker run. The final runtime image was rebuilt with that configuration change.

The first Docker test attempt exposed non-root write permissions and returned exit 1 with successful scoped cleanup. After fixing ownership, the same workflow passed; this also proved failure propagation.

## ECC review

`ecc:orch-fix-defect` was used for regression-first implementation with delegated runtime and persistence work. `ecc:database-migrations`, `ecc:api-design`, `ecc:docker-patterns`, and `ecc:security-review` supplied the implementation/review lenses. The initial/final readiness assessment follows `ecc:production-audit`.

No remaining locally reproduced runtime/data-integrity blocker was found after the fixes. The unresolved glob-parser advisory has no patched release and is not reachable from HTTP input under the current explicit registration/build setup; its narrowly scoped exception expires on 2026-11-03. See [dependency security](dependency-security.md). This is not a clean raw dependency audit.

## Initial external repository inspection

Read-only GitHub inspection found:

- Repository public; default branch `main`.
- Template mode disabled.
- Private vulnerability reporting disabled; no alternative private contact verified.
- Branch protection query returned 404 (absent or unavailable).
- No remote workflow runs were available for this candidate.
- Remote license detection was empty before the new local ISC license file is pushed.

Pinned checkout/setup-node commit references were checked against their official repositories. CI workflows are present locally, but Ubuntu/macOS/Windows remote jobs are not reported as passed. Enabling template/private reporting and choosing branch protections need an authorized repository change; candidate CI needs a remote push, which has not been authorized.

## Final source snapshot

A clean copy containing 97 repository files was installed with `npm ci` without host dependencies or build output. `npm run check` and the full PostgreSQL coverage suite passed there. Migration, `.env` loading, compiled startup, HTTP smoke, and graceful shutdown were also verified from that copy; its Docker runtime build was verified separately.

Implementation SHA-256: `a57306ff103ddd20fb78463efd106112d5778e146cb2d5a0bc7225550e7edb08`. The manifest covers 86 implementation/configuration/root-public-document files; `docs/*` and `development.md` are excluded so evidence can be appended without changing the implementation identity. Temporary verification directory: `/tmp/clean-api-candidate-ukay7lxw`. Base commit: `b4244c2df53e81e8f0804436f1f131ac757b4e3a`.

The snapshot does not replace an immutable candidate commit or GitHub CI results. The user authorized a local commit on 2026-10-03. The candidate is the commit containing this record on `release/starter-readiness`; resolve its exact ID with `git log -1 --format=%H`. R32 still requires candidate verification and remote CI results; push approval is separate.

## Verification cleanup

The production container stopped gracefully with exit code 0. Both owned production/development Compose projects and their disposable volumes were removed, as was the standalone verification database. Other existing services were left running. All 86 implementation/configuration/root-public-document files still match the verified source snapshot.

## Committed release-candidate verification

Candidate: `49e362cb66a249118bb53416f6f8ce5f2aecfa12` (`1.0.0-rc.1`), PR [#1](https://github.com/asrulazwan0/node-ts-clean-api-base/pull/1). [CI run 37128774175](https://github.com/asrulazwan0/node-ts-clean-api-base/actions/runs/37128774175) completed successfully with all seven checks: quality/PostgreSQL, Ubuntu/macOS/Windows native tests, production Docker smoke, isolated Docker tests, and history secret scan. PostgreSQL and Docker coverage each passed all 86 tests. Coverage differs slightly by Node/V8 environment; all four enforced thresholds passed. The audit policy passed with seven entries from the single reviewed advisory and no unreviewed/expired findings.

A clean detached checkout of this exact commit passed `npm ci`, `npm run check`, and full coverage (86 tests; 92.08% statements, 89.16% branches, 93.58% functions, 91.40% lines). Source migrations and native development smoke/reload passed. Compiled production startup read the checkout's synthetic `.env`, smoke passed, and SIGTERM exited 0. Docker development applied migrations to an empty owned volume, reached readiness, and passed smoke before/after source reload. All owned test containers/volumes were removed.

Repository settings are now verified: template enabled; private vulnerability reporting enabled; accurate description applied. Main protection requires PRs, all seven strict CI checks, and conversation resolution, including for admins; force pushes/deletion disabled. There is only one administrator and no independent reviewer, so the required approval count is zero. Add an approval requirement when another reviewer is available. No protection was bypassed for candidate verification.

Native tests/types/build are verified remotely on macOS and Windows. Full PostgreSQL installation/runtime startup on those platforms remains untested. Public tags/releases are a later step, after final merge checks and source-archive/template trial.

## Published prerelease and adopter trial

`v1.0.0-rc.1` was published on 2026-10-03 at verified main commit `a9f79ef063b3673da34b0dd34f70b8c03b9cb557` after [main CI 37129280420](https://github.com/asrulazwan0/node-ts-clean-api-base/actions/runs/37129280420) passed. GitHub detects the ISC license. [Prerelease](https://github.com/asrulazwan0/node-ts-clean-api-base/releases/tag/v1.0.0-rc.1).

The downloaded GitHub source archive and a project generated through GitHub's template API each passed `npm ci`, `npm run check` (64 unit and 15 HTTP tests plus formatting/lint/types/build), and native/Docker smoke. Each production Compose stack applied migrations to a fresh owned volume and reached readiness; the native development process loaded its own synthetic `.env`, ran migration commands, and passed HTTP smoke against that independently supplied PostgreSQL. All owned processes, containers, and volumes were cleaned up. No trial blocker was found.

Private validation repository: `asrulazwan0/node-ts-clean-api-base-release-validation-20261003`. It is retained privately as an archived verification record, with Actions disabled; no user repository was deleted. New adopters must replace package/repository/security metadata as described in README.

Stable preparation promotes the same runtime source to package version `1.0.0`, updates release/security/contributor documentation, and requires fresh CI on its reviewed commit. Final stable tag/CI/archive evidence will be recorded after publication.

## Stable release completion

Published on 2026-10-03: [v1.0.0](https://github.com/asrulazwan0/node-ts-clean-api-base/releases/tag/v1.0.0), tag target `c2acdfaf3ec1cf6df8c1457244b5e907a335c3c4`. The stable PR [#10](https://github.com/asrulazwan0/node-ts-clean-api-base/pull/10) passed [CI 37129823104](https://github.com/asrulazwan0/node-ts-clean-api-base/actions/runs/37129823104); the resulting tagged main commit passed all seven checks in [CI 37129975818](https://github.com/asrulazwan0/node-ts-clean-api-base/actions/runs/37129975818), including the 86-test PostgreSQL/container suites.

The published stable source archive matched every tracked file at the tag, installed with `npm ci`, and passed `npm run check`. Native development environment loading/migrations/HTTP smoke and fresh-volume Docker production migration/readiness/HTTP smoke passed from that archive. Owned processes, containers, and volumes were cleaned up. The previously verified template generation remains applicable: runtime/tooling/container/CI source is unchanged, and GitHub's template entry point now serves the stable main branch.

R01–R33 and the launch sequence are complete. Post-release tracker updates change only documentation and do not move the published tag. Native PostgreSQL installation/runtime smoke on macOS/Windows is still unverified, and the documented advisory exception still expires on 2026-11-03. No npm package, registry image, or application deployment was published.
