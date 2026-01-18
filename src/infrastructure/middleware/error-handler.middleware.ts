import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logging/logger';

export const errorHandler = (logger: Logger) => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error occurred: ${err.message}`, err);

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500
      ? 'Internal server error'
      : err.message || 'Something went wrong';

    res.status(statusCode).json({
      error: message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  };
};