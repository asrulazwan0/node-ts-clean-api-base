import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const name = process.argv[2];
if (!name || !/^[A-Za-z][A-Za-z0-9]*$/.test(name) || process.argv.length !== 3) {
  console.error('Usage: npm run migration:generate -- DescriptiveMigrationName');
  process.exitCode = 1;
} else {
  const result = spawnSync(
    process.execPath,
    [
      '--env-file-if-exists=.env',
      '--import',
      'tsx',
      fileURLToPath(new URL('../node_modules/typeorm/cli.js', import.meta.url)),
      'migration:generate',
      `src/infrastructure/database/migrations/${name}`,
      '-d',
      'src/infrastructure/database/migration-data-source.ts',
    ],
    { stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
