import { Request, Response } from 'express';
import { PinoLoggerAdapter } from '../../logging/logger';

export class HealthController {
  constructor(private logger: PinoLoggerAdapter) {}

  async checkHealth(req: Request, res: Response) {
    try {
      // Perform any necessary health checks here
      // For example, database connectivity, external service availability, etc.
      
      const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        version: process.env.npm_package_version || 'unknown',
        environment: process.env.NODE_ENV || 'unknown',
      };

      this.logger.info('Health check requested', { timestamp: healthCheck.timestamp });

      res.status(200).send(healthCheck);
    } catch (error) {
      this.logger.error('Health check failed', { error: (error as Error).message });

      res.status(503).send({
        uptime: process.uptime(),
        message: 'Service Unavailable',
        timestamp: Date.now(),
        error: (error as Error).message,
      });
    }
  }
}