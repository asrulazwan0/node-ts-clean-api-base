// TypeORM dynamically requires discovered TS migrations outside Vitest's transformer.
import 'tsx/cjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp, createAppContainer } from '../src/app';
import { loadConfig } from '../src/infrastructure/config/app-config';
import { DatabaseConnection } from '../src/infrastructure/database/database-connection';
import { TypeOrmUserRepository } from '../src/infrastructure/repositories/typeorm-user.repository';
import { User } from '../src/domain/entities/User';
import { CreateUsers1780000000000 } from '../src/infrastructure/database/migrations/1780000000000-CreateUsers';

// Never fall back to application DB_* settings. This suite owns its dedicated test DB.
const required = [
  'TEST_DB_HOST',
  'TEST_DB_PORT',
  'TEST_DB_USERNAME',
  'TEST_DB_PASSWORD',
  'TEST_DB_NAME',
];
if (
  process.env.NODE_ENV !== 'test' ||
  required.some((key) => !process.env[key]) ||
  !process.env.TEST_DB_NAME?.endsWith('_test')
) {
  throw new Error(
    'Integration tests require NODE_ENV=test, explicit TEST_DB_HOST/PORT/USERNAME/PASSWORD and TEST_DB_NAME ending in _test.',
  );
}
const config = loadConfig({
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  DB_HOST: process.env.TEST_DB_HOST,
  DB_PORT: process.env.TEST_DB_PORT,
  DB_USERNAME: process.env.TEST_DB_USERNAME,
  DB_PASSWORD: process.env.TEST_DB_PASSWORD,
  DB_NAME: process.env.TEST_DB_NAME,
  RATE_LIMIT_MAX_REQUESTS: '1000',
});
const database = new DatabaseConnection(config);
const source = database.getDataSource();
const repository = new TypeOrmUserRepository(database);
const app = createApp(createAppContainer(config, { database, userRepository: repository }));
let ownsSchema = false;

beforeAll(async () => {
  await source.initialize();
  // Refuse a database containing application tables, even with a _test suffix.
  const existing: unknown[] = await source.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'migrations'",
  );
  if (existing.length)
    throw new Error(
      'Integration database must be empty; refusing to erase existing application tables.',
    );
  await source.runMigrations();
  ownsSchema = true;
}, 15000);

afterAll(async () => {
  if (!source.isInitialized) return;
  if (ownsSchema) await source.undoLastMigration();
  await source.destroy();
});

describe('PostgreSQL migration and API lifecycle', () => {
  it('applies initial migration once and supports local revert/reapply', async () => {
    expect(await source.runMigrations()).toEqual([]);
    await source.undoLastMigration();
    expect(await source.showMigrations()).toBe(true);
    expect(await source.runMigrations()).toHaveLength(1);
    const columns: { column_name: string }[] = await source.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'",
    );
    expect(columns.map((column) => column.column_name).sort()).toEqual([
      'createdAt',
      'email',
      'id',
      'name',
      'updatedAt',
    ]);
  });
  it('refuses to adopt an existing users table', async () => {
    const runner = source.createQueryRunner();
    try {
      await expect(new CreateUsers1780000000000().up(runner)).rejects.toThrow();
    } finally {
      await runner.release();
    }
  });
  it('preserves domain timestamps when rehydrating persistence', async () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const updatedAt = new Date('2024-02-01T00:00:00Z');
    const user = User.create({
      email: 'timestamp@example.com',
      name: 'Timestamp',
      createdAt,
      updatedAt,
    });
    if (!user.success) throw new Error('Expected profile');
    expect(await repository.save(user.data)).toEqual({ success: true, data: undefined });
    const loaded = await repository.findById(user.data.id);
    expect(loaded).toMatchObject({
      success: true,
      data: { id: user.data.id, createdAt, updatedAt },
    });
  });
  it('serves creation and sequential normalized duplicate conflict', async () => {
    const created = await request(app)
      .post('/users')
      .send({ email: ' Sequential@Example.com ', name: ' Sequential ' });
    expect(created.status).toBe(201);
    expect(created.body.data.email).toBe('sequential@example.com');
    const duplicate = await request(app)
      .post('/users')
      .send({ email: 'SEQUENTIAL@example.com', name: 'Another' });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('EMAIL_CONFLICT');
  });
  it('maps concurrent unique violations to a single success and conflicts', async () => {
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app).post('/users').send({ email: 'race@example.com', name: 'Race' }),
      ),
    );
    expect(responses.filter((response) => response.status === 201)).toHaveLength(1);
    expect(responses.filter((response) => response.status === 409)).toHaveLength(4);
    const first = User.create({ email: 'direct-race@example.com', name: 'Race' });
    const second = User.create({ email: 'direct-race@example.com', name: 'Race' });
    if (!first.success || !second.success) throw new Error('Expected profiles');
    const saved = await Promise.all([repository.save(first.data), repository.save(second.data)]);
    expect(saved.filter((result) => result.success)).toHaveLength(1);
    expect(saved.find((result) => !result.success)).toMatchObject({
      success: false,
      error: { code: 'EMAIL_CONFLICT' },
    });
  });
  it('reports healthy readiness with the database connected', async () => {
    expect((await request(app).get('/health/ready')).status).toBe(200);
  });
  it('returns safe failure when persistence becomes unavailable', async () => {
    await source.destroy();
    try {
      const response = await request(app)
        .post('/users')
        .send({ email: 'down@example.com', name: 'Down' });
      expect(response.status).toBe(500);
      expect(response.body.error).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
      expect((await request(app).get('/health/ready')).status).toBe(503);
      expect((await request(app).get('/health/live')).status).toBe(200);
    } finally {
      await source.initialize();
    }
  });
});
