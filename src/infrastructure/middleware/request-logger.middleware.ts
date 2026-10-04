import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction, RequestHandler, Router } from 'express';
import type { Logger } from '../logging/logger';

const mountedPatterns = new WeakMap<Response, string | string[]>();

/** Wrap a mounted router with its configured mount pattern, never a request URL. */
export function logRouter(mountPattern: string, router: Router): RequestHandler {
  return (req, res, next) => {
    const prefix = mountPattern.replace(/\/+$/, '');
    const previous = mountedPatterns.get(res);
    const recordPattern = () => {
      // A nested router records its complete pattern first.
      if (mountedPatterns.has(res)) return;
      const path: unknown = req.route?.path;
      const join = (leaf: string) => (leaf === '/' ? prefix || '/' : prefix + leaf);
      if (typeof path === 'string') mountedPatterns.set(res, join(path));
      else if (Array.isArray(path) && path.every((leaf) => typeof leaf === 'string'))
        mountedPatterns.set(res, path.map(join));
    };
    // Capture while the router still owns the request, before the completion logger.
    res.prependOnceListener('finish', recordPattern);
    router(req, res, (error?: unknown) => {
      res.removeListener('finish', recordPattern);
      if (error) recordPattern();
      else if (previous) mountedPatterns.set(res, previous);
      else mountedPatterns.delete(res);
      next(error);
    });
  };
}

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
        route: mountedPatterns.get(res) ?? req.route?.path ?? 'unmatched',
        statusCode: res.statusCode,
        durationMs: Math.round(performance.now() - start),
      });
    });
    next();
  };
