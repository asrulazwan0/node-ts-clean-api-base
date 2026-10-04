import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp, createAppContainer } from '../src/app';
import { loadConfig } from '../src/infrastructure/config/app-config';
import type { IUserRepository } from '../src/domain/repositories/IUserRepository';
import { Result, emailConflict, internalError } from '../src/domain/shared/Result';

function fixture() {
  const userRepository: IUserRepository = {
    findByEmail: vi.fn(async () => Result.success(null)),
    findById: vi.fn(async () => Result.success(null)),
    save: vi.fn(async () => Result.success(undefined)),
  };
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  const app = createApp(
    createAppContainer(loadConfig({ NODE_ENV: 'test', RATE_LIMIT_MAX_REQUESTS: '1000' }), {
      userRepository,
      logger,
    }),
  );
  return { app, userRepository };
}

describe('POST /users', () => {
  it('creates normalized profile with timestamps and no credentials', async () => {
    const { app } = fixture();
    const response = await request(app)
      .post('/users')
      .send({ email: ' Alice@Example.com ', name: ' Alice ' });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        email: 'alice@example.com',
        name: 'Alice',
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
    expect(Object.keys(response.body.data).sort()).toEqual([
      'createdAt',
      'email',
      'id',
      'name',
      'updatedAt',
    ]);
  });
  it.each([
    { email: 'bad', name: 'Alice' },
    { email: 'nul\0@example.com', name: 'Alice' },
    { email: 'alice@example.com', name: 'NUL\0name' },
    { email: 'alice@example.com', name: ' ' },
    { email: 'alice@example.com', name: 'x'.repeat(101) },
    { email: 'alice@example.com', name: 'Alice', password: 'secret' },
    { email: 'alice@example.com', name: 'Alice', extra: true },
    { name: 'Alice' },
  ])('rejects invalid or unknown input %j', async (body) => {
    const { app, userRepository } = fixture();
    const response = await request(app).post('/users').send(body);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: expect.any(Array) },
    });
    expect(response.body.error.details.length).toBeGreaterThan(0);
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
  it('returns documented conflict', async () => {
    const { app, userRepository } = fixture();
    vi.mocked(userRepository.save).mockResolvedValue(Result.failure(emailConflict()));
    const response = await request(app)
      .post('/users')
      .send({ email: 'alice@example.com', name: 'Alice' });
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ success: false, error: { code: 'EMAIL_CONFLICT' } });
  });
  it('returns safe error on database failure', async () => {
    const { app, userRepository } = fixture();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(Result.failure(internalError()));
    const response = await request(app)
      .post('/users')
      .send({ email: 'alice@example.com', name: 'Alice' });
    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
    expect(response.body).not.toHaveProperty('stack');
  });
  it('returns JSON errors for malformed and oversized bodies', async () => {
    const { app } = fixture();
    const malformed = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('{');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe('INVALID_JSON');
    const large = await request(app)
      .post('/users')
      .send({ name: 'a'.repeat(200000) });
    expect(large.status).toBe(413);
    expect(large.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});
