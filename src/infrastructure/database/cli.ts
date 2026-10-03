import { loadConfig } from '../config/app-config';
import { createDataSource } from './data-source';

export async function runMigrationCommand(args: string[]): Promise<void> {
  const [command, ...flags] = args;
  if (
    !['run', 'revert', 'show'].includes(command ?? '') ||
    flags.some((flag) => flag !== '--allow-destructive')
  ) {
    throw new Error('Usage: migration <run|show|revert> [--allow-destructive]');
  }
  const config = loadConfig();
  if (
    command === 'revert' &&
    (config.NODE_ENV === 'production' || !flags.includes('--allow-destructive'))
  ) {
    throw new Error(
      'Revert is prohibited in production and requires --allow-destructive in development/test. Use a forward migration in production.',
    );
  }
  const source = createDataSource(config);
  try {
    await source.initialize();
    if (command === 'run') {
      const migrations = await source.runMigrations({ transaction: 'all' });
      console.log(`Applied ${migrations.length} migration(s)`);
    } else if (command === 'revert') {
      await source.undoLastMigration({ transaction: 'all' });
      console.log('Reverted last migration');
    } else {
      console.log(
        (await source.showMigrations()) ? 'Pending migrations exist' : 'All migrations applied',
      );
    }
  } finally {
    if (source.isInitialized) await source.destroy();
  }
}

if (require.main === module) {
  runMigrationCommand(process.argv.slice(2)).catch(() => {
    console.error(
      'Migration command failed. Verify command, database settings, connectivity, and schema history. Revert requires --allow-destructive and is prohibited in production.',
    );
    process.exitCode = 1;
  });
}
