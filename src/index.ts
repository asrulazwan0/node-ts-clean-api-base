import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createContainer, asClass, asFunction } from 'awilix';
import { DatabaseConnection } from './infrastructure/database/database-connection';
import { PinoLoggerAdapter } from './infrastructure/logging/logger';
import { AbstractUserRepository } from './domain/user/repositories/user-repository';
import { User } from './domain/entities/User';
import { CreateUserUseCase } from './application/user/use-cases/create-user-use-case';
import { UserController } from './infrastructure/http/controllers/user-controller';
import { requestLogger } from './infrastructure/middleware/request-logger.middleware';
import { errorHandler } from './infrastructure/middleware/error-handler.middleware';
import { validateRequest } from './infrastructure/middleware/validation.middleware';
import { UserSchemas } from './application/validation/userSchemas';
import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository';
import { HealthController } from './infrastructure/http/controllers/health-controller';
import { loadConfig } from './infrastructure/config/app-config';

let server: any;

async function bootstrap() {
  // Load configuration
  const config = loadConfig();

  // Create the DI container
  const container = createContainer();

  // Register dependencies
  container.register({
    logger: asClass(PinoLoggerAdapter).singleton(),
    database: asClass(DatabaseConnection).singleton(),
    userRepository: asClass(TypeOrmUserRepository).singleton(),
    createUserUseCase: asClass(CreateUserUseCase).singleton(),
    userController: asClass(UserController).singleton(),
    healthController: asClass(HealthController).singleton(),
    config: asFunction(() => config).singleton(),
    requestLogger: asFunction((cradle) => requestLogger(cradle.logger)),
    errorHandler: asFunction((cradle) => errorHandler(cradle.logger))
  });

  // Initialize database connection
  const database = container.cradle.database;
  await database.connect();

  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Rate limiting middleware
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS, // Configurable window
    max: config.RATE_LIMIT_MAX_REQUESTS, // Configurable max requests
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
  });
  app.use(limiter);

  // Body parsing middleware
  app.use(express.json());
  app.use(container.cradle.requestLogger);

  // Initialize dependencies
  const logger = container.cradle.logger;
  const userController = container.cradle.userController;
  const healthController = container.cradle.healthController;

  // Register routes
  app.get('/health', (req: Request, res: Response) => healthController.checkHealth(req, res));
  app.post('/users', validateRequest(UserSchemas.createUser), (req: Request, res: Response) => userController.createUser(req, res));

  // Error handling middleware (should be registered last)
  app.use(container.cradle.errorHandler);

  // Graceful shutdown handling
  server = app.listen(config.PORT, () => {
    logger.info(`Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    logger.info('Ready to accept requests');
  });

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await database.disconnect();
    server.close(() => {
      logger.info('Process terminated');
    });
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await database.disconnect();
    server.close(() => {
      logger.info('Process terminated');
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
  });
}

// Call the bootstrap function
bootstrap().catch(error => {
  console.error('Bootstrap error:', error);
  process.exit(1);
});

// Export for testing purposes
export { server };