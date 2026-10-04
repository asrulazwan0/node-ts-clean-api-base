import express, { Router, type ErrorRequestHandler } from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import {
  logRouter,
  requestLogger,
} from '../src/infrastructure/middleware/request-logger.middleware';

function fixture() {
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  const app = express();
  app.use(requestLogger(logger));
  const tasks = Router();
  tasks.get('/', (_req, res) => res.sendStatus(200));
  tasks.get('/:id', (_req, res) => res.sendStatus(200));
  tasks.get('/failure/:id', (_req, _res, next) => next(new Error('private-error')));
  tasks.get('/skip/:id', (_req, _res, next) => next());
  app.use('/tasks', logRouter('/tasks', tasks));
  const teams = Router();
  teams.use('/tasks', logRouter('/teams/:teamId/tasks', tasks));
  app.use('/teams/:teamId', logRouter('/teams/:teamId', teams));
  app.get('/tasks/skip/:id', (_req, res) => res.sendStatus(202));
  app.get('/direct/:id', (_req, res) => res.sendStatus(200));
  app.use((_req, res) => res.sendStatus(404));
  const errorHandler: ErrorRequestHandler = (_error, _req, res, _next) => res.sendStatus(500);
  app.use(errorHandler);
  return { app, logger };
}

describe('Request route logging', () => {
  it.each([
    ['/tasks', '/tasks', 200],
    ['/tasks/private-id', '/tasks/:id', 200],
    ['/tasks/failure/private-id', '/tasks/failure/:id', 500],
    ['/tasks/skip/private-id', '/tasks/skip/:id', 202],
    ['/teams/private-team/tasks/private-id', '/teams/:teamId/tasks/:id', 200],
    ['/teams/private-team/tasks/failure/private-id', '/teams/:teamId/tasks/failure/:id', 500],
    ['/direct/private-id', '/direct/:id', 200],
    ['/unknown/private-id', 'unmatched', 404],
  ])('logs safe pattern for %s', async (url, pattern, status) => {
    const { app, logger } = fixture();
    const response = await request(app).get(url + '?token=private-query');
    expect(response.status).toBe(status);
    expect(logger.info).toHaveBeenCalledExactlyOnceWith(
      'HTTP request completed',
      expect.objectContaining({
        route: pattern,
        method: 'GET',
        statusCode: status,
        requestId: response.headers['x-request-id'],
        durationMs: expect.any(Number),
      }),
    );
    const logs = JSON.stringify(logger.info.mock.calls);
    for (const secret of ['private-id', 'private-team', 'private-query', 'private-error'])
      expect(logs).not.toContain(secret);
  });

  it.each([
    ['/', '/', '/'],
    ['/', '/item/private-id', '/item/:id'],
    ['/tasks/', '/tasks/', '/tasks'],
    ['/tasks/', '/tasks/item/private-id', '/tasks/item/:id'],
  ])('normalizes the mount boundary for %s and %s', async (mount, url, pattern) => {
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
    const app = express();
    const router = Router();
    router.get('/', (_req, res) => res.sendStatus(200));
    router.get('/item/:id', (_req, res) => res.sendStatus(200));
    app.use(requestLogger(logger));
    app.use(mount, logRouter(mount, router));
    expect((await request(app).get(url)).status).toBe(200);
    expect(logger.info).toHaveBeenCalledWith(
      'HTTP request completed',
      expect.objectContaining({ route: pattern }),
    );
  });

  it('preserves configured route aliases', async () => {
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
    const router = Router();
    router.get(['/first', '/second'], (_req, res) => res.sendStatus(200));
    // Use a separate app because the fixture already has a terminal 404 handler.
    const aliases = express();
    aliases.use(requestLogger(logger));
    aliases.use('/aliases', logRouter('/aliases', router));
    const response = await request(aliases).get('/aliases/second');
    expect(response.status).toBe(200);
    expect(logger.info).toHaveBeenCalledWith(
      'HTTP request completed',
      expect.objectContaining({ route: ['/aliases/first', '/aliases/second'] }),
    );
  });
});
