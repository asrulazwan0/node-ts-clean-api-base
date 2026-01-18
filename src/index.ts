import express, { Request, Response } from 'express';
import { DatabaseConnection } from './infrastructure/database/database-connection';
import { ConsoleLogger } from './infrastructure/logging/logger';
import { AbstractUserRepository } from './domain/user/repositories/user-repository';
import { User } from './domain/user/entities/User';
import { CreateUserUseCase } from './application/user/use-cases/create-user-use-case';
import { UserController } from './infrastructure/http/controllers/user-controller';

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

const app = express();
app.use(express.json());

// Initialize dependencies
const logger = new ConsoleLogger();
const database = new DatabaseConnection();
const userRepository = new InMemoryUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const userController = new UserController(createUserUseCase);

// Register routes
app.post('/users', (req: Request, res: Response) => userController.createUser(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info('Ready to accept requests');
});