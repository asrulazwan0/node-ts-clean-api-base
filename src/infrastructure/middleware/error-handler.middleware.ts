import type { Request, Response, NextFunction } from 'express';
import type { Logger } from '../logging/logger';

export const errorHandler =
  (logger: Logger) =>
  (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
      next(err);
      return;
    }
    const type = typeof err === 'object' && err !== null && 'type' in err ? err.type : undefined;
    if (type === 'entity.parse.failed') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' },
        requestId: res.locals.requestId,
      });
      return;
    }
    if (type === 'entity.too.large') {
      res.status(413).json({
        success: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' },
        requestId: res.locals.requestId,
      });
      return;
    }
    logger.error('Unhandled request error', {
      requestId: res.locals.requestId,
      method: req.method,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      requestId: res.locals.requestId,
    });
  };
