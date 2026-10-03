# ECC implementation workflow

## Objective

Use the installed Everything Claude Code (ECC) plugin to complete [the release plan](release-plan.md), with progress recorded in [the release checklist](release-checklist.md). The documentation baseline is complete and implementation has proceeded through local runtime, database, container, and quality checks. Consult the checklist for the final candidate and external release gates.

Skill names below were checked against the installed ECC 2.2.3 catalog. They are skill identifiers, not npm scripts or guaranteed slash commands. Discover/read the applicable `SKILL.md` before applying a skill; do not require contributors to install ECC to use the resulting starter.

## Skill mapping

| Work                                                       | ECC skill                 | Expected outcome                                                |
| ---------------------------------------------------------- | ------------------------- | --------------------------------------------------------------- |
| Choose the applicable installed workflow                   | `ecc:ecc-guide`           | Verify skill availability and instructions                      |
| Fix existing broken behavior                               | `ecc:orch-fix-defect`     | Reproduction, regression test, fix, review                      |
| Consolidate established behavior after regression coverage | `ecc:orch-refine-code`    | Behavior-preserving structural cleanup                          |
| Add missing capabilities such as readiness or automation   | `ecc:orch-add-feature`    | Scoped implementation with acceptance checks                    |
| Container development/testing/production                   | `ecc:docker-patterns`     | Docker workflows consistent with native operation               |
| Schema lifecycle                                           | `ecc:database-migrations` | Reviewable migration and recovery workflow                      |
| HTTP contracts                                             | `ecc:api-design`          | Consistent validation, status codes, and API documentation      |
| Credentials, input, logs, configuration                    | `ecc:security-review`     | Review relevant attack surfaces and resolve findings            |
| Final release readiness                                    | `ecc:production-audit`    | Evidence-based release recommendation and remaining limitations |

Applied workflows include `ecc:ecc-guide`, `ecc:orch-fix-defect` with delegated regression-first implementation, `ecc:database-migrations`, `ecc:api-design`, `ecc:docker-patterns`, and `ecc:security-review`. Local final readiness evidence is recorded in the checklist; remote CI is not inferred from local success.

## Work loop

1. Read the next milestone and linked findings. Inspect current source and Git status; preserve unrelated user changes.
2. Read the selected skill. Announce its use and apply its relevant workflow within the user's authorized scope.
3. State the behavior to prove. For a defect, reproduce it with a meaningful failing test before the fix when practical.
4. Implement the smallest complete change. Docker may be used for development and test dependencies, but native operation remains a required acceptance path.
5. Run targeted checks, then the required milestone checks. Use synthetic fixtures and isolated databases. Do not reset existing databases or remove shared volumes.
6. Review the final diff for architecture, security, documentation accuracy, and maintainability.
7. Update checklist status and evidence. Mark a task complete only when its acceptance behavior is verified.
8. Continue to the next task until the release criteria are met or a concrete external prerequisite prevents progress.

Some orchestration skills delegate phases to specialist agents. Follow their current instructions when invoked, keep ownership of edits clear, and review their findings centrally. Do not invent skill capabilities or assume a hook has verified work merely because a skill is installed.

Routine implementation choices do not require repeated confirmation. Publishing, remote pushes, release/image publication, and deployment are distinct from preparing a release candidate. Follow the user's explicit scope for those actions and record any missing access or externally required approval accurately.

## Review and evidence rules

- A green compiler does not prove dependency injection or HTTP behavior.
- A container that starts does not prove its schema exists or its database is ready.
- Mock/stub results must be labeled; they cannot substitute for PostgreSQL integration evidence.
- Check both documented command paths. A Docker-only success cannot approve native support.
- Do not generate meaningless tests solely to meet coverage thresholds.
- Do not broaden the base into an authentication or infrastructure platform without updating scope.
- Do not report CI or platform checks that were not run or inspected.
- Keep this repository usable with ordinary Node/npm/PostgreSQL tooling; ECC remains a maintainer aid.

## Suggested continuation instruction

> Continue the release plan using ECC. Read `development.md` and `docs/release-checklist.md`, start at the first incomplete milestone, and work through the required implementation and verification tasks. Use Docker for isolated development/testing where useful, preserve native support, and update the evidence log after each completed task. Prepare a verified release candidate without publishing or deploying it.
