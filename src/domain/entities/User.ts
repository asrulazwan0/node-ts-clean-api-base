import { Result } from '../shared/Result';

export interface UserProps {
  id?: string;
  email: string;
  name: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly password: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: UserProps, id?: string) {
    this.email = props.email;
    this.name = props.name;
    this.password = props.password;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    
    // If no ID is provided, we'll generate one in the factory method
    this.id = id ?? crypto.randomUUID();
  }

  public static create(props: UserProps, id?: string): Result<User> {
    // Basic validation
    if (!props.email || !props.email.includes('@')) {
      return Result.failure('Invalid email address');
    }

    if (!props.name || props.name.trim().length === 0) {
      return Result.failure('Name cannot be empty');
    }

    if (!props.password || props.password.length < 6) {
      return Result.failure('Password must be at least 6 characters');
    }

    const user = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: new Date(),
      },
      id
    );

    return Result.success(user);
  }

  public updateDetails(name: string, email: string): Result<void> {
    if (!email || !email.includes('@')) {
      return Result.failure('Invalid email address');
    }

    if (!name || name.trim().length === 0) {
      return Result.failure('Name cannot be empty');
    }

    this.name = name;
    this.email = email;
    this.updatedAt = new Date();

    return Result.success();
  }

  public changePassword(currentPassword: string, newPassword: string): Result<void> {
    if (currentPassword === newPassword) {
      return Result.failure('New password must be different from current password');
    }

    if (!newPassword || newPassword.length < 6) {
      return Result.failure('Password must be at least 6 characters');
    }

    this.password = newPassword;
    this.updatedAt = new Date();

    return Result.success();
  }
}