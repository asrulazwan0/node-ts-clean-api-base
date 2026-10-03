import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp, createAppContainer } from '../src/app';
import { loadConfig } from '../src/infrastructure/config/app-config';
import { Result } from '../src/domain/shared/Result';

function fixture(environment: NodeJS.ProcessEnv = {}) {
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  const app = createApp(
    createAppContainer(loadConfig({ NODE_ENV: 'test', ...environment }), {
      logger,
      userRepository: {
        findByEmail: async () => Result.success(null),
        findById: async () => Result.success(null),
        save: async () => Result.success(undefined),
      },
    }),
  );
  return { app, logger };
}

describe('HTTP security and observability', () => {
  it('correlates malformed input and logs without storing bodies or query secrets', async () => {
    const { app, logger } = fixture();
    const response = await request(app)
      .post('/users?token=private-query')
      .set('Authorization', 'Bearer private-token')
      .set('Content-Type', 'application/json')
      .send('{private-body');
    expect(response.status).toBe(400);
    expect(response.headers['x-request-id']).toMatch(/^[\da-f-]{36}$/);
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
    const logs = JSON.stringify(logger.info.mock.calls);
    expect(logs).toContain(response.headers['x-request-id']);
    expect(logs).not.toMatch(/private-query|private-token|private-body/);
  });
  it('generates correlation IDs instead of trusting client-controlled identifiers', async () => {
    const { app } = fixture();
    const response = await request(app).get('/health/live').set('X-Request-Id', 'attacker-chosen');
    expect(response.headers['x-request-id']).not.toBe('attacker-chosen');
  });
  it('returns consistent JSON 404s', async () => {
    const { app } = fixture();
    const response = await request(app).get('/missing');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'NOT_FOUND' },
      requestId: expect.any(String),
    });
  });
  it('limits business requests without making liveness probes fail', async () => {
    const { app } = fixture({ RATE_LIMIT_MAX_REQUESTS: '1' });
    await request(app).post('/users').send({});
    const limited = await request(app).post('/users').send({});
    expect(limited.status).toBe(429);
    expect(limited.body).toMatchObject({
      success: false,
      error: { code: 'RATE_LIMITED' },
      requestId: expect.any(String),
    });
    expect((await request(app).get('/health/live')).status).toBe(200);
  });
  it('allows only configured browser origins and includes security headers', async () => {
    const { app } = fixture({ CORS_ORIGINS: 'https://client.example' });
    const allowed = await request(app).get('/health/live').set('Origin', 'https://client.example');
    expect(allowed.headers['access-control-allow-origin']).toBe('https://client.example');
    expect(allowed.headers['x-content-type-options']).toBe('nosniff');
    const denied = await request(app).get('/health/live').set('Origin', 'https://other.example');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});
