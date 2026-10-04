# v1.0.1 patch release

Prepared: 2026-10-04. Status: complete — latest stable GitHub source release published; exact-commit and tag-archive verification passed.

## Scope

This source/template patch carries the three independently reproduced adoption findings into the public starter:

- Reject NUL in profile names at HTTP/domain boundaries and in domain email validation before repository work.
- Include the unchanged application ISC license in the production Docker image.
- Supply `logRouter(configuredMountPattern, router)` for safe complete mounted-route patterns, including nested routers, errors, and fallthrough. Existing direct routes continue using their configured patterns; consuming projects must wrap mounted routers to get complete labels.

Package/lockfile and OpenAPI versions are `1.0.1`. Dependencies, schema migrations, Node.js 24/npm 11/PostgreSQL 16 baseline, and source/template distribution remain unchanged. The task demo's business feature is not included in this starter release.

## Release gates

- [x] Focused fixes committed, additional code/security review completed, and local native/Docker verification passed.
- [x] Prepare package/lockfile/OpenAPI version, README, dated changelog, and this release record.
- [x] Push the patch branch, open a protected-branch PR, and pass all seven required CI checks.
- [x] Merge without bypassing protection and pass all seven checks on the exact resulting main commit.
- [x] Verify a fresh checkout of that commit with installation, native migrations/startup/smoke/shutdown, production Docker startup/smoke, NUL rejection, and exact runtime license contents.
- [x] Tag the verified commit as `v1.0.1` and publish accurate stable GitHub release notes.
- [x] Verify release/tag identity and the published source archive against the tagged files; run installation/quality and native/Docker adopter checks from that archive.
- [x] Record PR, exact tag commit, CI links, archive verification, and cleanup in the repository.

The prior local repair evidence is in [the adoption audit](adoption-audit-2026-10-04.md): 104 starter tests (66 unit, 30 HTTP, 8 PostgreSQL) and 147 demo tests passed; real native/production-image HTTP and license checks passed. Remote CI and archive checks remain separate gates.

## Known limits

The existing reviewed glob-parser advisory exception expires on **2026-11-03**. `npm run audit` must continue to report zero unreviewed/expired findings; this is not a clean raw dependency audit. See [dependency security](dependency-security.md).

Full native PostgreSQL installation/runtime on macOS/Windows remains unverified. The starter is an unauthenticated API example; consuming projects must implement their own authorization and deployment policy. No npm package, registry image, or hosted application is published by this release.

## Execution evidence

PR [#12](https://github.com/asrulazwan0/node-ts-clean-api-base/pull/12) merged the patch at `28ea187ac27b635a4cb2f81034309b69e468c1a9`. Its [PR CI](https://github.com/asrulazwan0/node-ts-clean-api-base/actions/runs/37168214184) and [main CI](https://github.com/asrulazwan0/node-ts-clean-api-base/actions/runs/37168371895) both passed all seven checks, including 104 tests in PostgreSQL/container coverage.

A detached fresh checkout passed `npm ci`, `npm run check`, and `npm run audit`. Local Docker's API then stopped responding, so that local runtime attempt is incomplete. Release verification continues on isolated GitHub runners: CI now exercises compiled native migrations/startup/smoke/graceful shutdown, downloads and byte-compares its exact commit archive, runs production Docker from that archive, and checks NUL rejection plus the exact runtime license. These are equivalent acceptance checks performed independently of the local daemon. This change does not authorize restarting shared local services.

Published on 2026-10-04: [v1.0.1](https://github.com/asrulazwan0/node-ts-clean-api-base/releases/tag/v1.0.1), latest stable release, tag target **`6de7f11fe6d3149aacad9372d436bb0b675ef57b`**. Annotated tag object: `247819fff1f6b2cbe210d14d6f1ce9803cd5bcb3`. GitHub readback confirms `draft: false`, `prerelease: false`, and the exact target commit.

The permanent adopter checks landed in PR [#13](https://github.com/asrulazwan0/node-ts-clean-api-base/pull/13), after [CI 37168747531](https://github.com/asrulazwan0/node-ts-clean-api-base/actions/runs/37168747531) passed all seven checks. The final tagged main commit passed all seven checks in [CI 37168869521](https://github.com/asrulazwan0/node-ts-clean-api-base/actions/runs/37168869521). The compiled native migration/startup/real HTTP smoke/graceful shutdown step passed. The Docker job downloaded that exact commit's archive, compared every tracked file, built against fresh PostgreSQL, passed real HTTP including NUL rejection without insertion, verified the exact runtime license, and removed its owned stack.

Both the commit archive and annotated-tag archive independently passed local `npm ci`, `npm run check` (66 unit / 30 HTTP tests plus formatting/lint/types/build), and `npm run audit`. The tag archive matches all **101 tracked files** at the tag target; files and executable permissions also match the archive exercised by CI. Annotated-tag and commit archives have different top-level folder names, so their compressed hashes differ despite identical tracked contents. The published archive was downloaded again and matches the prepublication tag archive byte-for-byte.

Tag/published archive SHA-256: `1261b95fccd08af21adff3371ddf4c55b8d1f7709d4ce8cdb4916290d41cb666`. Commit archive SHA-256: `b337b35db1284406d9615e455f39730cff8a265b6d63c730a5ed7cf47ddaba85`.

Local evidence is under `/tmp`: `clean-api-v1.0.1-pr-ci.log`, `clean-api-v1.0.1-main-ci.log`, `clean-api-v1.0.1-adopter-pr-ci.log`, `clean-api-v1.0.1-final-main-ci.log`, `clean-api-v1.0.1-source-verification.log`, `clean-api-v1.0.1-archive-quality.log`, `clean-api-v1.0.1-tag-archive-quality.log`, and `clean-api-v1.0.1-archive-manifest.json`. The public CI links provide durable runtime evidence; local temporary logs are not release assets.

All owned GitHub runner stacks and processes were cleaned up. The unresponsive local verifier clients were stopped before any successful local build/start was observed. No shared local services were restarted or changed. The local Docker API remained unavailable, so local stack inspection/cleanup could not be confirmed for the attempted project `clean-api-v101-source-64b6b010`; if Docker later reports resources under that exact project, remove only those with `docker compose --env-file .env.example -p clean-api-v101-source-64b6b010 down --volumes --remove-orphans` from `/tmp/clean-api-v1.0.1-source`.

Existing `v1.0.0` remains immutable. Completion documentation after publication does not move the `v1.0.1` tag. GitHub template mode remains enabled; new projects can use the tag for a reproducible baseline or main for subsequent changes.
