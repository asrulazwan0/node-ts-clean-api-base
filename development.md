# Development and release tracking

Status as of 2026-10-03: **candidate verified locally and in GitHub CI; source publication/adopter trial in progress**.

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

Use the release checklist for the next incomplete task. R01–R33 are complete for the committed candidate with passing remote CI and verified repository settings. Follow the release launch plan for publication and adopter trial.

Docker may be used for development and testing. The starter must also run directly with Node.js and PostgreSQL without requiring Docker or ECC.

## Historical checklist

The [original checklist](docs/archive/development-checklist-initial.md) is preserved unchanged for reference. Its checked boxes recorded the presence of components, not verified release behavior. Use the release checklist above for all new progress updates.
