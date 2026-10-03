import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { asFunction, asValue, createContainer, type AwilixContainer } from 'awilix';
import { CreateUserUseCase } from './application/user/use-cases/create-user-use-case';
import { CreateUserSchema } from './application/validation/userSchemas';
import { type IUserRepository } from './domain/repositories/IUserRepository';
import { type AppConfig } from './infrastructure/config/app-config';
import { DatabaseConnection } from './infrastructure/database/database-connection';
import { HealthController } from './infrastructure/http/controllers/health-controller';
import { UserController } from './infrastructure/http/controllers/user-controller';
import { PinoLoggerAdapter, type Logger } from './infrastructure/logging/logger';
import { errorHandler } from './infrastructure/middleware/error-handler.middleware';
import { requestLogger } from './infrastructure/middleware/request-logger.middleware';
import { validateRequest } from './infrastructure/middleware/validation.middleware';
import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository';

export interface AppDependencies {
  config: AppConfig;
  logger: Logger;
  database: DatabaseConnection;
  userRepository: IUserRepository;
  createUserUseCase: CreateUserUseCase;
  userController: UserController;
  healthController: HealthController;
}

export type AppContainer = AwilixContainer<AppDependencies>;
export type AppOverrides = Partial<Pick<AppDependencies, 'logger' | 'database' | 'userRepository'>>;

export function createAppContainer(config: AppConfig, overrides: AppOverrides = {}): AppContainer {
  const container = createContainer<AppDependencies>();
  container.register({
    config: asValue(config),
    logger: asFunction(() => overrides.logger ?? new PinoLoggerAdapter(config)).singleton(),
    database: asFunction(() => overrides.database ?? new DatabaseConnection(config)).singleton(),
    userRepository: asFunction(
      ({ database }: AppDependencies) =>
        overrides.userRepository ?? new TypeOrmUserRepository(database),
    ).singleton(),
    createUserUseCase: asFunction(
      ({ userRepository }: AppDependencies) => new CreateUserUseCase(userRepository),
    ).singleton(),
    userController: asFunction(
      ({ createUserUseCase }: AppDependencies) => new UserController(createUserUseCase),
    ).singleton(),
    healthController: asFunction(
      ({ logger }: AppDependencies) =>
        new HealthController(logger, config, container.cradle.database),
    ).singleton(),
  });
  return container;
}

/** Compose HTTP behavior without opening connections, listeners, or process hooks. */
export function createApp(container: AppContainer) {
  const { config, logger, userController, healthController } = container.cradle;
  const app = express();
  app.use(requestLogger(logger));
  app.use(helmet());
  app.set('trust proxy', config.TRUST_PROXY);
  app.use(cors({ origin: config.CORS_ORIGINS }));
  app.get('/health/live', (req, res) => healthController.checkLiveness(req, res));
  app.get(['/health', '/health/ready'], (req, res) => healthController.checkReadiness(req, res));
  app.use(
    rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      limit: config.RATE_LIMIT_MAX_REQUESTS,
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          error: { code: 'RATE_LIMITED', message: 'Too many requests; try again later' },
          requestId: res.locals.requestId,
        });
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json());

  app.post('/users', validateRequest(CreateUserSchema), (req, res) =>
    userController.createUser(req, res),
  );
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
      requestId: res.locals.requestId,
    });
  });
  app.use(errorHandler(logger));
  return app;
}
