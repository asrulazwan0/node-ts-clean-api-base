import { User } from '../entities/User';
import { Result } from '../shared/Result';

export interface IUserRepository {
  findById(id: string): Promise<Result<User>>;
  findByEmail(email: string): Promise<Result<User>>;
  save(user: User): Promise<Result<void>>;
  update(user: User): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
}