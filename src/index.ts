import express, { Request, Response } from 'express';
import { createContainer, asClass, asFunction, asValue } from 'awilix';
import { DatabaseConnection } from './infrastructure/database/database-connection';
import { PinoLoggerAdapter } from './infrastructure/logging/logger';
import { AbstractUserRepository } from './domain/user/repositories/user-repository';
import { User } from './domain/user/entities/User';
import { CreateUserUseCase } from './application/user/use-cases/create-user-use-case';
import { UserController } from './infrastructure/http/controllers/user-controller';
import { requestLogger } from './infrastructure/middleware/request-logger.middleware';
import { errorHandler } from './infrastructure/middleware/error-handler.middleware';

// Mock implementation of the user repository for demonstration
class InMemoryUserRepository extends AbstractUserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }
}

// Create the DI container
const container = createContainer();

// Register dependencies
container.register({
  logger: asClass(PinoLoggerAdapter).singleton(),
  database: asClass(DatabaseConnection).singleton(),
  userRepository: asClass(InMemoryUserRepository).singleton(),
  createUserUseCase: asClass(CreateUserUseCase).singleton(),
  userController: asClass(UserController).singleton(),
  requestLogger: asFunction((cradle) => requestLogger(cradle.logger)),
  errorHandler: asFunction((cradle) => errorHandler(cradle.logger))
});

const app = express();

// Middleware
app.use(express.json());
app.use(container.cradle.requestLogger);

// Initialize dependencies
const logger = container.resolve<PinoLoggerAdapter>('logger');
const userController = container.resolve<UserController>('userController');

// Register routes
app.post('/users', (req: Request, res: Response) => userController.createUser(req, res));

// Error handling middleware (should be registered last)
app.use(container.cradle.errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info('Ready to accept requests');
});