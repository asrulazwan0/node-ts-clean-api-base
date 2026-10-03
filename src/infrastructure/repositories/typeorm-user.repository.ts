import type { Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import type { User } from '../../domain/entities/User';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Result, internalError, emailConflict } from '../../domain/shared/Result';
import type { DatabaseConnection } from '../database/database-connection';
import { UserEntity } from '../database/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

export class TypeOrmUserRepository implements IUserRepository {
  private readonly userRepository: Repository<UserEntity>;

  constructor(databaseConnection: DatabaseConnection) {
    this.userRepository = databaseConnection.getDataSource().getRepository(UserEntity);
  }

  async save(user: User): Promise<Result<void>> {
    try {
      await this.userRepository.insert(UserMapper.toEntity(user));
      return Result.success(undefined);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505' &&
        error.driverError.constraint === 'UQ_users_email'
      ) {
        return Result.failure(emailConflict());
      }
      return Result.failure(internalError());
    }
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    return this.findOne({ email });
  }

  async findById(id: string): Promise<Result<User | null>> {
    return this.findOne({ id });
  }

  private async findOne(
    criteria: { id: string } | { email: string },
  ): Promise<Result<User | null>> {
    try {
      const entity = await this.userRepository.findOneBy(criteria);
      return Result.success(entity ? UserMapper.toDomain(entity) : null);
    } catch {
      return Result.failure(internalError());
    }
  }
}
