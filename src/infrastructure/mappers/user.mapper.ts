import { User } from '@domain/entities/User';
import { UserEntity } from '../database/entities/user.entity';

export class UserMapper {
  static toEntity(domainUser: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = domainUser.id;
    userEntity.email = domainUser.email;
    userEntity.name = domainUser.name;
    userEntity.password = domainUser.password;
    userEntity.createdAt = domainUser.createdAt;

    return userEntity;
  }

  static toDomain(entityUser: UserEntity): User {
    // Use the User.create factory method to create a new User instance
    const result = User.create({
      email: entityUser.email,
      name: entityUser.name,
      password: entityUser.password,
      createdAt: entityUser.createdAt,
    }, entityUser.id);

    // Since User.create returns a Result, we need to extract the user
    if (result.isSuccess) {
      return result.getValue();
    } else {
      throw new Error(`Failed to create User from entity: ${result.getErrorValue()}`);
    }
  }
}