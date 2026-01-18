import pino, { Logger as PinoLogger } from 'pino';

export interface Logger {
  info(message: string): void;
  error(message: string, error?: Error): void;
  warn(message: string): void;
}

export class PinoLoggerAdapter implements Logger {
  private logger: PinoLogger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
        }
      } : undefined
    });
  }

  info(message: string): void {
    this.logger.info(message);
  }

  error(message: string, error?: Error): void {
    this.logger.error(error, message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }
}