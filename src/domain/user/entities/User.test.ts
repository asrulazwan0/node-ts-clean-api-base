import { describe, it, expect } from 'vitest';
import { User } from './User';

describe('User Entity', () => {
  it('should create a user with valid properties', () => {
    const email = 'test@example.com';
    const user = User.create(email);

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('should allow email updates', () => {
    const email = 'test@example.com';
    const user = User.create(email);
    
    const newEmail = 'newemail@example.com';
    user.email = newEmail;
    
    expect(user.email).toBe(newEmail);
  });
});