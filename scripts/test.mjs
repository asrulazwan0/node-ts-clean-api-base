import { spawnSync } from 'node:child_process';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
if (!['integration', 'coverage'].includes(mode)) {
  throw new Error('Expected integration or coverage mode');
}
try {
  loadEnvFile('.env.test');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
process.env.NODE_ENV = 'test';
const args = ['run'];
if (mode === 'integration') args.push('--project', 'integration');
else args.push('--coverage');
args.push(...process.argv.slice(3));
const result = spawnSync(
  process.execPath,
  [fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url)), ...args],
  {
    stdio: 'inherit',
    env: process.env,
  },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
