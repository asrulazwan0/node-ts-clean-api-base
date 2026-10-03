# Release readiness tracker

Last updated: 2026-10-03.

Overall status: **all readiness requirements verified; release candidate published and adopter trial passed; stable preparation in progress**.

This is the authoritative tracker. `[x]` means implemented and verified, with evidence below or in a linked record. `[ ]` means remaining, including work in progress. A file or dependency merely existing is not completion. Initial audit passes do not satisfy final release checks.

## Documentation baseline

- [x] D01 — Record the existing foundation, findings, and verification limits in [readiness-assessment.md](readiness-assessment.md).
- [x] D02 — Define scope, milestones, and release criteria in [release-plan.md](release-plan.md).
- [x] D03 — Specify native, hybrid, and Docker workflows in [development-workflow.md](development-workflow.md).
- [x] D04 — Define the ECC execution and evidence process in [ecc-workflow.md](ecc-workflow.md).
- [x] D05 — Preserve the earlier checklist as [historical material](archive/development-checklist-initial.md).

## M1 — Reliable startup

- [x] R01 — Fix Awilix injection and registration names; regression-test resolution and route execution. (F01)
- [x] R02 — Separate app/container creation from listener startup and process lifecycle; imports must not start a server. (F01, F11)
- [x] R03 — Implement native development startup, reload, aliases, and explicit local environment loading. (F02, F03)
- [x] R04 — Centralize validated configuration, align database names/defaults, resolve `DATABASE_URL`, and complete `.env.example`. (F06)
- [x] R05 — Align Node 24 support, engine/version declarations, Node types, npm lockfile, and documented prerequisites. (F14)

## M2 — Safe example and persistence

- [x] R06 — Remove credentials and unused auth scaffolding from the minimal user example; review any existing-data migration separately. (F04)
- [x] R07 — Consolidate Result/error types and repository contracts; eliminate casts concealing contract mismatches. (F08)
- [x] R08 — Correct Zod issue extraction and domain-to-HTTP mapping; standardize JSON errors, including malformed input and 404. (F07)
- [x] R09 — Add initial schema migration, CLI/data-source setup, native and compiled production migration commands; disable reliance on schema sync. (F05)
- [x] R10 — Enforce and map email uniqueness under concurrency; define normalization semantics. (F09)
- [x] R11 — Persist/reconstitute timestamps correctly without treating loaded records as newly created users. (F15)
- [x] R12 — Publish an accurate OpenAPI contract and working request/response examples. (F14)

## M3 — Docker and native operation

- [x] R13 — Provide native-only and hybrid quickstarts with verified database/migration setup. (F02, F03, F05, F14)
- [x] R14 — Provide verified Docker development with source reload and isolated container dependencies. (F13)
- [x] R15 — Provide disposable Docker test execution with exit-code propagation and isolated database cleanup. (F11, F13)
- [x] R16 — Harden production image/build context; add `.dockerignore`, exclude compiled tests, and verify a clean build. (F13)
- [x] R17 — Gate database readiness and migration completion; verify startup against an empty production database. (F05, F13)
- [x] R18 — Implement liveness/readiness checks and bounded HTTP-drain-before-database-close shutdown. (F10)
- [x] R19 — Add request correlation, safe error serialization/redaction, configurable CORS/proxy behavior, and documented rate-limit limits. (F16)

## M4 — Automated quality

- [x] R20 — Add lint, format/check, no-emit typecheck, and a documented aggregate check command. (F12)
- [x] R21 — Add meaningful domain/use-case/HTTP regression tests, including all reproduced failures. (F01, F07, F11)
- [x] R22 — Add PostgreSQL persistence, migrations, duplicate-race, and failure tests with safe test-database guards. (F05, F09, F11)
- [x] R23 — Include untested application source in coverage; define and enforce justified thresholds. (F11)
- [x] R24 — Add pull-request CI for quality checks, PostgreSQL tests, build, and production container smoke tests. (F12)
- [x] R25 — Configure dependency maintenance and appropriate dependency/secret checks; record findings and resolutions. (F12, F17)

## M5 — Public release preparation

