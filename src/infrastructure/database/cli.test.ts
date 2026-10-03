import { afterEach, describe, expect, it, vi } from 'vitest';
import { runMigrationCommand } from './cli';
import { createDataSource } from './data-source';

vi.mock('./data-source', () => ({ createDataSource: vi.fn() }));

function fixture(initialized = true) {
  const source = {
    isInitialized: initialized,
    initialize: vi.fn(async () => undefined),
    destroy: vi.fn(async () => undefined),
    runMigrations: vi.fn(async () => [{ name: 'CreateUsers' }]),
    undoLastMigration: vi.fn(async () => undefined),
    showMigrations: vi.fn(async () => false),
  };
  vi.mocked(createDataSource).mockReturnValue(
    source as unknown as ReturnType<typeof createDataSource>,
  );
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('DB_PASSWORD', 'injected-test-value');
  return source;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('migration command safety', () => {
  it.each([[], ['unknown'], ['run', '--unknown']])(
    'rejects invalid arguments %j before connecting',
    async (...args) => {
      const source = fixture();
      await expect(runMigrationCommand(args.flat())).rejects.toThrow('Usage');
      expect(source.initialize).not.toHaveBeenCalled();
    },
  );
  it('requires explicit local consent for destructive revert', async () => {
    const source = fixture();
    await expect(runMigrationCommand(['revert'])).rejects.toThrow('--allow-destructive');
    expect(source.initialize).not.toHaveBeenCalled();
    await runMigrationCommand(['revert', '--allow-destructive']);
    expect(source.undoLastMigration).toHaveBeenCalledWith({ transaction: 'all' });
    expect(source.destroy).toHaveBeenCalledOnce();
  });
  it('refuses production rollback even with the flag', async () => {
    const source = fixture();
    vi.stubEnv('NODE_ENV', 'production');
    await expect(runMigrationCommand(['revert', '--allow-destructive'])).rejects.toThrow(
      'prohibited',
    );
    expect(source.initialize).not.toHaveBeenCalled();
  });
  it('applies pending migrations transactionally and closes the connection', async () => {
    const source = fixture();
    await runMigrationCommand(['run']);
    expect(source.runMigrations).toHaveBeenCalledWith({ transaction: 'all' });
    expect(source.destroy).toHaveBeenCalledOnce();
  });
  it.each([true, false])('reports migration status when pending=%s', async (pending) => {
    const source = fixture();
    source.showMigrations.mockResolvedValue(pending);
    await runMigrationCommand(['show']);
    expect(console.log).toHaveBeenCalledWith(
      pending ? 'Pending migrations exist' : 'All migrations applied',
    );
    expect(source.destroy).toHaveBeenCalledOnce();
  });
  it('closes persistence after a failed migration', async () => {
    const source = fixture();
    source.runMigrations.mockRejectedValue(new Error('failed migration'));
    await expect(runMigrationCommand(['run'])).rejects.toThrow('failed migration');
    expect(source.destroy).toHaveBeenCalledOnce();
  });
  it('does not destroy an uninitialized connection after failed startup', async () => {
    const source = fixture(false);
    source.initialize.mockRejectedValue(new Error('cannot connect'));
    await expect(runMigrationCommand(['run'])).rejects.toThrow('cannot connect');
    expect(source.destroy).not.toHaveBeenCalled();
  });
});
