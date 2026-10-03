import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { Logger } from '../logging/logger';

export const requestLogger =
  (logger: Logger) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const start = performance.now();
    const requestId = randomUUID();
    res.locals.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    res.once('finish', () => {
      // Do not log raw URLs, query strings, headers, or request bodies.
      logger.info('HTTP request completed', {
        requestId,
        method: req.method,
        route: req.route?.path ?? 'unmatched',
        statusCode: res.statusCode,
        durationMs: Math.round(performance.now() - start),
      });
    });
    next();
  };
