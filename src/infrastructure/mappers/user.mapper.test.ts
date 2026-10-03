import { describe, expect, it } from 'vitest';
import { UserEntity } from '../database/entities/user.entity';
import { UserMapper } from './user.mapper';

describe('persisted profile integrity', () => {
  it('refuses invalid persisted data instead of constructing an invalid domain profile', () => {
    const entity = Object.assign(new UserEntity(), { email: 'invalid', name: 'Profile' });
    expect(() => UserMapper.toDomain(entity)).toThrow('Invalid persisted user profile');
  });
});