- [x] R26 — Replace planned commands with verified native/Docker quickstarts and troubleshooting; document adding another feature. (F14)
- [x] R27 — Add ISC license text consistent with metadata, contributor guidance, and security reporting instructions. (F17)
- [x] R28 — Add issue/PR templates, supported-version policy, changelog, and a repeatable version/tag/release procedure. (F17)
- [x] R29 — Document migration recovery, backup expectations, deployment configuration, and artifact/image usage. (F05, F10)
- [x] R30 — Review template metadata and tracked files; keep personal tooling, private values, and stale instructions out of the public template. (F13, F17)
- [x] R31 — Perform final ECC security/readiness review; resolve all blockers/high-priority findings and record remaining low-risk limitations.
- [x] R32 — Verify clean-checkout native and Docker workflows on the exact release candidate; record commit, versions, commands, and results.
- [x] R33 — Verify available CI results and repository release settings; identify any external settings that remain unverified.

## Required mode evidence

| Mode                                        | Status            | Proof and limits                                                                                                               |
| ------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Native API + externally supplied PostgreSQL | Verified on Linux | Source migration, development startup/reload, HTTP smoke, compiled startup, SIGTERM exit; server supplied separately in Docker |
| Native API + Docker PostgreSQL              | Verified on Linux | Explicit host connection to isolated PostgreSQL 16; full integration suite                                                     |
| Docker development                          | Verified on Linux | Empty database, migrations, non-root API, source reload, HTTP smoke                                                            |
| Docker testing                              | Verified on Linux | Full coverage, unique disposable database, success/failure exit propagation, scoped cleanup                                    |
| Docker production                           | Verified on Linux | Empty volume, explicit migration, readiness, HTTP smoke, non-root runtime, no secrets/test/dev files                           |

A native PostgreSQL server installation and native macOS/Windows execution were not tested. CI jobs for those host platforms are configured, not claimed as passed.

## Evidence log

| Date       | Items            | Evidence                                                                                                          | Limitations                                                                                                       |
| ---------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 2026-10-03 | D01–D05          | Documentation created; original checklist archived; initial audit captured                                        | Initial runtime probes used stubs                                                                                 |
| 2026-10-03 | R01–R12, R18–R23 | Regression-first fixes, native scripts, migrations, unit/HTTP/PostgreSQL tests and comprehensive coverage         | See [verification evidence](verification-evidence.md) for commands/counts                                         |
| 2026-10-03 | R13–R17          | Native, hybrid, Docker development/testing/production workflows exercised on isolated PostgreSQL and volumes      | Linux only; no public deployment                                                                                  |
| 2026-10-03 | R24–R30          | Quality/CI configuration, pinned actions/images, dependency maintenance, license/public docs, offline secret scan | Remote CI has not run; raw audit retains one reviewed upstream advisory                                           |
| 2026-10-03 | R31, R33         | ECC security/readiness review and read-only GitHub settings inspection                                            | Candidate commit absent; private reporting disabled; template mode disabled; branch protection absent/unavailable |

For each completed implementation item, append the candidate commit or worktree context, exact commands, result, and artifact/test references. Update the relevant mode status only when that mode has been exercised. A failing check leaves the task unchecked.

## Release decision

- Verified prerelease: `v1.0.0-rc.1` at `a9f79ef063b3673da34b0dd34f70b8c03b9cb557`; stable version `1.0.0` is being prepared with unchanged runtime code.
- Required checklist items complete: 33 of 33; exact candidate and remote CI evidence recorded.
- Native and Docker workflows verified: yes on Linux, with the limits recorded above.
- Local security/readiness review complete: yes; [one expiring upstream advisory exception](dependency-security.md) remains.
- Remote release gates: candidate CI green; private reporting and template enabled; strict main protection applied (zero independent approvals for the sole-maintainer repository).
- Publishing: RC source release and archive/template trial complete; stable publication pending. Application deployment: outside scope.

Do not mark this starter release-ready until R01–R33 are verified, or a requirement is explicitly revised with a documented reason and equivalent acceptance evidence.

Candidate acceptance completed on 2026-10-03 for `49e362cb66a249118bb53416f6f8ce5f2aecfa12`; [remote CI](https://github.com/asrulazwan0/node-ts-clean-api-base/actions/runs/37128774175) and clean-checkout native/Docker evidence are in [verification evidence](verification-evidence.md). The earlier evidence table preserves the initial inspection state.
