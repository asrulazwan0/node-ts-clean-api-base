import type { ZodType } from 'zod';
import { Result } from '../../domain/shared/Result';

export class Validator {
  static validate<T>(schema: ZodType<T>, data: unknown): Result<T> {
    const parsed = schema.safeParse(data);
    if (parsed.success) return Result.success(parsed.data);
    return Result.failure({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }
}
