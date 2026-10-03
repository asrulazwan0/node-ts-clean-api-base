import { User } from '../../../domain/entities/User';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Result, emailConflict, internalError } from '../../../domain/shared/Result';

export interface ICreateUserInput {
  email: string;
  name: string;
}

export interface ICreateUserOutput {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: ICreateUserInput): Promise<Result<ICreateUserOutput>> {
    try {
      const created = User.create(input);
      if (!created.success) return created;
      const user = created.data;
      const existing = await this.userRepository.findByEmail(user.email);
      if (!existing.success) return existing;
      if (existing.data) return Result.failure(emailConflict());
      const saved = await this.userRepository.save(user);
      if (!saved.success) return saved;
      return Result.success({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch {
      return Result.failure(internalError());
    }
  }
}
