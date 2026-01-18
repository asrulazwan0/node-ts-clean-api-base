import { z, ZodSchema } from 'zod';
import { Result } from '../../domain/shared/Result';

export class Validator {
  static validate<T>(schema: ZodSchema<T>, data: unknown): Result<T> {
    try {
      const parsedData = schema.parse(data);
      return Result.success(parsedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join(', ');
        return Result.failure(errorMessages);
      }
      return Result.failure('Validation failed');
    }
  }
}

export default Validator;