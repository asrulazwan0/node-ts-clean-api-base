import { User } from '../../../domain/entities/User';
import { AbstractUserRepository } from '../../../domain/user/repositories/user-repository';
import { DatabaseConnection } from '../database/database-connection';
import { UserEntity } from '../database/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

export class TypeOrmUserRepository extends AbstractUserRepository {
  private userRepository: any;

  constructor(databaseConnection: DatabaseConnection) {
    super();
    this.userRepository = databaseConnection.getDataSource().getRepository(UserEntity);
  }

  async save(user: User): Promise<void> {
    const userEntity = UserMapper.toEntity(user);
    await this.userRepository.save(userEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOneBy({ email });
    if (!userEntity) {
      return null;
    }
    return UserMapper.toDomain(userEntity);
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOneBy({ id });
    if (!userEntity) {
      return null;
    }
    return UserMapper.toDomain(userEntity);
  }
}