import { describe, expect, it, vi } from 'vitest';
import { CreateUserUseCase } from './create-user-use-case';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Result, emailConflict, internalError } from '../../../domain/shared/Result';
import { User } from '../../../domain/entities/User';

function repository(): IUserRepository {
  return {
    findByEmail: vi.fn(async () => Result.success(null)),
    findById: vi.fn(async () => Result.success(null)),
    save: vi.fn(async () => Result.success(undefined)),
  };
}
const input = { email: ' A@Example.com ', name: ' Alice ' };

describe('CreateUserUseCase', () => {
  it('normalizes before lookup and persists a profile', async () => {
    const repo = repository();
    const result = await new CreateUserUseCase(repo).execute(input);
    expect(repo.findByEmail).toHaveBeenCalledWith('a@example.com');
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@example.com', name: 'Alice' }),
    );
    expect(result).toMatchObject({
      success: true,
      data: {
        email: 'a@example.com',
        name: 'Alice',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    });
  });
  it('does not access persistence for an invalid profile', async () => {
    const repo = repository();
    expect(await new CreateUserUseCase(repo).execute({ ...input, name: ' ' })).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });
  it('returns conflict for existing email', async () => {
    const repo = repository();
    const user = User.create(input);
    if (!user.success) throw new Error('Expected user');
    vi.mocked(repo.findByEmail).mockResolvedValue(Result.success(user.data));
    expect(await new CreateUserUseCase(repo).execute(input)).toEqual(
      Result.failure(emailConflict()),
    );
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('preserves the uniqueness race result from persistence', async () => {
    const repo = repository();
    vi.mocked(repo.save).mockResolvedValue(Result.failure(emailConflict()));
    expect(await new CreateUserUseCase(repo).execute(input)).toEqual(
      Result.failure(emailConflict()),
    );
  });
  it.each(['findByEmail', 'save'] as const)(
    'returns safe typed failure when %s fails',
    async (method) => {
      const repo = repository();
      vi.mocked(repo[method]).mockRejectedValue(new Error('postgres password=secret'));
      expect(await new CreateUserUseCase(repo).execute(input)).toEqual(
        Result.failure(internalError()),
      );
    },
  );
  it('returns failed lookup without saving', async () => {
    const repo = repository();
    vi.mocked(repo.findByEmail).mockResolvedValue(Result.failure(internalError()));
    expect(await new CreateUserUseCase(repo).execute(input)).toEqual(
      Result.failure(internalError()),
    );
    expect(repo.save).not.toHaveBeenCalled();
  });
});
