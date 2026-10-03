import pino, { type DestinationStream, type Logger as PinoLogger } from 'pino';
import type { AppConfig } from '../config/app-config';

export type LogFields = Record<string, unknown>;
export interface Logger {
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  debug(message: string, fields?: LogFields): void;
}

export class PinoLoggerAdapter implements Logger {
  private readonly logger: PinoLogger;

  constructor(config: AppConfig, destination?: DestinationStream) {
    const options: pino.LoggerOptions = {
      level: config.LOG_LEVEL,
      redact: {
        paths: [
          'password',
          'token',
          'authorization',
          'cookie',
          'DB_PASSWORD',
          '*.password',
          '*.token',
          '*.authorization',
          '*.cookie',
          'req.headers.authorization',
          'req.headers.cookie',
        ],
        censor: '[REDACTED]',
      },
      ...(config.NODE_ENV === 'development' && !destination
        ? {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
            },
          }
        : {}),
    };
    this.logger = destination ? pino(options, destination) : pino(options);
  }

  info(message: string, fields: LogFields = {}): void {
    this.logger.info(fields, message);
  }
  warn(message: string, fields: LogFields = {}): void {
    this.logger.warn(fields, message);
  }
  error(message: string, fields: LogFields = {}): void {
    this.logger.error(fields, message);
  }
  debug(message: string, fields: LogFields = {}): void {
    this.logger.debug(fields, message);
  }
}
