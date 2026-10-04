import { describe, it, expect } from 'vitest';
import { User } from '../../entities/User';

describe('User profile', () => {
  it('normalizes profile fields without credentials', () => {
    const result = User.create({ email: '  Test@Example.com ', name: ' Test User ' });
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('Expected success');
    expect(result.data.email).toBe('test@example.com');
    expect(result.data.name).toBe('Test User');
    expect(result.data).not.toHaveProperty('password');
    expect(result.data.id).toMatch(/^[a-f0-9-]{36}$/);
  });

  it.each([
    { email: 'invalid', name: 'User' },
    { email: 'nul\0@example.com', name: 'User' },
    { email: 'a@example.com', name: 'NUL\0name' },
    { email: 'a@example.com', name: '   ' },
    { email: 'a@example.com', name: 'x'.repeat(101) },
  ])('rejects invalid profile %j', (input) => {
    expect(User.create(input)).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('preserves persisted identity and timestamps', () => {
    const createdAt = new Date('2024-01-01');
    const updatedAt = new Date('2024-02-01');
    const result = User.create(
      { email: 'a@example.com', name: 'A', createdAt, updatedAt },
      'existing-id',
    );
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('Expected success');
    expect(result.data).toMatchObject({ id: 'existing-id', createdAt, updatedAt });
  });
});
