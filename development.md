# Development and release tracking

Status as of 2026-10-03: **local implementation and workflow verification complete; final candidate/remote release gates pending**.

This repository is intended to be a reusable TypeScript/Express/PostgreSQL starter with working native and Docker workflows. The initial audit found runtime and setup blockers despite a passing build and two passing tests. Those defects have been repaired; the tracker records current verification and remaining release gates.

## Documentation map

| Document                                             | Purpose                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Readiness assessment](docs/readiness-assessment.md) | Existing features, reproduced failures, source references, and verification limits         |
| [Release plan](docs/release-plan.md)                 | Scope decisions, five milestones, and the definition of release-ready                      |
| [Release launch plan](docs/release-launch-plan.md)   | GitHub inspection, candidate/stable versions, CI, template setup, and publication sequence |
| [Development workflow](docs/development-workflow.md) | Native, hybrid, Docker development/testing/production requirements and planned commands    |
| [Release checklist](docs/release-checklist.md)       | Authoritative task status, finding IDs, acceptance requirements, and evidence log          |
| [ECC workflow](docs/ecc-workflow.md)                 | Installed skill mapping and the implementation/review process                              |

Use the release checklist for the next incomplete task. M1–M4 are locally implemented and verified; final release requires an approved committed candidate, remote CI, and repository security settings.

Docker may be used for development and testing. The starter must also run directly with Node.js and PostgreSQL without requiring Docker or ECC.

## Historical checklist

The [original checklist](docs/archive/development-checklist-initial.md) is preserved unchanged for reference. Its checked boxes recorded the presence of components, not verified release behavior. Use the release checklist above for all new progress updates.
