import { User } from '../../domain/entities/User';
import { UserEntity } from '../database/entities/user.entity';

export class UserMapper {
  static toEntity(user: User): UserEntity {
    return Object.assign(new UserEntity(), {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  static toDomain(entity: UserEntity): User {
    const result = User.create(
      {
        email: entity.email,
        name: entity.name,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
      entity.id,
    );
    if (!result.success) throw new Error('Invalid persisted user profile');
    return result.data;
  }
}
