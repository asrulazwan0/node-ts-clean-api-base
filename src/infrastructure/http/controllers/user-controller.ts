import type { Request, Response } from 'express';
import type { CreateUserUseCase } from '../../../application/user/use-cases/create-user-use-case';

export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async createUser(req: Request, res: Response): Promise<void> {
    const { email, name } = req.body;
    const result = await this.createUserUseCase.execute({ email, name });
    if (!result.success) {
      const status = { VALIDATION_ERROR: 400, EMAIL_CONFLICT: 409, INTERNAL_ERROR: 500 }[
        result.error.code
      ];
      res.status(status).json({ ...result, requestId: res.locals.requestId });
      return;
    }
    res.status(201).json(result);
  }
}
