import { randomUUID } from 'node:crypto';
import { Result } from '../shared/Result';

export interface IUserProps {
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: IUserProps, id?: string) {
    this.id = id ?? randomUUID();
    this.email = props.email;
    this.name = props.name;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? this.createdAt;
  }

  public static create(props: IUserProps, id?: string): Result<User> {
    const email = props.email.trim().toLowerCase();
    const name = props.name.trim();
    if (email.includes('\0') || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Result.failure({
        code: 'VALIDATION_ERROR',
        message: 'Invalid email address',
        details: [{ field: 'email', message: 'Invalid email address' }],
      });
    }
    if (name.includes('\0')) {
      return Result.failure({
        code: 'VALIDATION_ERROR',
        message: 'Name must not contain NUL characters',
        details: [{ field: 'name', message: 'Name must not contain NUL characters' }],
      });
    }
    if (name.length === 0 || name.length > 100) {
      return Result.failure({
        code: 'VALIDATION_ERROR',
        message: 'Name must contain between 1 and 100 characters',
        details: [{ field: 'name', message: 'Name must contain between 1 and 100 characters' }],
      });
    }
    return Result.success(new User({ ...props, email, name }, id));
  }
}
