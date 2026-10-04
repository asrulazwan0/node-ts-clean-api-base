# v1.0.1 patch release

Prepared: 2026-10-04. Status: preparation; publication authorized by the user.

## Scope

This source/template patch carries the three independently reproduced adoption findings into the public starter:

- Reject NUL in profile names at HTTP/domain boundaries and in domain email validation before repository work.
- Include the unchanged application ISC license in the production Docker image.
- Supply `logRouter(configuredMountPattern, router)` for safe complete mounted-route patterns, including nested routers, errors, and fallthrough. Existing direct routes continue using their configured patterns; consuming projects must wrap mounted routers to get complete labels.

Package/lockfile and OpenAPI versions are `1.0.1`. Dependencies, schema migrations, Node.js 24/npm 11/PostgreSQL 16 baseline, and source/template distribution remain unchanged. The task demo's business feature is not included in this starter release.

## Release gates

- [x] Focused fixes committed, independent ECC code/security review completed, and local native/Docker verification passed.
- [x] Prepare package/lockfile/OpenAPI version, README, dated changelog, and this release record.
- [ ] Push the patch branch, open a protected-branch PR, and pass all seven required CI checks.
- [ ] Merge without bypassing protection and pass all seven checks on the exact resulting main commit.
- [ ] Verify a fresh checkout of that commit with installation, native migrations/startup/smoke/shutdown, production Docker startup/smoke, NUL rejection, and exact runtime license contents.
- [ ] Tag the verified commit as `v1.0.1` and publish accurate stable GitHub release notes.
- [ ] Verify release/tag identity and the published source archive against the tagged files; run installation/quality and native/Docker adopter checks from that archive.
- [ ] Record PR, exact tag commit, CI links, archive verification, and cleanup in the repository.

The prior local repair evidence is in [the adoption audit](adoption-audit-2026-10-04.md): 104 starter tests (66 unit, 30 HTTP, 8 PostgreSQL) and 147 demo tests passed; real native/production-image HTTP and license checks passed. Remote CI and archive checks remain separate gates.

## Known limits

The existing reviewed glob-parser advisory exception expires on **2026-11-03**. `npm run audit` must continue to report zero unreviewed/expired findings; this is not a clean raw dependency audit. See [dependency security](dependency-security.md).

Full native PostgreSQL installation/runtime on macOS/Windows remains unverified. The starter is an unauthenticated API example; consuming projects must implement their own authorization and deployment policy. No npm package, registry image, or hosted application is published by this release.

## Execution evidence

Release work is in progress. Existing `v1.0.0` remains immutable.
