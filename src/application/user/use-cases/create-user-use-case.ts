import { User } from '../../../domain/entities/User';
import { AbstractUserRepository } from '../../../domain/user/repositories/user-repository';
import { Result } from '../../../domain/shared/Result';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface CreateUserOutput {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export class CreateUserUseCase {
  constructor(private userRepository: AbstractUserRepository) {}

  async execute(input: CreateUserInput): Promise<Result<CreateUserOutput>> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      return Result.failure({
        type: 'business_rule_violation',
        message: 'User with this email already exists',
      } as any);
    }

    // Create new user
    const userResult = User.create({
      email: input.email,
      name: input.name,
      password: input.password,
    });

    if (!userResult.isSuccess) {
      return Result.failure(userResult.getErrorValue()) as Result<CreateUserOutput>; // Cast the error appropriately
    }

    const user = userResult.getValue();

    // Save user
    await this.userRepository.save(user);

    return Result.success({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  }
}