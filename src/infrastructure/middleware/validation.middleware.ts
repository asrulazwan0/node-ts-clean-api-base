import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { Result } from '../../domain/shared/Result';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error: any) {
      // Extract error details from ZodError
      const errorDetails = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json(
        Result.failure({
          type: 'validation_error',
          message: 'Validation failed',
          errors: errorDetails,
        } as any) // Using 'as any' to bypass TypeScript error temporarily
      );
      return; // Explicitly return to satisfy TypeScript
    }
  };
};