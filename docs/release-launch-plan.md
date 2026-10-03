# First public release launch plan

Prepared: 2026-10-03. Status: execution authorized by the user on 2026-10-03; candidate preparation and verification in progress.

This document plans publication of the implemented starter. [Release scope](release-plan.md) defines its features; [the readiness tracker](release-checklist.md) remains authoritative for acceptance. The current local implementation candidate is `48a6812` on `release/starter-readiness`.

## Repository inspection

Checked with GitHub CLI on 2026-10-03:

| Item                                  | Observed status                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Repository                            | [asrulazwan0/node-ts-clean-api-base](https://github.com/asrulazwan0/node-ts-clean-api-base), public |
| Git remote                            | `origin`, pointing to that repository                                                               |
| Remote branches                       | Only `main`; local candidate has not been pushed                                                    |
| Tags / GitHub releases / Actions runs | None returned                                                                                       |
| Template mode                         | Disabled                                                                                            |
| Private vulnerability reporting       | Disabled                                                                                            |
| Main branch protection                | API returned 404; absent or unavailable                                                             |
| License detection                     | Empty remotely; ISC license is present in the local candidate                                       |

The current remote description claims production readiness before candidate verification. Replace it during release preparation with: “A tested TypeScript and Express API starter with PostgreSQL, clean architecture, native development, and Docker workflows.”

## Release identity and distribution

- Product name: **TypeScript backend API starter template**.
- Initial distribution: GitHub template repository and versioned source archives.
- Proposed trial release: `v1.0.0-rc.1`, marked as a GitHub prerelease.
- Proposed stable release: `v1.0.0`, after the candidate checks and trial acceptance pass.
- Supported baseline: Node.js 24, npm 11, PostgreSQL 16.
- Container: users build the provided Dockerfile; a public image registry is deferred.
- npm publication: excluded; `private: true` remains intentional for a source template.

The user approved proceeding with this version sequence on 2026-10-03. Existing package metadata `1.0.0` does not establish a prior stable release. The first release notes must explain the profile-only API, changed configuration/error contracts, and safe handling of existing databases.

## Execution sequence

### 1. Prepare and review the release branch

- [x] Review/commit this launch plan and select the proposed version sequence.
- [x] Set package and lockfile versions to `1.0.0-rc.1` with `npm version 1.0.0-rc.1 --no-git-tag-version`.
- [x] Move verified changelog entries into a dated release-candidate section; retain compatibility notes and the advisory exception.
- [x] Run checks affected by metadata/documentation changes and commit the candidate preparation.
- [ ] Push `release/starter-readiness` and open a pull request against `main`.

The current CI configuration runs for `pull_request`, pushes to `main`, and manual dispatch. A branch push alone does not trigger it. Opening the PR supplies the candidate CI run; publishing is not part of this step.

### 2. Complete candidate verification

- [ ] Inspect all seven CI checks: Quality and PostgreSQL; native tests on Ubuntu, macOS, and Windows; Production container smoke; Isolated container tests; Secret scan.
- [ ] Fix failures in small focused commits and inspect the new checks.
- [ ] From a clean checkout of the exact candidate, verify native startup/migrations/smoke/shutdown and Docker development/source reload. Use isolated PostgreSQL and scoped cleanup.
- [ ] Record full commit SHA, CI run links, versions, commands, outcomes, and remaining platform limits in [verification evidence](verification-evidence.md).
- [ ] Complete R32 only when its exact-candidate acceptance evidence exists.

A green native test/build matrix does not establish PostgreSQL installation or full runtime smoke on macOS/Windows. Keep those limits explicit unless separately exercised. The final main/tag commit must have passing corresponding checks; do not tag a newer unverified commit.

### 3. Configure the public repository

- [ ] Enable template mode and verify GitHub displays “Use this template.”
- [x] Enable private vulnerability reporting; verify its status and update [SECURITY.md](../SECURITY.md).
- [ ] Set the accurate repository description above; confirm GitHub detects the ISC license after the candidate lands.
- [ ] Configure a rule protecting `main`: require PR review and the successful CI checks; prevent force pushes/deletion. Confirm exact check names from real runs and maintainer access before applying the rule.

These are repository-setting changes and require authorization. A 404 inspection result alone does not establish which protection features the account can configure.

### 4. Publish and try the release candidate

- [ ] Merge only after required candidate checks and review pass; inspect CI for the resulting `main` commit.
- [ ] Recheck [the dependency exception](dependency-security.md) at publication time. Its current deadline is 2026-11-03; an expired exception or new finding blocks this plan until reviewed/resolved.
- [ ] Draft release notes covering purpose, stack, example API, native/Docker quickstarts, compatibility, verification limits, and the exact advisory exception.
- [ ] With explicit publication authorization, tag the verified commit `v1.0.0-rc.1` and publish it as a prerelease.
- [ ] Download its source archive and follow both documented startup modes from a fresh directory.
- [ ] Create a disposable repository through “Use this template” and verify initialization, environment examples, migrations, tests, and build. Delete only that owned trial repository after approval or retain it as a documented example.

The trial validates what a new adopter receives, including template-specific setup. Record findings in issues and focused follow-up commits rather than changing an already published tag.

### 5. Promote to the first stable release

- [ ] Resolve every release-blocking trial issue; do not expand scope with optional authentication or business features.
- [ ] Update package/lockfile to `1.0.0`, finalize its dated changelog, and update security/version documentation.
- [ ] Review and commit the stable preparation; run the required checks on its exact commit.
- [ ] Confirm R01–R33 and the repository release settings are complete; record any explicitly accepted limitations.
- [ ] With publication authorization, tag the verified commit `v1.0.0` and publish the GitHub release.
- [ ] Verify the published source archive, release notes, template entry point, and native/Docker quickstarts; record links and commit SHA.

## Release notes outline

1. What this template provides and the supported stack.
2. How to start with native Node/PostgreSQL or Docker.
3. The user-profile example and its OpenAPI contract.
4. Migrations, test/quality commands, and CI verification.
5. Compatibility and existing-database adoption instructions.
6. Known dependency exception, verification limits, and security-reporting link.

## Authorization boundaries

The user approved executing this source release plan on 2026-10-03, including candidate commits, branch push/PR, repository settings, and verified GitHub releases. Do not publish before the required evidence exists. Registry publication and application deployment remain outside scope.

## Execution evidence

2026-10-03: owner-scoped GitHub credentials verified with ADMIN access. Template mode enabled, accurate description applied, and private vulnerability reporting enabled (API reports `enabled: true`). `npm run check` passed for release-candidate preparation (64 unit and 15 HTTP tests, formatting, lint, types, build). These are current changes; the inspection table above preserves the pre-execution snapshot.
