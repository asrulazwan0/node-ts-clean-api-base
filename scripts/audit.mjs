import { spawnSync } from 'node:child_process';

// One reviewed upstream advisory; expiry forces maintainers to revisit it.
const reviewed = new Map([['https://github.com/advisories/GHSA-vfj7-8cjw-p6xm', '2026-11-03']]);
if (!process.env.npm_execpath) throw new Error('Run this check with npm run audit');
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'audit', '--json'], {
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
});
if (result.error) throw result.error;
let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  throw new Error('Dependency audit failed to return valid JSON');
}
if (report.error || !report.metadata || !report.vulnerabilities) {
  throw new Error('Dependency audit could not complete; check registry connectivity');
}
function advisories(name, seen = new Set()) {
  if (seen.has(name)) return [];
  seen.add(name);
  const vulnerability = report.vulnerabilities[name];
  if (!vulnerability) return [];
  return vulnerability.via.flatMap((via) =>
    typeof via === 'string' ? advisories(via, seen) : [via.url],
  );
}
const today = new Date().toISOString().slice(0, 10);
const failures = [];
const exceptions = new Set();
for (const name of Object.keys(report.vulnerabilities)) {
  const urls = advisories(name);
  if (!urls.length || urls.some((url) => !reviewed.has(url) || reviewed.get(url) < today))
    failures.push(name);
  else urls.forEach((url) => exceptions.add(url));
}
console.log(
  `Audit: ${report.metadata.vulnerabilities.total} reported dependency findings; ${failures.length} unreviewed/expired findings.`,
);
for (const url of exceptions)
  console.log(
    `Reviewed exception until ${reviewed.get(url)}: ${url} (see docs/dependency-security.md)`,
  );
if (failures.length) {
  console.error(`Dependency audit blocked: ${failures.join(', ')}`);
  process.exitCode = 1;
}
