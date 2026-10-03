import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

// A unique project owns its entire disposable test database lifecycle.
const project = `clean-api-test-${randomUUID().slice(0, 8)}`;
const args = ['compose', '-p', project, '-f', 'compose.test.yml'];
let exitCode = 1;
try {
  const result = spawnSync(
    'docker',
    [...args, 'up', '--build', '--abort-on-container-exit', '--exit-code-from', 'test'],
    { stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  exitCode = result.status ?? 1;
} finally {
  const cleanup = spawnSync('docker', [...args, 'down', '--volumes', '--remove-orphans'], {
    stdio: 'inherit',
  });
  if (cleanup.error) console.error(cleanup.error.message);
  if (cleanup.status !== 0) exitCode = 1;
}
process.exitCode = exitCode;
