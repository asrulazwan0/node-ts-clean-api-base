import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logging/logger';

export const requestLogger = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    logger.info(`${req.method} ${req.path} - Request received`);
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info(`${req.method} ${req.path} - Response sent with status ${res.statusCode} (${duration}ms)`);
    });
    
    next();
  };
};