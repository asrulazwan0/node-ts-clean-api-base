import { describe, it, expect } from 'vitest';
import { User } from '../../entities/User';

describe('User Entity', () => {
  it('should create a user with valid properties', () => {
    const email = 'test@example.com';
    const name = 'Test User';
    const password = 'securePassword123';
    const userResult = User.create({
      email,
      name,
      password,
    });

    expect(userResult).toBeDefined();
    expect(userResult.isSuccess).toBe(true);

    if (userResult.isSuccess) {
      const user = userResult.getValue();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.password).toBe(password);
      expect(user.createdAt).toBeInstanceOf(Date);
    }
  });

  it('should allow email, name and password updates', () => {
    const email = 'test@example.com';
    const name = 'Test User';
    const password = 'securePassword123';
    const userResult = User.create({
      email,
      name,
      password,
    });

    expect(userResult.isSuccess).toBe(true);

    if (userResult.isSuccess) {
      const user = userResult.getValue();

      const newEmail = 'newemail@example.com';
      const newName = 'Updated Name';
      const newPassword = 'newSecurePassword456';
      const updatedUserResult = user.updateDetails(newName, newEmail);

      expect(updatedUserResult.isSuccess).toBe(true);
      if (updatedUserResult.isSuccess) {
        const updatedUser = updatedUserResult.getValue();
        expect(updatedUser.email).toBe(newEmail);
        expect(updatedUser.name).toBe(newName);
      }
    }
  });
});