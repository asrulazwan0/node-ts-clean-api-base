import { User } from '../../../domain/user/entities/User';
import { UserRepository } from '../../../domain/user/repositories/user-repository';

export interface CreateUserInput {
  email: string;
}

export interface CreateUserOutput {
  id: string;
  email: string;
  createdAt: Date;
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = User.create(input.email);

    // Save user
    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}