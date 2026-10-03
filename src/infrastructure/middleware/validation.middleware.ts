import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { Validator } from '../../application/validation/validator';

export const validateRequest =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = Validator.validate(schema, req.body);
    if (!result.success) {
      res.status(400).json({ ...result, requestId: res.locals.requestId });
      return;
    }
    req.body = result.data;
    next();
  };
