import { describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../config/app-config';
import { DatabaseConnection } from './database-connection';

describe('database readiness', () => {
  it('connects and disconnects idempotently without reopening or destroying twice', async () => {
    const database = new DatabaseConnection(loadConfig({ NODE_ENV: 'test' }));
    const source = database.getDataSource();
    const initialize = vi.spyOn(source, 'initialize').mockImplementation(async () => {
      Object.defineProperty(source, 'isInitialized', { value: true, configurable: true });
      return source;
    });
    const destroy = vi.spyOn(source, 'destroy').mockImplementation(async () => {
      Object.defineProperty(source, 'isInitialized', { value: false, configurable: true });
    });
    await database.connect();
    await database.connect();
    expect(initialize).toHaveBeenCalledOnce();
    await database.disconnect();
    await database.disconnect();
    expect(destroy).toHaveBeenCalledOnce();
  });
  it('is unavailable before connecting and does not send queries', async () => {
    const database = new DatabaseConnection(loadConfig({ NODE_ENV: 'test' }));
    const query = vi.spyOn(database.getDataSource(), 'query');
    expect(await database.isReady()).toBe(false);
    expect(query).not.toHaveBeenCalled();
  });

  it('checks connectivity after initialization and reports query failures', async () => {
    const database = new DatabaseConnection(loadConfig({ NODE_ENV: 'test' }));
    const source = database.getDataSource();
    Object.defineProperty(source, 'isInitialized', { value: true });
    const query = vi.spyOn(source, 'query').mockResolvedValue([{ '?column?': 1 }]);
    expect(await database.isReady()).toBe(true);
    query.mockRejectedValue(new Error('connection lost'));
    expect(await database.isReady()).toBe(false);
  });
});
