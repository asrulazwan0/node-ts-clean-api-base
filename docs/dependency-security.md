# Dependency security review

Reviewed: 2026-10-03. Revisit by: 2026-11-03.

## Current findings

Updating the lockfile within the declared supported dependency ranges removed the previously reported critical and other independent findings. `npm audit` still reports seven high-severity dependency entries arising from one upstream advisory, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), in `braces <=3.0.3`. No patched release was available from the npm registry at review time.

The affected chain reaches `awilix` through its module auto-discovery dependencies and reaches the development build tool `tsc-alias` through its file-discovery dependencies.

## Reachability assessment

The advisory requires attacker-controlled deeply nested glob/brace patterns. This starter registers Awilix dependencies explicitly and does not call `loadModules` or `listModules`. HTTP input is validated as a fixed user profile and is never passed to a glob parser. TypeScript alias rewriting operates only on maintainer-controlled source files/build configuration.

This is a reviewed, time-limited exception for the current use of those packages, not a patched dependency or a clean raw audit. Untrusted repositories/build configurations and future code that passes client-controlled patterns to module discovery fall outside this assessment. Review this exception immediately if the dependency usage changes.

## Automated check

`npm run audit` reads the registry audit result, allows only this exact advisory URL until the review deadline, and fails for every other advisory, expired exception, malformed report, or registry error. CI runs the same command. `npm audit` remains available to inspect the full raw findings and exits nonzero while this advisory is present.

Keep the committed lockfile and weekly dependency updates. Remove the exception when upstream ships a verified fix, or replace the affected dependency path if its use changes. Do not add blanket exclusions or weaken the check to ignore all high findings.
