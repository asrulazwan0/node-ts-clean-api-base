import { type Request, type Response } from 'express';
import { type Logger } from '../../logging/logger';
import { type AppConfig } from '../../config/app-config';
import { type DatabaseConnection } from '../../database/database-connection';

export class HealthController {
  constructor(
    private readonly logger: Logger,
    private readonly config: AppConfig,
    private readonly database: Pick<DatabaseConnection, 'isReady'>,
  ) {}

  checkLiveness(_req: Request, res: Response): void {
    res.status(200).json({ status: 'ok' });
  }

  async checkReadiness(_req: Request, res: Response): Promise<void> {
    const ready = await this.database.isReady();
    if (!ready) this.logger.warn('Readiness check failed');
    res.status(ready ? 200 : 503).json({
      status: ready ? 'ok' : 'unavailable',
      environment: this.config.NODE_ENV,
    });
  }
}
