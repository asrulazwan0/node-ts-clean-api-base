import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp, createAppContainer } from './app';
import { loadConfig } from './infrastructure/config/app-config';
import { DatabaseConnection } from './infrastructure/database/database-connection';
import { type Logger } from './infrastructure/logging/logger';
import { type IUserRepository } from './domain/repositories/IUserRepository';
import { Result } from './domain/shared/Result';

const logger: Logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

function fixture() {
  const config = loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' });
  const repository: IUserRepository = {
    findByEmail: vi.fn(async () => Result.success(null)),
    findById: vi.fn(async () => Result.success(null)),
    save: vi.fn(async () => Result.success(undefined)),
  };
  const database = new DatabaseConnection(config);
  vi.spyOn(database, 'isReady').mockResolvedValue(true);
  const container = createAppContainer(config, { logger, database, userRepository: repository });
  return { app: createApp(container), container, repository };
}

describe('runtime dependency injection regression', () => {
  it('serves health through the actual controller wiring', async () => {
    const { app } = fixture();
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', environment: 'test' });
  });

  it('creates a user through the actual use-case wiring', async () => {
    const { app, repository } = fixture();
    const response = await request(app).post('/users').send({
      name: 'Ada',
      email: 'ada@example.test',
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ name: 'Ada', email: 'ada@example.test' });
    expect(repository.save).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        name: 'Ada',
        email: 'ada@example.test',
      }),
    );
  });

  it('keeps liveness available when the database is unavailable', async () => {
    const { app, container } = fixture();
    vi.mocked(container.cradle.database.isReady).mockResolvedValue(false);
    expect((await request(app).get('/health/live')).status).toBe(200);
    expect((await request(app).get('/health/ready')).status).toBe(503);
    expect((await request(app).get('/health')).status).toBe(503);
  });

  it('resolves the real persistence adapter without connecting the database', () => {
    const config = loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' });
    const database = new DatabaseConnection(config);
    const connect = vi.spyOn(database, 'connect');
    const container = createAppContainer(config, { database, logger });
    expect(() => createApp(container)).not.toThrow();
    expect(connect).not.toHaveBeenCalled();
    expect(database.getDataSource().isInitialized).toBe(false);
  });

  it('imports bootstrap without listeners or process hooks', async () => {
    const signals = ['SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection'] as const;
    const before = signals.map((signal) => process.listenerCount(signal));
    const connect = vi.spyOn(DatabaseConnection.prototype, 'connect');
    const { bootstrap } = await import('./index');
    expect(bootstrap).toBeTypeOf('function');
    expect(connect).not.toHaveBeenCalled();
    expect(signals.map((signal) => process.listenerCount(signal))).toEqual(before);
    connect.mockRestore();
  });
});
